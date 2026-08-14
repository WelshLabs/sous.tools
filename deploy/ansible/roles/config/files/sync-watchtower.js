#!/usr/bin/env node
/**
 * sync-watchtower.js
 * Syncs Watchtower cron container and local user crontab for TV power scripts
 * with Supabase device settings. Also triggers ansible-pull during the
 * configured maintenance window for automated system self-updates.
 */

const fs = require("fs");
const { execSync } = require("child_process");

let SUPABASE_URL = process.env.SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const ENV_FILE = "/etc/sous-tenant/sous-tenant.env";
if (fs.existsSync(ENV_FILE)) {
  fs.readFileSync(ENV_FILE, "utf8")
    .split("\n")
    .forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts
          .slice(1)
          .join("=")
          .trim()
          .replace(/^['"]|['"]$/g, "");
        if (key === "SUPABASE_URL") SUPABASE_URL = val;
        if (key === "SUPABASE_ANON_KEY") SUPABASE_ANON_KEY = val;
        if (key === "DEVICE_ID") deviceId = val;
      }
    });
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("[Sync] Device not paired or missing credentials. Waiting...");
  process.exit(0);
}

let lastCron = null;
let lastTimezone = null;
let lastOperatingHours = null;

/** Returns true if current time falls within the maintenance window. */
function isInMaintenanceWindow(mw, timezone) {
  const now = new Date();
  const localHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    }).format(now),
  );
  const targetHour = mw.hour !== undefined ? mw.hour : 2;
  return localHour === targetHour;
}

// ansible-pull logic removed in SaaS architecture

async function checkAndSync() {
  try {
    console.log(`[Sync] Fetching settings for device ${deviceId}...`);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/signage_devices?id=eq.${deviceId}&select=timezone,maintenance_window,operating_hours`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!res.ok)
      throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data || data.length === 0) return;

    const device = data[0];
    const timezone = device.timezone || "UTC";
    const mw = device.maintenance_window || {};
    const oh = device.operating_hours || {
      sleep_hour: 22,
      sleep_minute: 0,
      wake_hour: 6,
      wake_minute: 0,
    };

    const baseHour = mw.hour !== undefined ? mw.hour : 2;
    const baseMinute = mw.minute !== undefined ? mw.minute : 0;
    const dayOfWeek =
      mw.day_of_week !== undefined &&
      mw.day_of_week !== null &&
      mw.day_of_week !== "*"
        ? mw.day_of_week
        : "*";

    const jitter = Math.floor(Math.random() * 31);
    const totalMinutes = baseMinute + jitter;
    const scheduledMinute = totalMinutes % 60;
    const scheduledHour = (baseHour + Math.floor(totalMinutes / 60)) % 24;
    const cronSchedule = `0 ${scheduledMinute} ${scheduledHour} * * ${dayOfWeek}`;

    let updated = false;

    if (cronSchedule !== lastCron || timezone !== lastTimezone) {
      console.log(
        `[Sync] Updating Watchtower: Cron="${cronSchedule}", TZ="${timezone}"`,
      );
      try {
        execSync("docker rm -f watchtower", { stdio: "ignore" });
      } catch (_) {}
      execSync(
        `docker run -d --name watchtower --restart always -v /var/run/docker.sock:/var/run/docker.sock -e TZ="${timezone}" containrrr/watchtower --cleanup --schedule "${cronSchedule}"`,
      );
      lastCron = cronSchedule;
      lastTimezone = timezone;
      updated = true;
    }

    const ohString = JSON.stringify(oh);
    if (ohString !== lastOperatingHours) {
      console.log(
        `[Sync] Updating crontab: Sleep ${oh.sleep_hour}:${oh.sleep_minute}, Wake ${oh.wake_hour}:${oh.wake_minute}`,
      );
      const cronContent = `# Generated\n${oh.wake_minute} ${oh.wake_hour} * * * /home/soustools/signage/tv-wake.sh >> /home/soustools/signage/tv-power.log 2>&1\n${oh.sleep_minute} ${oh.sleep_hour} * * * /home/soustools/signage/tv-sleep.sh >> /home/soustools/signage/tv-power.log 2>&1\n`;
      fs.writeFileSync("/tmp/soustools-cron", cronContent);
      execSync("crontab -u soustools /tmp/soustools-cron");
      fs.unlinkSync("/tmp/soustools-cron");
      lastOperatingHours = ohString;
      updated = true;
    }

    // Docker containers are automatically updated by Watchtower.

    if (!updated) console.log("[Sync] Settings unchanged.");
  } catch (err) {
    console.error(`[Sync] Sync failed:`, err);
  }
}

checkAndSync();
setInterval(checkAndSync, 10 * 60 * 1000);
