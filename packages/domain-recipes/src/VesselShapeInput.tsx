import React from "react";

interface VesselShapeInputProps {
  shape: "ROUND" | "RECTANGULAR";
  setShape: (v: "ROUND" | "RECTANGULAR") => void;
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export const VesselShapeInput: React.FC<VesselShapeInputProps> = ({
  shape,
  setShape,
  labelStyle,
  inputStyle,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={labelStyle}>
        Pan Shape
      </label>
      <select
        value={shape}
        onChange={(e) => setShape(e.target.value as "ROUND" | "RECTANGULAR")}
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={inputStyle}
      >
        <option value="RECTANGULAR">Rectangular / Square</option>
        <option value="ROUND">Round</option>
      </select>
    </div>
  );
};
