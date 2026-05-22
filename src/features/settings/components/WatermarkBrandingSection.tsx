"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { WATERMARK_POSITION_OPTIONS } from "@/features/resume-builder/types/watermark";
import {
  watermarkService,
  type UserWatermarkSettings,
} from "@/services/watermark.service";

/** Must match civify BucketService.MAX_WATERMARK_BYTES (512_000) */
const MAX_WATERMARK_BYTES = 512_000;

export function WatermarkBrandingSection() {
  const [settings, setSettings] = useState<UserWatermarkSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await watermarkService.getUserSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load branding settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    if (
      settings.enabled &&
      !settings.usePlatformWatermark &&
      !settings.logoStorageKey
    ) {
      toast.error("Upload a PNG logo (max 500KB) before enabling custom watermark");
      return;
    }
    try {
      setSaving(true);
      const updated = await watermarkService.updateUserSettings({
        enabled: settings.enabled,
        opacity: settings.opacity,
        scale: settings.scale,
        position: settings.position,
        rotation: settings.rotation,
        usePlatformWatermark: settings.usePlatformWatermark,
      });
      setSettings(updated);
      toast.success("Branding settings saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.size > MAX_WATERMARK_BYTES) {
      toast.error(
        `Logo must be 500KB or smaller (this file is ${Math.round(file.size / 1024)}KB). Compress the PNG and try again.`,
      );
      return;
    }
    if (!file.type.includes("png") && !file.name.toLowerCase().endsWith(".png")) {
      toast.error("Logo must be a PNG file");
      return;
    }
    try {
      setUploading(true);
      const updated = await watermarkService.uploadUserLogo(file);
      setSettings(updated);
      toast.success("Custom watermark uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed (PNG, max 500KB)");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PermissionGuard permissions={["CV.CUSTOM_WATERMARK"]}>
      <Card>
        <CardHeader>
          <CardTitle>Custom PDF watermark</CardTitle>
          <CardDescription>
            Use your own logo on exported PDFs as watermark.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : settings ? (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-wm">Use custom watermark on exports</Label>
                <Switch
                  id="custom-wm"
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enabled: checked })
                  }
                />
              </div>

              {settings.logoUrl && (
                <div className="rounded border p-4 bg-muted/30 flex justify-center">
                  <img
                    src={settings.logoUrl}
                    alt="Your watermark"
                    className="max-h-16 opacity-50"
                  />
                </div>
              )}

              <div>
                <Label className="mb-2 block">Logo (PNG)</Label>
                <input
                  type="file"
                  accept="image/png"
                  className="text-sm"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Opacity</Label>
                  <input
                    type="number"
                    min={0.05}
                    max={1}
                    step={0.01}
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    value={settings.opacity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        opacity: parseFloat(e.target.value) || 0.12,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Scale</Label>
                  <input
                    type="number"
                    min={0.1}
                    max={1}
                    step={0.05}
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    value={settings.scale}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        scale: parseFloat(e.target.value) || 0.35,
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Position</Label>
                  <select
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    value={settings.position}
                    onChange={(e) =>
                      setSettings({ ...settings, position: e.target.value })
                    }
                  >
                    {WATERMARK_POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
                {settings.logoStorageKey && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await watermarkService.deleteUserLogo();
                      await load();
                      toast.success("Custom logo removed");
                    }}
                  >
                    Remove logo
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}
