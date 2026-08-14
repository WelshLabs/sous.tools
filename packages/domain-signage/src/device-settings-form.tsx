"use client";

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
const DAYs = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
        <label className="text-muted-foreground block text-xs">
          Device Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background border-border text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label className="text-muted-foreground block text-xs">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="bg-background border-border text-foreground focus:border-primary w-full cursor-pointer rounded-lg border px-3 py-2 text-xs focus:outline-none"
        >
          {TZs.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-muted-foreground block text-xs">
          Maintenance Window
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-muted-foreground mb-0.5 block text-[10px]">
              Hour
            </label>
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              className="bg-background border-border text-foreground w-full cursor-pointer rounded-lg border px-2 py-1.5 text-xs focus:outline-none"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-0.5 block text-[10px]">
              Minute
            </label>
            <select
              value={minute}
              onChange={(e) => setMinute(parseInt(e.target.value, 10))}
              className="bg-background border-border text-foreground w-full cursor-pointer rounded-lg border px-2 py-1.5 text-xs focus:outline-none"
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i} value={i}>
                  :{String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-0.5 block text-[10px]">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="bg-background border-border text-foreground w-full cursor-pointer rounded-lg border px-2 py-1.5 text-xs focus:outline-none"
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
