#!/usr/bin/env node
/**
 * sync-watchtower.js
 * Synchronizes the Watchtower container cron schedule with the device settings in Supabase.
 * Reads device ID from /etc/sous-device-id, queries Supabase, applies random jitter, and restarts Watchtower.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load Secrets from Environment or File
let SUPABASE_URL = process.env.SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const ENV_FILE = '/etc/sous-secrets.env';
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'SUPABASE_URL') SUPABASE_URL = val;
      if (key === 'SUPABASE_ANON_KEY') SUPABASE_ANON_KEY = val;
    }
  });
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Sync] Error: SUPABASE_URL or SUPABASE_ANON_KEY is not defined.');
  process.exit(1);
}

// 2. Read Device ID
const DEVICE_ID_FILE = '/etc/sous-device-id';
let deviceId = null;

try {
  if (fs.existsSync(DEVICE_ID_FILE)) {
    deviceId = fs.readFileSync(DEVICE_ID_FILE, 'utf8').trim();
  } else {
    // If it doesn't exist, try reading a local placeholder
    deviceId = 'd0000000-0000-0000-0000-000000000010'; // Default test device ID
    console.warn(`[Sync] Warning: ${DEVICE_ID_FILE} not found. Defaulting to: ${deviceId}`);
  }
} catch (err) {
  console.error(`[Sync] Error reading device ID:`, err);
  process.exit(1);
}

let lastCron = null;
let lastTimezone = null;

// 3. Fetch Settings and Sync
async function checkAndSync() {
  try {
    console.log(`[Sync] Fetching settings for device ${deviceId}...`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/signage_devices?id=eq.${deviceId}&select=timezone,maintenance_window`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      console.warn(`[Sync] No device settings found for ID: ${deviceId}`);
      return;
    }

    const device = data[0];
    const timezone = device.timezone || 'UTC';
    const mw = device.maintenance_window || {};
    
    const baseHour = mw.hour !== undefined ? mw.hour : 2;
    const baseMinute = mw.minute !== undefined ? mw.minute : 0;
    const dayOfWeek = (mw.day_of_week !== undefined && mw.day_of_week !== null && mw.day_of_week !== '*') 
      ? mw.day_of_week 
      : '*';

    // Apply random 0-30 min jitter
    const jitter = Math.floor(Math.random() * 31);
    const totalMinutes = baseMinute + jitter;
    const scheduledMinute = totalMinutes % 60;
    const scheduledHour = (baseHour + Math.floor(totalMinutes / 60)) % 24;
    const scheduledSecond = 0;

    // Watchtower cron format: Second Minute Hour DayOfMonth Month DayOfWeek
    const cronSchedule = `${scheduledSecond} ${scheduledMinute} ${scheduledHour} * * ${dayOfWeek}`;

    if (cronSchedule === lastCron && timezone === lastTimezone) {
      console.log(`[Sync] Settings unchanged (Cron: "${cronSchedule}", TZ: "${timezone}"). Skipping update.`);
      return;
    }

    console.log(`[Sync] Updating Watchtower: Cron="${cronSchedule}", Timezone="${timezone}" (Jitter added: +${jitter}m)`);
    
    // Stop and remove existing Watchtower
    try {
      execSync('docker rm -f watchtower', { stdio: 'ignore' });
    } catch (_) {}

    // Run new Watchtower container
    const dockerCmd = `docker run -d \\
      --name watchtower \\
      --restart always \\
      -v /var/run/docker.sock:/var/run/docker.sock \\
      -e TZ="${timezone}" \\
      containrrr/watchtower \\
      --cleanup \\
      --schedule "${cronSchedule}"`;

    execSync(dockerCmd);
    console.log(`[Sync] Watchtower container successfully configured and started.`);

    lastCron = cronSchedule;
    lastTimezone = timezone;

  } catch (err) {
    console.error(`[Sync] Synchronization failed:`, err);
  }
}

// Initial Sync
checkAndSync();

// Poll every 10 minutes
setInterval(checkAndSync, 10 * 60 * 1000);
