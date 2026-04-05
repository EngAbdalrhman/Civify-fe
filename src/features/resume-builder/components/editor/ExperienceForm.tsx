"use client";

import { SectionItem } from "@/features/upload-cv/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

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

interface ExperienceFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

// Parse legacy date format "MM/YYYY – MM/YYYY" or "MM/YYYY – Present"
function parseLegacyDate(dateStr?: string): {
  startDate: string;
  endDate: string;
} {
  if (!dateStr) return { startDate: "", endDate: "" };

  // Check for various separators: " – ", " - ", "–", "-"
  const separators = [" – ", " - ", "–", "-"];
  let parts: string[] = [];

  for (const sep of separators) {
    if (dateStr.includes(sep)) {
      parts = dateStr.split(sep).map((p) => p.trim());
      break;
    }
  }

  if (parts.length !== 2) {
    return { startDate: "", endDate: "" };
  }

  const [start, end] = parts;

  // Convert MM/YYYY to YYYY-MM for input[type="month"]
  const convertDate = (d: string): string => {
    if (d.toLowerCase() === "present") return "Present";
    const match = d.match(/^(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[2]}-${match[1]}`;
    }
    return d;
  };

  return {
    startDate: convertDate(start),
    endDate: convertDate(end),
  };
}

// Sortable Item Component
function SortableExperienceItem({
  item,
  updateItem,
  updateDates,
  removeItem,
}: {
  item: SectionItem;
  updateItem: (id: string, updates: Partial<SectionItem>) => void;
  updateDates: (id: string, startDate: string, endDate: string) => void;
  removeItem: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const t = useTranslations("editor.experience");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Parse legacy date if startDate/endDate not set
  const displayStartDate =
    item.startDate || parseLegacyDate(item.date).startDate;
  const displayEndDate = item.endDate || parseLegacyDate(item.date).endDate;
  const isPresent = displayEndDate === "Present";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg bg-card/50 space-y-4 relative group transition-opacity ${item.visible === false ? "opacity-50" : ""}`}
    >
      <div className="absolute left-2 top-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateItem(item.id, { visible: item.visible === false ? true : false })}
          className="text-muted-foreground hover:text-foreground"
        >
          {item.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.id)}
          className="text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="pl-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("company")}</Label>
            <Input
              value={item.subtitle || ""}
              onChange={(e) => updateItem(item.id, { subtitle: e.target.value })}
              placeholder={t("companyPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("position")}</Label>
            <Input
              value={item.title || ""}
              onChange={(e) =>
                updateItem(item.id, { title: e.target.value })
              }
              placeholder={t("positionPlaceholder")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label>{t("startDate")}</Label>
            <Input
              type="month"
              value={displayStartDate !== "Present" ? displayStartDate : ""}
              onChange={(e) =>
                updateDates(item.id, e.target.value, displayEndDate)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("endDate")}</Label>
            <Input
              type="month"
              value={isPresent ? "" : displayEndDate}
              onChange={(e) =>
                updateDates(item.id, displayStartDate, e.target.value)
              }
              disabled={isPresent}
            />
            <div className="flex items-center gap-2 mt-1">
              <Checkbox
                id={`present-${item.id}`}
                checked={isPresent}
                onCheckedChange={(checked) => {
                  updateDates(
                    item.id,
                    displayStartDate,
                    checked ? "Present" : "",
                  );
                }}
              />
              <Label
                htmlFor={`present-${item.id}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {t("present")}
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label>{t("location")}</Label>
          <Input
            value={item.location || ""}
            onChange={(e) => updateItem(item.id, { location: e.target.value })}
            placeholder={t("locationPlaceholder")}
          />
        </div>

        <div className="space-y-2 mt-4">
          <Label>{t("description")}</Label>
          <Textarea
            value={item.description || ""}
            onChange={(e) =>
              updateItem(item.id, { description: e.target.value })
            }
            placeholder={t("descriptionPlaceholder")}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}

import { useTranslations } from "next-intl";

export function ExperienceForm({ items = [], onChange }: ExperienceFormProps) {
  const t = useTranslations("editor.experience");
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

  const addItem = () => {
    onChange([
      ...items,
      {
        id: uuidv4(),
        title: "",
        subtitle: "",
        startDate: "",
        endDate: "",
        date: "",
        description: "",
        location: "",
        visible: true,
      },
    ]);
  };

  const updateItem = (id: string, updates: Partial<SectionItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const updateDates = (id: string, startDate: string, endDate: string) => {
    const dateStr =
      endDate === "Present"
        ? `${startDate} - Present`
        : startDate && endDate
          ? `${startDate} - ${endDate}`
          : startDate || endDate;
    updateItem(id, { startDate, endDate, date: dateStr });
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableExperienceItem
              key={item.id}
              item={item}
              updateItem={updateItem}
              updateDates={updateDates}
              removeItem={removeItem}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        onClick={addItem}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("add")}
      </Button>
    </div>
  );
}
