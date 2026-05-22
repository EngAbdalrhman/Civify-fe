import apiClient from "@/api/client";
import type { WatermarkConfig } from "@/features/resume-builder/types/watermark";

export interface PlatformWatermarkSettings {
  logoStorageKey?: string;
  logoUrl?: string;
  opacity: number;
  scale: number;
  position: string;
  rotation?: number;
  enabled: boolean;
}

export interface UserWatermarkSettings {
  enabled: boolean;
  logoStorageKey?: string;
  logoUrl?: string;
  opacity: number;
  scale: number;
  position: string;
  rotation?: number;
  usePlatformWatermark: boolean;
}

export interface WatermarkSettingsUpdate {
  opacity?: number;
  scale?: number;
  position?: string;
  rotation?: number;
  enabled?: boolean;
  usePlatformWatermark?: boolean;
}

class WatermarkService {
  async getPdfWatermarkConfig(): Promise<WatermarkConfig> {
    const res = await apiClient.get<{ data: WatermarkConfig }>(
      "/v1/pdf/watermark-config",
    );
    return res.data.data;
  }

  async getPlatformSettings(): Promise<PlatformWatermarkSettings> {
    const res = await apiClient.get<{ data: PlatformWatermarkSettings }>(
      "/v1/admin/watermark",
    );
    return res.data.data;
  }

  async updatePlatformSettings(
    body: WatermarkSettingsUpdate,
  ): Promise<PlatformWatermarkSettings> {
    const res = await apiClient.put<{ data: PlatformWatermarkSettings }>(
      "/v1/admin/watermark",
      body,
    );
    return res.data.data;
  }

  async uploadPlatformLogo(file: File): Promise<PlatformWatermarkSettings> {
    const form = new FormData();
    form.append("file", file);
    const res = await apiClient.post<{ data: PlatformWatermarkSettings }>(
      "/v1/admin/watermark/logo",
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  }

  async getUserSettings(): Promise<UserWatermarkSettings> {
    const res = await apiClient.get<{ data: UserWatermarkSettings }>(
      "/v1/users/me/watermark-settings",
    );
    return res.data.data;
  }

  async updateUserSettings(
    body: WatermarkSettingsUpdate,
  ): Promise<UserWatermarkSettings> {
    const res = await apiClient.put<{ data: UserWatermarkSettings }>(
      "/v1/users/me/watermark-settings",
      body,
    );
    return res.data.data;
  }

  async uploadUserLogo(file: File): Promise<UserWatermarkSettings> {
    const form = new FormData();
    form.append("file", file);
    const res = await apiClient.post<{ data: UserWatermarkSettings }>(
      "/v1/users/me/watermark-settings/logo",
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  }

  async deleteUserLogo(): Promise<void> {
    await apiClient.delete("/v1/users/me/watermark-settings/logo");
  }
}

export const watermarkService = new WatermarkService();
