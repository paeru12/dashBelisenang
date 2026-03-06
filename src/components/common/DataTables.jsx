// Enterprise DataTables Component
// Features: Pagination, Search Debounce, Smart Auto Width, Image/Badge/Number Columns, Premium Skeleton, Dropdown Actions

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/common/DropdownTable";
import { MoreHorizontal } from "lucide-react";

export default function DataTablesEnterprise({
  title,
  description,
  columns = [],
  data = [],
  loading = false,
  meta = { page: 1, perPage: 10, totalPages: 1 },
  showNumber = true,
  rightAction,
  onSearch,
  onPageChange,
  onPerPageChange,
}) {
  const [searchInput, setSearchInput] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => onSearch?.(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>

      {/* Search + Per Page */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />

        <select
          value={meta.perPage}
          onChange={(e) => {
            onPerPageChange?.(Number(e.target.value));
            onPageChange?.(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm ">
          <thead className="bg-slate-50 border-b text-xs text-slate-500 uppercase">
            <tr>
              {showNumber && <th className="py-3 w-[40px]">No</th>}

              {columns.map((c) => (
                <th key={c.key} className="py-3 px-3 md:px-0 text-left whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows count={meta.perPage} colCount={columns.length + (showNumber ? 1 : 0)} />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-10 text-center text-slate-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="border-b hover:bg-slate-50 transition">
                  {showNumber && (
                    <td className="py-3 pl-2 font-semibold text-slate-600">
                      {(meta.page - 1) * meta.perPage + idx + 1}.
                    </td>
                  )}

                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-3 md:px-0 whitespace-nowrap">
                      {col.type === "image" ? (
                        <img
                          src={row[col.key]}
                          className="h-12 w-12 object-cover rounded-lg border"
                        />
                      ) : col.type === "badge" ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                          {row[col.key]}
                        </span>
                      ) : col.render ? (
                        col.render(row, idx)
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={onPageChange} />
    </div>
  );
}

/* ============================================= */
/* Premium Skeleton Loader                      */
/* ============================================= */
function SkeletonRows({ count, colCount }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-b animate-pulse">
      {Array.from({ length: colCount }).map((__, j) => (
        <td key={j} className="py-4">
          <Skeleton className="h-4 w-3/4" />
        </td>
      ))}
    </tr>
  ));
}

/* ============================================= */
/* Enterprise Pagination                         */
/* ============================================= */
function Pagination({ meta, onPageChange }) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-end items-center gap-1 mt-4">
      <Button
        size="sm"
        variant="outline"
        disabled={meta.page === 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Prev
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === meta.page ? "default" : "outline"}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button
        size="sm"
        variant="outline"
        disabled={meta.page === meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
