"use client";

import { Check, X, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ComparisonTableSection() {
  const t = useTranslations("extension.comparison");

  const rows = [
    "rowTailor",
    "rowMask",
    "rowCoverLetter",
    "rowEffort",
    "rowSpeed",
    "rowLanguage",
    "rowLinkedIn",
  ] as const;

  const columnKeys = ["manual", "extension", "dashboard"] as const;

  const rowDataKeys: Record<string, string> = {
    rowTailor: "tailor",
    rowMask: "mask",
    rowCoverLetter: "coverLetter",
    rowEffort: "effort",
    rowSpeed: "speed",
    rowLanguage: "language",
    rowLinkedIn: "linkedIn",
  };

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-sm">
            {t("badge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Table */}
        <div className="mx-auto max-w-5xl overflow-x-auto">
          <table className="w-full border-collapse" role="table">
            <thead>
              <tr>
                <th className="p-4 text-left rtl:text-right text-sm font-medium text-muted-foreground" />
                <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                  {t("headerManual")}
                </th>
                <th className="p-4 text-center">
                  <div className="rounded-xl bg-primary/10 px-4 py-2">
                    <span className="text-sm font-bold text-primary">
                      {t("headerExtension")}
                    </span>
                  </div>
                </th>
                <th className="p-4 text-center text-sm font-medium text-muted-foreground">
                  {t("headerDashboard")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                  <td className="p-4 text-sm font-medium">{t(row)}</td>
                  {columnKeys.map((col) => {
                    const value = t(`${col}.${rowDataKeys[row]}`);
                    const isNone =
                      value === "None" ||
                      value === "لا يوجد" ||
                      value === "Slow" ||
                      value === "بطيء";
                    const isGood =
                      col === "extension" &&
                      (row === "rowEffort" ||
                        row === "rowSpeed" ||
                        row === "rowLinkedIn");
                    return (
                      <td key={col} className="p-4 text-center text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 ${
                            col === "extension"
                              ? "font-semibold text-primary"
                              : isNone
                                ? "text-muted-foreground"
                                : "text-foreground"
                          }`}
                        >
                          {isNone && col === "manual" && (
                            <X className="h-4 w-4 text-red-400" />
                          )}
                          {isGood && (
                            <Check className="h-4 w-4 text-emerald-500" />
                          )}
                          {value}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
