"use client";

import React from "react";

interface DeviceSettingsFormProps {
  name: string;
  setName: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  hour: number;
  setHour: (v: number) => void;
  minute: number;
  setMinute: (v: number) => void;
  dayOfWeek: string;
  setDayOfWeek: (v: string) => void;
}

const TZs = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
];
const DAYs = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DeviceSettingsForm: React.FC<DeviceSettingsFormProps> = ({
  name,
  setName,
  timezone,
  setTimezone,
  hour,
  setHour,
  minute,
  setMinute,
  dayOfWeek,
  setDayOfWeek,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs text-zinc-400">Device Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-zinc-400">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary cursor-pointer"
        >
          {TZs.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-zinc-400">Maintenance Window</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5">Hour</label>
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5">Minute</label>
            <select
              value={minute}
              onChange={(e) => setMinute(parseInt(e.target.value, 10))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i} value={i}>
                  :{String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              <option value="all">Every Day</option>
              {DAYs.map((d, i) => (
                <option key={i} value={String(i)}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
