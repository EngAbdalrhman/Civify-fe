"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

interface MonthPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function parseMonthValue(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: match[2],
  };
}

function formatMonthValue(value?: string, placeholder = "Select month") {
  const parsed = parseMonthValue(value);
  if (!parsed) return placeholder;

  const monthLabel =
    MONTHS.find((month) => month.value === parsed.month)?.label ?? parsed.month;

  return `${monthLabel} ${parsed.year}`;
}

function getYearGridStart(year: number) {
  return year - 4;
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Select month",
  disabled = false,
  className,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"month" | "year">("month");
  const parsedValue = useMemo(() => parseMonthValue(value), [value]);
  const [displayYear, setDisplayYear] = useState(
    parsedValue?.year ?? new Date().getFullYear(),
  );

  const buttonLabel = formatMonthValue(value, placeholder);
  const yearGridStart = getYearGridStart(displayYear);
  const yearOptions = Array.from({ length: 12 }, (_, index) => yearGridStart + index);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDisplayYear(parsedValue?.year ?? new Date().getFullYear());
          setView("month");
        }
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between rounded-xl border-border/70 bg-background/80 px-3 text-left font-normal shadow-sm hover:border-primary/30 hover:bg-accent/40",
            !parsedValue && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-60",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className="truncate">{buttonLabel}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[292px] rounded-2xl border-border/60 p-3 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-2 py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg"
              onClick={() =>
                setDisplayYear((year) => year - (view === "year" ? 12 : 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg px-3 text-sm font-semibold tracking-wide"
              onClick={() =>
                setView((currentView) =>
                  currentView === "month" ? "year" : "month",
                )
              }
            >
              {view === "year"
                ? `${yearGridStart} - ${yearGridStart + 11}`
                : displayYear}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  view === "year" && "rotate-180",
                )}
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg"
              onClick={() =>
                setDisplayYear((year) => year + (view === "year" ? 12 : 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {view === "year" ? (
            <div className="space-y-3">
              <div className="px-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Choose year
              </div>
              <div className="grid grid-cols-3 gap-2">
                {yearOptions.map((year) => {
                  const isSelected = parsedValue?.year === year;
                  const isCurrent = new Date().getFullYear() === year;

                  return (
                    <Button
                      key={year}
                      type="button"
                      variant={isSelected ? "default" : "ghost"}
                      className={cn(
                        "h-11 rounded-xl border text-sm",
                        isSelected
                          ? "border-primary/80 shadow-sm"
                          : "border-transparent bg-muted/35 hover:border-border hover:bg-accent/60",
                        isCurrent && !isSelected && "border-primary/20 text-primary",
                      )}
                      onClick={() => {
                        setDisplayYear(year);
                        setView("month");
                      }}
                    >
                      {year}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month) => {
                const isSelected =
                  parsedValue?.year === displayYear && parsedValue.month === month.value;

                return (
                  <Button
                    key={month.value}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    className={cn(
                      "h-11 rounded-xl border text-sm",
                      isSelected
                        ? "border-primary/80 shadow-sm"
                        : "border-transparent bg-muted/35 hover:border-border hover:bg-accent/60",
                    )}
                    onClick={() => {
                      onChange(`${displayYear}-${month.value}`);
                      setOpen(false);
                    }}
                  >
                    {month.label}
                  </Button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg text-muted-foreground"
                onClick={() => {
                  setDisplayYear(new Date().getFullYear());
                  setView("month");
                }}
              >
                This year
              </Button>
              {parsedValue ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-muted-foreground"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
