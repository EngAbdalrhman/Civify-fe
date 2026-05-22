"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
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
import {
  watermarkService,
  type PlatformWatermarkSettings,
} from "@/services/watermark.service";

export function AdminWatermarkSettings() {
  const [settings, setSettings] = useState<PlatformWatermarkSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await watermarkService.getPlatformSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load watermark settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await watermarkService.updatePlatformSettings({
        enabled: settings.enabled,
        opacity: settings.opacity,
        scale: settings.scale,
        position: settings.position,
        rotation: settings.rotation,
      });
      setSettings(updated);
      toast.success("Watermark settings saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save watermark settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const updated = await watermarkService.uploadPlatformLogo(file);
      setSettings(updated);
      toast.success("Platform watermark logo uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload logo (PNG, max 500KB)");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading watermark settings…
      </div>
    );
  }

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF Watermark</CardTitle>
        <CardDescription>
          Platform logo applied to free-tier and guest PDF exports (R2:{" "}
          <code className="text-xs">Watermark/platform/logo.png</code>).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="wm-enabled">Enabled on free / guest exports</Label>
          <Switch
            id="wm-enabled"
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
              alt="Platform watermark"
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
          {uploading && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="wm-opacity">Opacity (0–1)</Label>
            <input
              id="wm-opacity"
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
            <Label htmlFor="wm-scale">Scale (0–1)</Label>
            <input
              id="wm-scale"
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
            <Label htmlFor="wm-position">Position</Label>
            <select
              id="wm-position"
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={settings.position}
              onChange={(e) =>
                setSettings({ ...settings, position: e.target.value })
              }
            >
              <option value="center">Center</option>
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
              <option value="top-right">Top right</option>
              <option value="top-left">Top left</option>
            </select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
