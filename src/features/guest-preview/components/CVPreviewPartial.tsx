"use client";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { ResumeData } from "@/features/upload-cv/types";

interface CVPreviewPartialProps {
  resumeData: ResumeData;
  isBlurred?: boolean;
}

export function CVPreviewPartial({
  resumeData,
  isBlurred = false,
}: CVPreviewPartialProps) {
  const { personalInfo, sections } = resumeData;
  const experienceSection = sections.find((s) => s.type === "experience");
  const educationSection = sections.find((s) => s.type === "education");
  const skillsSection = sections.find((s) => s.type === "skills");

  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900 ${isBlurred ? "select-none" : ""}`}
    >
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className={`text-xl font-bold ${isBlurred ? "blur-sm" : ""}`}>
          {personalInfo.fullName || "Your Name"}
        </h2>
        <p className="text-sm font-medium text-primary">
          {personalInfo.jobTitle || "Job Title"}
        </p>
        <div
          className={`mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground ${isBlurred ? "blur-sm" : ""}`}
        >
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {personalInfo.address}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" />
            Professional Summary
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience - First item only */}
      {experienceSection && experienceSection.items.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Briefcase className="h-4 w-4" />
            Experience
          </h3>
          {experienceSection.items.slice(0, 1).map((item) => (
            <div
              key={item.id}
              className="rounded border-l-2 border-primary/50 pl-3"
            >
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.subtitle} • {item.startDate} - {item.endDate || "Present"}
              </p>
              {item.description && (
                <p
                  className={`mt-1 text-xs text-muted-foreground line-clamp-3 ${isBlurred ? "blur-[2px]" : ""}`}
                >
                  {item.description.split("\n").slice(0, 2).join("\n")}
                </p>
              )}
            </div>
          ))}
          {experienceSection.items.length > 1 && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              + {experienceSection.items.length - 1} more positions...
            </p>
          )}
        </div>
      )}

      {/* Skills preview */}
      {skillsSection && skillsSection.items.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Skills</h3>
          <div className="flex flex-wrap gap-1">
            {skillsSection.items.slice(0, 6).map((skill) => (
              <span
                key={skill.id}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {skill.title}
              </span>
            ))}
            {skillsSection.items.length > 6 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{skillsSection.items.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Education preview */}
      {educationSection && educationSection.items.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4" />
            Education
          </h3>
          {educationSection.items.slice(0, 1).map((item) => (
            <div key={item.id}>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          ))}
        </div>
      )}

      {/* Blurred overlay for locked content */}
      {isBlurred && (
        <div className="mt-4 rounded border border-dashed border-muted-foreground/30 bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Full CV preview available after sign up
          </p>
        </div>
      )}
    </div>
  );
}
