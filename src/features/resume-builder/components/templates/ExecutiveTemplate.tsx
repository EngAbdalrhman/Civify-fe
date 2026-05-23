"use client";

import React from "react";
import {
  ResumeData,
  SkillLevel,
  SkillsDisplayStyle,
  LanguagesDisplayStyle,
  CoursesDisplayStyle,
} from "@/features/upload-cv/types";
import {
  normalizeGitHubUrl,
  normalizeLinkedInUrl,
  normalizeWebsiteUrl,
} from "@/features/resume-builder/utils/socialLinks";
import { LevelVisualizer } from "./LevelVisualizer";

interface TemplateProps {
  data: ResumeData;
  color: string;
}

function parseLevel(value?: string): SkillLevel {
  if (!value) return "intermediate";
  const lower = value.toLowerCase();
  if (lower === "native" || lower === "fluent" || lower === "expert")
    return "expert";
  if (lower === "advanced") return "advanced";
  if (lower === "intermediate") return "intermediate";
  if (lower === "beginner") return "beginner";
  return "intermediate";
}

export function ExecutiveTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle =
    metadata?.skillsDisplayStyle || "tags";
  const languagesStyle: LanguagesDisplayStyle =
    metadata?.languagesDisplayStyle || "level";
  const coursesStyle: CoursesDisplayStyle =
    metadata?.coursesDisplayStyle || "simple";

  const direction =
    metadata?.layoutDirection === "ltr"
      ? "ltr"
      : metadata?.layoutDirection === "rtl"
        ? "rtl"
        : metadata?.language === "ar"
          ? "rtl"
          : "ltr";

  const compactClass = metadata?.compactMode
    ? "leading-tight"
    : "leading-relaxed";
  const margins = metadata?.margins || {
    top: 48,
    bottom: 48,
    left: 48,
    right: 48,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 10;
  const itemGap = spacingLevel * 5;

  const visibleSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.items &&
      s.items.some((i: any) => i.visible !== false),
  );

  const renderSkills = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    if (skillsStyle === "tags") {
      return (
        <div className="flex flex-wrap gap-1.5 text-[13px]">
          {items.map((item: any) => (
            <span
              key={item.id}
              className="px-2.5 py-0.5 rounded-sm border"
              style={{ borderColor: color, color }}
            >
              {item.title}
            </span>
          ))}
        </div>
      );
    }
    const displayStyle =
      skillsStyle === "dots" ? "dots" : skillsStyle === "bar" ? "bar" : "text";
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-[13px]"
          >
            <span className="font-medium">{item.title}</span>
            <LevelVisualizer
              level={item.level || parseLevel(item.subtitle)}
              style={displayStyle}
              color={color}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderLanguages = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    if (languagesStyle === "level") {
      return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[13px]">
          {items.map((item: any) => (
            <div key={item.id}>
              <span className="font-medium">{item.title}</span>
              {item.subtitle && (
                <span className="text-gray-500"> — {item.subtitle}</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    const displayStyle = languagesStyle === "dots" ? "dots" : "bar";
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-[13px]"
          >
            <span className="font-medium">{item.title}</span>
            <LevelVisualizer
              level={item.level || parseLevel(item.subtitle)}
              style={displayStyle}
              color={color}
            />
          </div>
        ))}
      </div>
    );
  };

  const shouldUseSimple = (section: any) => {
    if (section.visible === false) return false;
    if (['experience', 'education', 'skills', 'languages', 'projects'].includes(section.type)) {
      return false;
    }
    if (section.type === 'certifications') {
      return coursesStyle === 'simple';
    }
    return true;
  };

  const renderSimple = (section: any) => {
    const items = section.items.filter((i: any) => i.visible !== false);
    const cols = metadata?.sectionColumns?.[section.id] ?? 3;
    return (
      <div
        className="gap-x-6 gap-y-1 text-[13px]"
        style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {items.map((item: any) => (
          <div key={item.id}>• {item.title}</div>
        ))}
      </div>
    );
  };

  const labels = {
    summary:
      metadata?.language === "ar" ? "الملخص التنفيذي" : "Executive Summary",
  };

  return (
    <div
      className={`min-h-full bg-white text-gray-900 ${compactClass}`}
      dir={direction}
      style={{
        paddingTop: margins.top,
        paddingBottom: margins.bottom,
        paddingLeft: margins.left,
        paddingRight: margins.right,
      }}
    >
      {/* Executive Header — thick bottom border, uppercase name */}
      <header
        className="pb-5 mb-6"
        style={{ borderBottom: `3px solid ${color}` }}
      >
        <h1
          className="text-[32px] font-bold uppercase tracking-widest mb-1"
          style={{ color }}
        >
          {personalInfo.fullName}
        </h1>
        {personalInfo.jobTitle && (
          <div className="text-base text-gray-500 italic mb-3">
            {personalInfo.jobTitle}
          </div>
        )}
        <div className="text-[13px] text-gray-500 flex flex-wrap gap-x-3">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.country) && (
            <span>
              |{" "}
              {[personalInfo.city, personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {personalInfo.linkedin && (
            <a
              href={normalizeLinkedInUrl(personalInfo.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color }}
            >
              | LinkedIn
            </a>
          )}
          {personalInfo.github && (
            <a
              href={normalizeGitHubUrl(personalInfo.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color }}
            >
              | GitHub
            </a>
          )}
          {personalInfo.website && (
            <a
              href={normalizeWebsiteUrl(personalInfo.website)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color }}
            >
              | Website
            </a>
          )}
        </div>
      </header>

      {personalInfo.summary && (
        <section style={{ marginBottom: `${sectionMargin}px` }}>
          <h2
            className="text-sm font-bold uppercase tracking-[0.08em] pb-1.5 mb-2.5 border-b border-gray-300"
            style={{ color }}
          >
            {labels.summary}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {visibleSections.map((section) => {
        const items = section.items.filter((i: any) => i.visible !== false);
        if (items.length === 0) return null;
        return (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginBottom: `${sectionMargin}px` }}
          >
            <h2
              className="cv-section-title text-sm font-bold uppercase tracking-[0.08em] pb-1.5 mb-2.5 border-b border-gray-300 break-after-avoid"
              style={{ color }}
            >
              {section.title}
            </h2>
            {section.type === "skills" ? (
              renderSkills(section)
            ) : section.type === "languages" ? (
              renderLanguages(section)
            ) : shouldUseSimple(section) ? (
              renderSimple(section)
            ) : (
              <div className="cv-items flex flex-col" style={{ gap: `${itemGap}px` }}>
                {items.map((item: any) => (
                  <div key={item.id} className="cv-entry break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[15px] font-semibold">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-sm text-gray-500">
                            {" "}
                            — {item.subtitle}
                          </span>
                        )}
                      </div>
                      {(item.date || item.location) && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {[item.date, item.location]
                            .filter(Boolean)
                            .join(" | ")}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-[13px] text-gray-700 whitespace-pre-wrap mt-1 pl-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
