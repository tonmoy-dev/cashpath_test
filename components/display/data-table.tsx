"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/navigation/pagination"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  emptyMessage?: string
  className?: string
}

type SortDirection = "asc" | "desc" | null

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  sortable = true,
  paginated = true,
  pageSize = 10,
  emptyMessage = "No data available",
  className = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search term
  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : data

  // Sort data
  const sortedData =
    sortable && sortColumn && sortDirection
      ? [...filteredData].sort((a, b) => {
          const aValue = a[sortColumn]
          const bValue = b[sortColumn]

          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
          return 0
        })
      : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = paginated ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedData

  const handleSort = (column: keyof T) => {
    if (!sortable) return

    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: keyof T) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4" />
    if (sortDirection === "asc") return <ArrowUp className="w-4 h-4" />
    if (sortDirection === "desc") return <ArrowDown className="w-4 h-4" />
    return <ArrowUpDown className="w-4 h-4" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${
                      column.sortable !== false && sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    } ${column.className || ""}`}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable !== false && sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={String(column.key)} className={`px-4 py-3 text-sm ${column.className || ""}`}>
                        {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paginated && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedData.length}
          pageSize={pageSize}
        />
      )}
    </div>
  )
}
