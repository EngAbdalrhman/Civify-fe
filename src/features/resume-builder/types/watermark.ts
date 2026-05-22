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
