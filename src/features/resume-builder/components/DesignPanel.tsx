"use client";

import {
  ResumeData,
  SkillsDisplayStyle,
  LanguagesDisplayStyle,
  CoursesDisplayStyle,
} from "@/features/upload-cv/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LayoutTemplate,
  Palette,
  Code,
  AlignLeft,
  AlignRight,
  Maximize,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DesignPanelProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const TEMPLATE_ATS_BADGE: Record<string, "excellent" | "good" | "caution" | "poor"> = {
  ats: "excellent",
  minimal: "good",
  classic: "good",
  modern: "caution",
  executive: "caution",
  creative: "poor",
};

const TEMPLATES = [
  {
    id: "ats",
    category: "ats",
    accent: "#111827",
    preview: ["linear", "text", "plain"],
    atsRecommended: true,
  },
  {
    id: "modern",
    category: "balanced",
    accent: "#2563eb",
    preview: ["wide", "bars", "grid"],
  },
  {
    id: "classic",
    category: "traditional",
    accent: "#111827",
    preview: ["rule", "stack", "text"],
  },
  {
    id: "creative",
    category: "bold",
    accent: "#db2777",
    preview: ["sidebar", "cards", "contrast"],
  },
  {
    id: "executive",
    category: "premium",
    accent: "#0f766e",
    preview: ["header", "columns", "tight"],
  },
  {
    id: "minimal",
    category: "clean",
    accent: "#475569",
    preview: ["thin", "airy", "mono"],
  },
];

const FONTS = [
  { id: "Inter", name: "Inter (Sans)" },
  { id: "Georgia", name: "Georgia (Serif)" },
  { id: "Roboto", name: "Roboto (Sans)" },
  { id: "Merriweather", name: "Merriweather (Serif)" },
  { id: "Fira Code", name: "Fira Code (Mono)" },
  { id: "Lato", name: "Lato (Sans)" },
];

const COLORS = [
  "#000000", // Black
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#9333ea", // Purple
  "#f59e0b", // Amber
  "#0d9488", // Teal
  "#4f46e5", // Indigo
  "#9e1634", // Rose
  // "#475569", // Slate
  // "#25bc71",
  // "#e23fe8",
  // "#91a1b8",
];

const SKILLS_DISPLAY_STYLES: { id: SkillsDisplayStyle; name: string }[] = [
  { id: "tags", name: "Tags" },
  { id: "level", name: "Level" },
  { id: "dots", name: "Dots" },
  { id: "bar", name: "Bar" },
];

const LANGUAGES_DISPLAY_STYLES: { id: LanguagesDisplayStyle; name: string }[] =
  [
    { id: "level", name: "Level" },
    { id: "dots", name: "Dots" },
    { id: "bar", name: "Bar" },
  ];

const COURSES_DISPLAY_STYLES: {
  id: CoursesDisplayStyle;
  name: string;
  desc: string;
}[] = [
  { id: "detailed", name: "Detailed", desc: "Full cards" },
  { id: "simple", name: "Simple", desc: "Bullet list" },
];

import { useTranslations } from "next-intl";

