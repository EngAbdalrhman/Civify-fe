import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  useResumes,
  useDeleteResume,
} from "@/features/upload-cv/hooks/useResume";
import { ResumeCard } from "./ResumeCard";

export function ResumeCarousel() {
  const t = useTranslations("dashboard.resumes");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: resumes = [], isLoading } = useResumes();
  const deleteMutation = useDeleteResume();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/app/resume-builder?id=${id}&tab=export`);
  };

  // ─── Filter & Search ────────────────────────────────────────────────────────
  const filteredResumes = useMemo(() => {
    if (!searchQuery.trim()) return resumes;
    const lowerQuery = searchQuery.toLowerCase();
    return resumes.filter((resume) => {
      const matchTitle = resume.title.toLowerCase().includes(lowerQuery);
      const matchJob = resume.data?.personalInfo?.jobTitle
        ?.toLowerCase()
        .includes(lowerQuery);
      return matchTitle || matchJob;
    });
  }, [resumes, searchQuery]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredResumes.length / ITEMS_PER_PAGE),
  );
  const displayedResumes = filteredResumes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-4">
      {/* Header section with title, search, and action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight">{t("myResumes")}</h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search CV or Job Title..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/app/resume-builder">
              <Plus className="h-4 w-4 mr-2" />
              {t("createNew")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Loading State */}
        {isLoading &&
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-[200px] rounded-lg border bg-muted animate-pulse"
              />
            ))}

        {/* Empty State */}
        {!isLoading && displayedResumes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-card/50">
            <p className="mb-4">
              {searchQuery
                ? "No resumes found for your search."
                : "You haven't created any resumes yet."}
            </p>
            {!searchQuery && (
              <Button asChild variant="outline">
                <Link href="/app/resume-builder">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createNew")}
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Resume Cards */}
        {!isLoading &&
          displayedResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage((p) => p - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              if (page === 2 && currentPage > 3) {
                return <PaginationEllipsis key="ellipsis-start" />;
              }
              if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return <PaginationEllipsis key="ellipsis-end" />;
              }

              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
