"use client";

import { useState } from "react";
import {
  ResumeData,
  ResumeSection,
  SectionItem,
} from "@/features/upload-cv/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonalInfoForm } from "./editor/PersonalInfoForm";
import { ExperienceForm } from "./editor/ExperienceForm";
import { EducationForm } from "./editor/EducationForm";
import { SkillsForm } from "./editor/SkillsForm";
import { GenericSectionForm } from "./editor/GenericSectionForm";
import { LanguagesForm } from "./editor/LanguagesForm";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Award,
  Languages as LanguagesIcon,
  Heart,
  LayoutList,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EditorPanelProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

// Icon mapping for section types
const sectionIcons: Record<string, React.ReactNode> = {
  experience: <Briefcase className="h-4 w-4 text-primary" />,
  education: <GraduationCap className="h-4 w-4 text-primary" />,
  skills: <Code className="h-4 w-4 text-primary" />,
  projects: <FolderGit2 className="h-4 w-4 text-primary" />,
  certifications: <Award className="h-4 w-4 text-primary" />,
  languages: <LanguagesIcon className="h-4 w-4 text-primary" />,
  custom: <Heart className="h-4 w-4 text-primary" />,
};

const SECTION_TYPES = [
  { value: "experience", label: "Experience" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "languages", label: "Languages" },
  { value: "projects", label: "Projects" },
  { value: "certifications", label: "Certifications" },
  { value: "custom", label: "Custom" },
];

// Sortable Section Component
function SortableSection({
  section,
  children,
  onRename,
  onDelete,
  onToggleVisibility,
}: {
  section: ResumeSection;
  children: React.ReactNode;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onRename(section.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={section.id}>
        <AccordionTrigger className="hover:no-underline px-2">
          <div className="flex items-center gap-2 w-full">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted -ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            {sectionIcons[section.type] || (
              <LayoutList className="h-4 w-4 text-primary" />
            )}

            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setEditTitle(section.title);
                    setIsEditing(false);
                  }
                }}
                className="h-7 w-32"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{section.title}</span>
            )}

            <span className="text-xs text-muted-foreground ml-auto mr-2">
              ({section.items.length})
            </span>

            <div
              role="button"
              tabIndex={0}
              className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(section.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onToggleVisibility(section.id);
                }
              }}
            >
              {section.visible === false ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3" />}
            </div>

            <div
              role="button"
              tabIndex={0}
              className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setIsEditing(true);
                }
              }}
            >
              <Pencil className="h-3 w-3" />
            </div>

            <div
              role="button"
              tabIndex={0}
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-destructive hover:bg-accent cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(section.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onDelete(section.id);
                }
              }}
            >
              <Trash2 className="h-3 w-3" />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-2">{children}</AccordionContent>
      </AccordionItem>
    </div>
  );
}

export function EditorPanel({ data, onChange }: EditorPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState<string>("custom");

  const t = useTranslations("editor");
  const tResume = useTranslations("resume.sections");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updatePersonalInfo = (info: ResumeData["personalInfo"]) => {
    onChange({ ...data, personalInfo: info });
  };

  const updateSection = (sectionId: string, items: SectionItem[]) => {
    const newSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, items };
      }
      return section;
    });
    onChange({ ...data, sections: newSections });
  };

  const renameSection = (sectionId: string, newTitle: string) => {
    const newSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, title: newTitle };
      }
      return section;
    });
    onChange({ ...data, sections: newSections });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const newSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, visible: section.visible === false ? true : false };
      }
      return section;
    });
    onChange({ ...data, sections: newSections });
  };

  const deleteSection = (sectionId: string) => {
    onChange({
      ...data,
      sections: data.sections.filter((s) => s.id !== sectionId),
    });
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;

    const newSection: ResumeSection = {
      id: uuidv4(),
      title: newSectionName.trim(),
      type: newSectionType as ResumeSection["type"],
      items: [],
      visible: true,
      order: data.sections.length,
    };

    onChange({ ...data, sections: [...data.sections, newSection] });
    setNewSectionName("");
    setNewSectionType("custom");
    setShowAddDialog(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.sections.findIndex((s) => s.id === active.id);
      const newIndex = data.sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(data.sections, oldIndex, newIndex).map(
        (section, index) => ({
          ...section,
          order: index,
        }),
      );

      onChange({ ...data, sections: newSections });
    }
  };

  const getIcon = (type: string) =>
    sectionIcons[type] || <LayoutList className="h-4 w-4 text-primary" />;

  const renderSectionContent = (section: ResumeSection) => {
    switch (section.type) {
      case "experience":
        return (
          <ExperienceForm
            items={section.items}
            onChange={(items) => updateSection(section.id, items)}
          />
        );
      case "education":
        return (
          <EducationForm
            items={section.items}
            onChange={(items) => updateSection(section.id, items)}
          />
        );
      case "skills":
        return (
          <SkillsForm
            items={section.items}
            onChange={(items) => updateSection(section.id, items)}
          />
        );
      case "languages":
        return (
          <LanguagesForm
            items={section.items}
            onChange={(items) => updateSection(section.id, items)}
          />
        );
      default:
        return (
          <GenericSectionForm
            sectionType={section.type}
            sectionTitle={section.title}
            items={section.items}
            onChange={(items) => updateSection(section.id, items)}
          />
        );
    }
  };

  const getSectionTypeLabel = (type: string) => {
    if (type === "custom") return t("sections.custom");
    return tResume(type as any) || type;
  };

  return (
    <>
      <Accordion
        type="single"
        collapsible
        defaultValue="personal"
        className="w-full"
      >
        {/* Personal Information - Always first */}
        <AccordionItem value="personal">
          <AccordionTrigger className="hover:no-underline px-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>{t("sections.personal")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <PersonalInfoForm
              data={data.personalInfo}
              onChange={updatePersonalInfo}
              templateId={data.metadata?.templateId}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Sortable Sections */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {data.sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onRename={renameSection}
                onDelete={deleteSection}
                onToggleVisibility={toggleSectionVisibility}
              >
                {renderSectionContent(section)}
              </SortableSection>
            ))}
          </SortableContext>
        </DndContext>
      </Accordion>

      {/* Add Section Button */}
      <Button
        variant="outline"
        className="w-full mt-4 gap-2"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="h-4 w-4" />
        {t("sections.add")}
      </Button>

      {/* Add Section Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>{t("dialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("dialog.nameLabel")}</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder={t("dialog.namePlaceholder")}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.typeLabel")}</Label>
              <Select value={newSectionType} onValueChange={setNewSectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {getIcon(type.value)}
                        {type.value === "custom"
                          ? t("sections.custom")
                          : tResume(type.value as any)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t("dialog.cancel")}
            </Button>
            <Button onClick={addSection} disabled={!newSectionName.trim()}>
              {t("dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