export function DesignPanel({ data, onChange }: DesignPanelProps) {
  const metadata = data.metadata || {};
  const t = useTranslations("design");
  const tr = (key: string, fallback: string) =>
    t.has(key as never) ? t(key as never) : fallback;

  const updateMetadata = (key: string, value: any) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        [key]: value,
      },
    });
  };

  const updateMargins = (
    key: "top" | "bottom" | "left" | "right",
    value: number,
  ) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        margins: {
          ...(metadata.margins || { top: 40, bottom: 40, left: 40, right: 40 }),
          [key]: value,
        },
      },
    });
  };

  const columnEligibleSections = data.sections.filter((section) => {
    if (section.visible === false) return false;
    // Sections with specialized renderers are never eligible for simple columns
    if (['experience', 'education', 'skills', 'languages', 'projects'].includes(section.type)) {
      return false;
    }
    // Certifications are only eligible when using the "simple" display style
    if (section.type === 'certifications') {
      return (metadata.coursesDisplayStyle || 'simple') === 'simple';
    }
    // Custom sections are always eligible
    return true;
  });

  const updateSectionColumns = (sectionId: string, columns: number) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        sectionColumns: {
          ...(metadata.sectionColumns || {}),
          [sectionId]: columns,
        },
      },
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="templates" className="w-full space-y-4 pb-4">
      {/* ============================================ */}
      {/* Templates */}
      {/* ============================================ */}
      <AccordionItem value="templates" className="border bg-card rounded-xl shadow-sm overflow-hidden px-1">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/20 rounded-lg transition-colors">
          <div className="font-semibold flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-primary" />
            {t("template.title")}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-1 gap-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`
                  relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all
                  ${
                    metadata.templateId === template.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }
                `}
                onClick={() => updateMetadata("templateId", template.id)}
              >
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-2 p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: template.accent }}
                      />
                      <div className="font-medium">
                        {tr(
                          `template.${template.id}.name`,
                          template.id.charAt(0).toUpperCase() +
                            template.id.slice(1),
                        )}
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {tr(
                          `template.categories.${template.category}`,
                          template.category,
                        )}
                      </span>
                      {"atsRecommended" in template && template.atsRecommended ? (
                        <span className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 text-[10px] font-semibold">
                          Best for ATS
                        </span>
                      ) : TEMPLATE_ATS_BADGE[template.id] === "poor" ? (
                        <span className="rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 text-[10px] font-semibold">
                          ATS caution
                        </span>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tr(
                        `template.${template.id}.description`,
                        "Template preview",
                      )}
                    </div>
                  </div>
                  {/* Mini preview thumbnail */}
                  <div className="bg-muted/40 p-4">
                    <div className="mx-auto flex h-28 max-w-[170px] flex-col gap-2 rounded-xl border bg-background p-3 shadow-sm">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          backgroundColor: template.accent,
                          width: template.preview[0] === "thin" ? "40%" : "70%",
                        }}
                      />
                      <div
                        className={`grid flex-1 gap-2 ${
                          template.preview.includes("sidebar")
                            ? "grid-cols-[0.42fr_0.58fr]"
                            : "grid-cols-1"
                        }`}
                      >
                        {template.preview.includes("sidebar") ? (
                          <>
                            <div className="rounded-lg bg-muted/80" />
                            <div className="space-y-2">
                              <div className="h-2 rounded-full bg-muted/80" />
                              <div className="h-2 rounded-full bg-muted/60" />
                              <div className="grid grid-cols-2 gap-2">
                                <div className="h-10 rounded-lg bg-muted/60" />
                                <div className="h-10 rounded-lg bg-muted/50" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-10 rounded-lg bg-muted/70" />
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg bg-muted/60" />
                              <div className="rounded-lg bg-muted/50" />
                            </div>
                            <div className="h-8 rounded-lg bg-muted/55" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ============================================ */}
      {/* Colors & Typography */}
      {/* ============================================ */}
      <AccordionItem value="colors-typography" className="border bg-card rounded-xl shadow-sm overflow-hidden px-1">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/20 rounded-lg transition-colors">
          <div className="font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            {t("colors")} & {t("typography")}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2 space-y-8">
          {/* Colors */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("colors")}</Label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all ring-offset-background
                    ${metadata.primaryColor === color ? "ring-2 ring-primary ring-offset-2" : ""}
                  `}
                  style={{ backgroundColor: color, borderColor: color }}
                  onClick={() => updateMetadata("primaryColor", color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3 pt-6 border-t">
            <Label className="text-sm font-semibold">{t("typography")}</Label>
            <div className="space-y-6">
              {/* Heading Font */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("headingFont")}
                </h4>
                <RadioGroup
                  value={metadata.headingFontFamily || metadata.fontFamily || "Inter"}
                  onValueChange={(val) => updateMetadata("headingFontFamily", val)}
                  className="grid grid-cols-2 gap-2 xl:grid-cols-3"
                >
                  {FONTS.map((font) => (
                    <div
                      key={`heading-${font.id}`}
                      className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={font.id} id={`heading-font-${font.id}`} />
                      <Label htmlFor={`heading-font-${font.id}`} className="flex-1 cursor-pointer text-xs">
                        {font.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Body Font */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("bodyFont")}
                </h4>
                <RadioGroup
                  value={metadata.bodyFontFamily || metadata.fontFamily || "Inter"}
                  onValueChange={(val) => updateMetadata("bodyFontFamily", val)}
                  className="grid grid-cols-2 gap-2 xl:grid-cols-3"
                >
                  {FONTS.map((font) => (
                    <div
                      key={`body-${font.id}`}
                      className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={font.id} id={`body-font-${font.id}`} />
                      <Label htmlFor={`body-font-${font.id}`} className="flex-1 cursor-pointer text-xs">
                        {font.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ============================================ */}
      {/* Layout & Spacing */}
      {/* ============================================ */}
      <AccordionItem value="layout-spacing" className="border bg-card rounded-xl shadow-sm overflow-hidden px-1">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/20 rounded-lg transition-colors">
          <div className="font-semibold flex items-center gap-2">
            <Maximize className="h-4 w-4 text-primary" />
            {tr("layoutAndSpacing", "Layout & Spacing")}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2 space-y-8">
          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode" className="text-sm">{t("compactMode")}</Label>
              <p className="text-xs text-muted-foreground">Reduce line heights to fit more content.</p>
            </div>
            <Switch
              id="compact-mode"
              checked={metadata.compactMode || false}
              onCheckedChange={(val) => updateMetadata("compactMode", val)}
            />
          </div>

          {/* Section & Item Spacing */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="spacing-slider" className="text-sm">{t("spacing")}</Label>
              <span className="text-xs font-mono text-muted-foreground">{metadata.spacingLevel || 3}</span>
            </div>
            <input
              id="spacing-slider"
              type="range"
              min="1"
              max="5"
              step="1"
              value={metadata.spacingLevel || 3}
              onChange={(e) => updateMetadata("spacingLevel", parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Tight</span>
              <span>Relaxed</span>
            </div>
          </div>

          {/* Page Margins */}
          <div className="space-y-4">
            <Label className="text-sm block">{t("margins.title") || "Page Margins"}</Label>
            <div className="grid grid-cols-2 gap-4">
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <div key={side} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{t(`margins.${side}`) || side}</span>
                    <span className="font-mono">{metadata.margins?.[side] ?? 40}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={metadata.margins?.[side] ?? 40}
                    onChange={(e) => updateMargins(side, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ============================================ */}
      {/* Section Styles */}
      {/* ============================================ */}
      <AccordionItem value="section-styles" className="border bg-card rounded-xl shadow-sm overflow-hidden px-1">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/20 rounded-lg transition-colors">
          <div className="font-semibold flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            {tr("sectionStyles.title", "Section Styles")}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2 space-y-8">
          {/* Skills Display Style */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("sectionStyles.skills")}</Label>
            <div className="grid grid-cols-4 gap-2">
              {SKILLS_DISPLAY_STYLES.map((style) => (
                <button
                  key={style.id}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-all
                    ${
                      (metadata.skillsDisplayStyle || "tags") === style.id
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    }
                  `}
                  onClick={() => updateMetadata("skillsDisplayStyle", style.id)}
                >
                  {t(`sectionStyles.${style.id}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Display Style */}
          <div className="space-y-3 pt-6 border-t">
            <Label className="text-sm font-semibold">{t("sectionStyles.languages")}</Label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES_DISPLAY_STYLES.map((style) => (
                <button
                  key={style.id}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-all
                    ${
                      (metadata.languagesDisplayStyle || "level") === style.id
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    }
                  `}
                  onClick={() => updateMetadata("languagesDisplayStyle", style.id)}
                >
                  {t(`sectionStyles.${style.id}` as any)}
                </button>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ============================================ */}
      {/* Formatting & Direction */}
      {/* ============================================ */}
      <AccordionItem value="formatting" className="border bg-card rounded-xl shadow-sm overflow-hidden px-1">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/20 rounded-lg transition-colors">
          <div className="font-semibold flex items-center gap-2">
            <AlignLeft className="h-4 w-4 text-primary" />
            {tr("formattingAndDirection", "Formatting & Direction")}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2 space-y-8">
          {/* Layout Direction */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("layoutDirection.title")}</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`px-3 py-2 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
                  ${!metadata.layoutDirection || metadata.layoutDirection === "auto" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50"}`}
                onClick={() => updateMetadata("layoutDirection", "auto")}
              >
                <span className="font-medium">{t("layoutDirection.auto")}</span>
                <span className="text-[10px] text-muted-foreground">{t("layoutDirection.matchLocale")}</span>
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
                  ${metadata.layoutDirection === "ltr" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50"}`}
                onClick={() => updateMetadata("layoutDirection", "ltr")}
              >
                <AlignLeft className="h-3 w-3" />
                <span className="font-medium">{t("layoutDirection.ltr")}</span>
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
                  ${metadata.layoutDirection === "rtl" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50"}`}
                onClick={() => updateMetadata("layoutDirection", "rtl")}
              >
                <AlignRight className="h-3 w-3" />
                <span className="font-medium">{t("layoutDirection.rtl")}</span>
              </button>
            </div>
          </div>

          {/* Section Columns */}
          {columnEligibleSections.length > 0 && (
            <div className="space-y-3 pt-6 border-t">
              <Label className="text-sm font-semibold">
                {t("sectionColumns.title") || "Section Columns"}
              </Label>
              <div className="space-y-3">
                {columnEligibleSections.map((section) => {
                  const currentCols = metadata.sectionColumns?.[section.id] || 3;
                  return (
                    <div key={section.id} className="flex items-center justify-between">
                      <Label className="text-sm border-0 font-medium truncate pr-4">
                        {section.title}
                      </Label>
                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            className={`
                              w-8 h-8 flex items-center justify-center text-xs rounded-md border transition-all
                              ${
                                currentCols === n
                                  ? "bg-primary text-primary-foreground border-primary font-bold"
                                  : "bg-background hover:bg-muted border-border font-medium hover:border-primary/50"
                              }
                            `}
                            onClick={() => updateSectionColumns(section.id, n)}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
