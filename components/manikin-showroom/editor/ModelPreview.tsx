"use client";

import { Color } from "three";
import { darkenColor } from "@/lib/common/tinycolor";
import { ModelType } from "@/lib/manikin-showroom/modelTypes";

interface ModelPreviewProps {
  model: ModelType;
  size?: number;
}

// Helper function to generate isometric paths based on dimensions
const getIsometricPaths = (width: number, height: number, depth: number, size: number) => {
  // Normalize dimensions to fit within the viewbox (size x size)
  const maxDim = Math.max(width, height, depth, 1);
  const scale = (size * 0.4) / maxDim; // Use 40% of the size as the max length
  const sw = width * scale;
  const sh = height * scale;
  const sd = depth * scale;

  // The angle of the isometric projection (often 30 degrees)
  const angle = Math.PI / 6;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // The origin point (where the 3 visible faces meet) in the center of the viewbox
  const cx = size / 2;
  const cy = size / 2;

  // Calculate the 7 visible vertices of the box in 2D screen space
  const p = {
    origin:     { x: cx, y: cy },
    topRight:   { x: cx + sw * cosA, y: cy - sw * sinA },
    topLeft:    { x: cx - sd * cosA, y: cy - sd * sinA },
    topCenter:  { x: cx + (sw - sd) * cosA, y: cy - (sw + sd) * sinA },
    bottomOrigin: { x: cx, y: cy + sh },
    bottomRight:{ x: cx + sw * cosA, y: cy + sh - sw * sinA },
    bottomLeft: { x: cx - sd * cosA, y: cy + sh - sd * sinA },
  };

  // Define the paths for the 3 visible faces
  const topPath = `M ${p.origin.x} ${p.origin.y} L ${p.topLeft.x} ${p.topLeft.y} L ${p.topCenter.x} ${p.topCenter.y} L ${p.topRight.x} ${p.topRight.y} Z`;
  const leftPath = `M ${p.origin.x} ${p.origin.y} L ${p.bottomOrigin.x} ${p.bottomOrigin.y} L ${p.bottomLeft.x} ${p.bottomLeft.y} L ${p.topLeft.x} ${p.topLeft.y} Z`;
  const rightPath = `M ${p.origin.x} ${p.origin.y} L ${p.topRight.x} ${p.topRight.y} L ${p.bottomRight.x} ${p.bottomRight.y} L ${p.bottomOrigin.x} ${p.bottomOrigin.y} Z`;

  return { topPath, leftPath, rightPath };
};


export default function ModelPreview({ model, size = 80 }: ModelPreviewProps) {
  const baseHex = `#${new Color(model.color).getHexString()}`;
  
  // Create darker shades for the side and front faces for a 3D effect
  const leftColor = darkenColor({ color: baseHex, percent: 20 });
  const rightColor = darkenColor({ color: baseHex, percent: 40 });

  const { topPath, leftPath, rightPath } = getIsometricPaths(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    100 // Use a 100x100 internal viewbox for calculations
  );

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        width="90%"
        height="90%"
        viewBox="0 0 100 100"
      >
        <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5">
          <path d={topPath} fill={baseHex} />
          <path d={leftPath} fill={leftColor} />
          <path d={rightPath} fill={rightColor} />
        </g>
      </svg>
    </div>
  );
}
