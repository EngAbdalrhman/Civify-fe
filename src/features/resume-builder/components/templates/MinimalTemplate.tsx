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

export function MinimalTemplate({ data, color }: TemplateProps) {
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
    top: 40,
    bottom: 40,
    left: 56,
    right: 56,
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
    const items = section.items.filter((i: any) => i.visible !== false);
    if (skillsStyle === "tags") {
      return (
        <div className="text-[13px] text-gray-600 leading-loose">
          {items.map((i: any) => i.title).join("  ·  ")}
        </div>
      );
    }
    const displayStyle =
      skillsStyle === "dots" ? "dots" : skillsStyle === "bar" ? "bar" : "text";
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-[13px]"
          >
            <span>{item.title}</span>
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
    const items = section.items.filter((i: any) => i.visible !== false);
    if (languagesStyle === "level") {
      return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[13px]">
          {items.map((item: any) => (
            <div key={item.id}>
              <span>{item.title}</span>
              {item.subtitle && (
                <span className="text-gray-400"> — {item.subtitle}</span>
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
            <span>{item.title}</span>
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
    if (section.type === "skills" || section.type === "languages") return false;
    const lt = section.title.toLowerCase();
    const isCourse =
      section.type === "certifications" ||
      lt.includes("course") ||
      lt.includes("certif");
    const isList = lt.includes("interest") || lt.includes("hobb");
    return isList || (isCourse && coursesStyle === "simple");
  };

  const renderSimple = (section: any) => {
    const items = section.items.filter((i: any) => i.visible !== false);
    const cols = metadata?.sectionColumns?.[section.id] ?? 3;
    return (
      <div
        className="text-[13px] text-gray-500"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "4px",
        }}
      >
        {items.map((item: any) => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-full bg-white text-gray-800 ${compactClass}`}
      dir={direction}
      style={{
        paddingTop: margins.top,
        paddingBottom: margins.bottom,
        paddingLeft: margins.left,
        paddingRight: margins.right,
      }}
    >
      {/* Minimal Header — lightweight, no borders, generous whitespace */}
      <header style={{ marginBottom: `${sectionMargin + 8}px` }}>
        <h1 className="text-[28px] font-light uppercase tracking-[0.06em] text-gray-900 mb-2">
          {personalInfo.fullName}
        </h1>
        {personalInfo.jobTitle && (
          <div className="text-sm text-gray-500 mb-3">
            {personalInfo.jobTitle}
          </div>
        )}
        <div className="text-xs text-gray-400 flex flex-wrap gap-x-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && (
            <>
              <span>·</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {(personalInfo.city || personalInfo.country) && (
            <>
              <span>·</span>
              <span>
                {[personalInfo.city, personalInfo.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span>·</span>
              <a
                href={normalizeLinkedInUrl(personalInfo.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color }}
              >
                LinkedIn
              </a>
            </>
          )}
          {personalInfo.github && (
            <>
              <span>·</span>
              <a
                href={normalizeGitHubUrl(personalInfo.github)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color }}
              >
                GitHub
              </a>
            </>
          )}
          {personalInfo.website && (
            <>
              <span>·</span>
              <a
                href={normalizeWebsiteUrl(personalInfo.website)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color }}
              >
                Website
              </a>
            </>
          )}
        </div>
      </header>

      {personalInfo.summary && (
        <section style={{ marginBottom: `${sectionMargin}px` }}>
          <p className="text-[13px] text-gray-500 leading-relaxed">
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
            style={{ marginBottom: `${sectionMargin}px` }}
          >
            <h2
              className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2.5"
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
              <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
                {items.map((item: any) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium">
                        {item.title}
                        {item.subtitle && (
                          <span className="font-normal text-gray-500">
                            {" "}
                            — {item.subtitle}
                          </span>
                        )}
                      </span>
                      {(item.date || item.location) && (
                        <span className="text-[11px] text-gray-400">
                          {[item.date, item.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-[13px] text-gray-500 whitespace-pre-wrap mt-1">
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
