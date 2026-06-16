"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@soustools/ui";
import { X, Loader2 } from "lucide-react";
import { DeviceSettingsForm } from "./device-settings-form";

interface DeviceSettingsDialogProps {
  isOpen: boolean;
  deviceId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeviceSettingsDialog: React.FC<DeviceSettingsDialogProps> = ({
  isOpen,
  deviceId,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [hour, setHour] = useState(2);
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deviceId) return;
    const fetchDevice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/signage/devices/${deviceId}`);
        const result = await res.json();
        if (result.success && result.data) {
          const d = result.data;
          setName(d.name || "");
          setTimezone(d.timezone || "UTC");
          const mw = d.maintenance_window || d.maintenanceWindow || {};
          setHour(mw.hour !== undefined ? mw.hour : 2);
          setMinute(mw.minute !== undefined ? mw.minute : 0);
          setDayOfWeek(
            mw.dayOfWeek !== null && mw.dayOfWeek !== undefined
              ? String(mw.dayOfWeek)
              : "all"
          );
        } else {
          setError(result.error || "Failed to load settings.");
        }
      } catch {
        setError("Network error. Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [isOpen, deviceId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        timezone,
        maintenanceWindow: {
          hour,
          minute,
          dayOfWeek: dayOfWeek === "all" ? null : parseInt(dayOfWeek, 10),
        },
      };
      const res = await fetch(`/api/signage/devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        alert("Settings saved successfully!");
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Failed to save.");
      }
    } catch {
      setError("Network error. Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative space-y-4 text-slate-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-md font-bold text-slate-100">Device Settings</h3>
        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900 p-2 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <DeviceSettingsForm
              name={name}
              setName={setName}
              timezone={timezone}
              setTimezone={setTimezone}
              hour={hour}
              setHour={setHour}
              minute={minute}
              setMinute={setMinute}
              dayOfWeek={dayOfWeek}
              setDayOfWeek={setDayOfWeek}
            />
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
