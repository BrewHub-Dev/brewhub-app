"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "...")[] = []
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total)
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total)
  }
  return pages
}

export function Pagination({ pagination, onPageChange, className = "" }: PaginationProps) {
  const { page, pages, total, limit, hasNext, hasPrev } = pagination
  if (pages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const pageNumbers = getPageNumbers(page, pages)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${className}`}>
      <p className="text-sm text-muted-foreground">
        Mostrando{" "}
        <span className="font-medium text-foreground">{from}–{to}</span>{" "}
        de{" "}
        <span className="font-medium text-foreground">{total}</span>{" "}
        resultados
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-card/30 glass text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex items-center justify-center w-9 h-9 text-muted-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all border ${
                p === page
                  ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                  : "border-border/50 bg-card/30 glass text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-card/30 glass text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
