"use client";

import React from "react";
import {
  ResumeData,
  CoursesDisplayStyle,
} from "@/features/upload-cv/types";
import {
  normalizeGitHubUrl,
  normalizeLinkedInUrl,
  normalizeWebsiteUrl,
} from "@/features/resume-builder/utils/socialLinks";

interface TemplateProps {
  data: ResumeData;
  color: string;
}

/**
 * ATS-optimized layout: single column, text-only skills, no sidebar or icons.
 */
export function AtsTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections, metadata } = data;
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

  const margins = metadata?.margins || {
    top: 36,
    bottom: 36,
    left: 48,
    right: 48,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 10;
  const itemGap = spacingLevel * 4;

  const visibleSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.items &&
      s.items.some((i: { visible?: boolean }) => i.visible !== false),
  );

  const renderSkills = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    return (
      <p className="text-[13px] text-gray-700 leading-relaxed">
        {items.map((i) => i.title).join(", ")}
      </p>
    );
  };

  const renderLanguages = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    return (
      <ul className="list-none space-y-1 text-[13px] text-gray-700">
        {items.map((item) => (
          <li key={item.id}>
            <span className="font-medium">{item.title}</span>
            {item.subtitle && (
              <span className="text-gray-500"> — {item.subtitle}</span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const shouldUseSimple = (section: (typeof sections)[0]) => {
    if (section.visible === false) return false;
    if (
      ["experience", "education", "skills", "languages", "projects"].includes(
        section.type,
      )
    ) {
      return false;
    }
    if (section.type === "certifications") {
      return coursesStyle === "simple";
    }
    return true;
  };

  const renderSimple = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    return (
      <ul className="list-disc list-inside text-[13px] text-gray-700 space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="min-h-full bg-white text-gray-900 leading-normal"
      dir={direction}
      style={{
        paddingTop: margins.top,
        paddingBottom: margins.bottom,
        paddingLeft: margins.left,
        paddingRight: margins.right,
        fontFamily: "Arial, Calibri, sans-serif",
      }}
    >
      <header style={{ marginBottom: sectionMargin + 4 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {personalInfo.fullName}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-sm text-gray-600 mb-2">{personalInfo.jobTitle}</p>
        )}
        <p className="text-xs text-gray-600">
          {[
            personalInfo.email,
            personalInfo.phone,
            [personalInfo.city, personalInfo.country].filter(Boolean).join(", "),
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
        {(personalInfo.linkedin ||
          personalInfo.github ||
          personalInfo.website) && (
          <p className="text-xs mt-1 text-gray-600">
            {personalInfo.linkedin && (
              <a
                href={normalizeLinkedInUrl(personalInfo.linkedin)}
                className="mr-3 underline"
                style={{ color }}
              >
                LinkedIn
              </a>
            )}
            {personalInfo.github && (
              <a
                href={normalizeGitHubUrl(personalInfo.github)}
                className="mr-3 underline"
                style={{ color }}
              >
                GitHub
              </a>
            )}
            {personalInfo.website && (
              <a
                href={normalizeWebsiteUrl(personalInfo.website)}
                className="underline"
                style={{ color }}
              >
                Website
              </a>
            )}
          </p>
        )}
      </header>

      {personalInfo.summary && (
        <section style={{ marginBottom: sectionMargin }}>
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2"
            style={{ color }}
          >
            Summary
          </h2>
          <p className="text-[13px] text-gray-700 whitespace-pre-wrap">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {visibleSections.map((section) => {
        const items = section.items.filter((i) => i.visible !== false);
        if (items.length === 0) return null;
        return (
          <section
            key={section.id}
            style={{ marginBottom: sectionMargin }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-2 break-after-avoid"
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
              <div
                className="flex flex-col"
                style={{ gap: itemGap }}
              >
                {items.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.title}
                        {item.subtitle && (
                          <span className="font-normal text-gray-600">
                            {" "}
                            — {item.subtitle}
                          </span>
                        )}
                      </span>
                      {(item.date || item.location) && (
                        <span className="text-xs text-gray-500 shrink-0">
                          {[item.date, item.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[13px] text-gray-700 whitespace-pre-wrap mt-1">
                        {item.description}
                      </p>
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
