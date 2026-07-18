import React from "react";

interface DimensionInputsProps {
  shape: "ROUND" | "RECTANGULAR";
  unitSystem: "cm" | "in";
  length: string;
  setLength: (v: string) => void;
  width: string;
  setWidth: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  diameter: string;
  setDiameter: (v: string) => void;
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export const DimensionInputs: React.FC<DimensionInputsProps> = ({
  shape,
  unitSystem,
  length,
  setLength,
  width,
  setWidth,
  height,
  setHeight,
  diameter,
  setDiameter,
  labelStyle,
  inputStyle,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {shape === "RECTANGULAR" ? (
        <>
          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Length ({unitSystem})
            </label>
            <input
              type="number"
              step="any"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Length"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Width ({unitSystem})
            </label>
            <input
              type="number"
              step="any"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Width"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Diameter ({unitSystem})
          </label>
          <input
            type="number"
            step="any"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            placeholder="Diameter"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium mb-1" style={labelStyle}>
          Depth/Height ({unitSystem})
        </label>
        <input
          type="number"
          step="any"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Height"
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        />
      </div>
    </div>
  );
};
