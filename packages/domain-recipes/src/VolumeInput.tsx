import React from "react";

interface VolumeInputProps {
  volumeMl: string;
  setVolumeMl: (v: string) => void;
  volumeUnit: "ml" | "g";
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export const VolumeInput: React.FC<VolumeInputProps> = ({
  volumeMl,
  setVolumeMl,
  volumeUnit,
  labelStyle,
  inputStyle,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={labelStyle}>
        Volume Capacity ({volumeUnit})
      </label>
      <input
        type="number"
        value={volumeMl}
        onChange={(e) => setVolumeMl(e.target.value)}
        placeholder={volumeUnit}
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={inputStyle}
        required
      />
    </div>
  );
};
