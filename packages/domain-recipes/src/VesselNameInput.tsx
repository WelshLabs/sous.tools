import React from "react";

interface VesselNameInputProps {
  name: string;
  setName: (v: string) => void;
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export const VesselNameInput: React.FC<VesselNameInputProps> = ({
  name,
  setName,
  labelStyle,
  inputStyle,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={labelStyle}>
        Vessel Name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. 9'' Pullman Pan"
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={inputStyle}
        required
      />
    </div>
  );
};
