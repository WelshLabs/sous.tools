"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@soustools/design-system";
import { X, Loader2 } from "lucide-react";
import { DeviceSettingsForm } from "./device-settings-form";

export interface DeviceSettingsDialogProps {
  isOpen: boolean;
  deviceId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  onFetchDevice?: (deviceId: string) => Promise<any>;
  onSaveDevice?: (deviceId: string, payload: any) => Promise<void>;
}

export const DeviceSettingsDialog: React.FC<DeviceSettingsDialogProps> = ({
  isOpen,
  deviceId,
  onClose,
  onSuccess,
  onFetchDevice,
  onSaveDevice,
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
    if (!isOpen || !deviceId || !onFetchDevice) return;
    const loadDevice = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await onFetchDevice(deviceId);
        if (result) {
          setName(result.name || "");
          setTimezone(result.timezone || "UTC");
          const mw = result.maintenance_window || result.maintenanceWindow || {};
          setHour(mw.hour !== undefined ? mw.hour : 2);
          setMinute(mw.minute !== undefined ? mw.minute : 0);
          setDayOfWeek(
            mw.dayOfWeek !== null && mw.dayOfWeek !== undefined
              ? String(mw.dayOfWeek)
              : "all"
          );
        } else {
          setError("Failed to load settings.");
        }
      } catch {
        setError("Network error. Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    loadDevice();
  }, [isOpen, deviceId, onFetchDevice]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !onSaveDevice) return;
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
      await onSaveDevice(deviceId, payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Network error. Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-2xl relative space-y-4 text-foreground"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-md font-bold text-foreground">Device Settings</h3>
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded">
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
