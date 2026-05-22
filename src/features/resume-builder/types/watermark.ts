export type WatermarkPosition =
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface WatermarkConfig {
  enabled: boolean;
  imageUrl: string;
  opacity?: number;
  scale?: number;
  position?: WatermarkPosition;
  rotation?: number;
}

export const DEFAULT_WATERMARK_OPACITY = 0.12;
export const DEFAULT_WATERMARK_SCALE = 0.35;
export const DEFAULT_WATERMARK_POSITION: WatermarkPosition = "center";

/** UI dropdown options — mirrors civify WatermarkPosition enum */
export const WATERMARK_POSITION_OPTIONS: {
  value: WatermarkPosition;
  label: string;
}[] = [
  { value: "center", label: "Center (large overlay)" },
  { value: "top-left", label: "Top left (header area)" },
  { value: "top-right", label: "Top right (header area)" },
  { value: "bottom-left", label: "Bottom left (footer area)" },
  { value: "bottom-right", label: "Bottom right (footer area)" },
];
