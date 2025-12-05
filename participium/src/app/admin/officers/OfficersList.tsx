"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  Edit,
  Loader2,
  AlertCircle,
  Building2,
  Briefcase,
  ShieldAlert,
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getAllOfficers } from "@/controllers/user.controller";

// ====================================================================
// TYPES & CONSTANTS
// ====================================================================

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  PUBLIC_RELATIONS_OFFICER: "Public Relations",
  TECHNICAL_OFFICER: "Technical Officer",
  EXTERNAL_MAINTAINER_WITH_ACCESS: "Ext. Maintainer (Access)",
  EXTERNAL_MAINTAINER_WITHOUT_ACCESS: "Ext. Maintainer (No Access)",
};

export interface OfficerUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: keyof typeof roleLabels;
  office?: string | null;
  company?: string | null; // Company Name
  companyId?: string | null;
  email?: string | null;
}

const formatEnumString = (str?: string | null) => {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// ====================================================================
// COLUMN DEFINITIONS
// ====================================================================

const columns: ColumnDef<OfficerUser>[] = [
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </div>
        <div className="text-xs text-muted-foreground">
          @{row.getValue("username")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: "equals",
    cell: ({ row }) => {
      const roleKey = row.getValue("role") as string;
      const label = roleLabels[roleKey] || formatEnumString(roleKey);

      // Removed specific color logic, using standard outline variant
      return (
        <Badge variant="outline" className="text-xs font-normal">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "assignment",
    header: "Assignment",
    cell: ({ row }) => {
      const office = row.original.office;
      const company = row.original.company;

      // Removed specific text colors (blue/orange), using standard text
      if (office) {
        return (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span
              className="truncate max-w-[200px]"
              title={formatEnumString(office)}
            >
              {formatEnumString(office)}
            </span>
          </div>
        );
      }
      if (company) {
        return (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate max-w-[200px]" title={company}>
              {company}
            </span>
          </div>
        );
      }
      return <span className="text-muted-foreground text-xs">-</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/admin/officers/${row.original.id}/edit`}>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit User</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

// ====================================================================
// TABLE COMPONENT
// ====================================================================

export function OfficersList() {
  const [data, setData] = useState<OfficerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "username", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchOfficers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllOfficers();

      if (result.success && Array.isArray(result.data)) {
        setData(result.data as OfficerUser[]);
      } else {
        setError(result.error || "Failed to load officers");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const lowerFilter = filterValue.toLowerCase();
      const firstName = row.original.firstName.toLowerCase();
      const lastName = row.original.lastName.toLowerCase();
      const username = row.original.username.toLowerCase();
      return (
        firstName.includes(lowerFilter) ||
        lastName.includes(lowerFilter) ||
        username.includes(lowerFilter)
      );
    },
  });

  const handleRoleFilter = (roleKey: string) => {
    table
      .getColumn("role")
      ?.setFilterValue(roleKey === "ALL" ? undefined : roleKey);
  };

  const currentRoleFilter =
    (table.getColumn("role")?.getFilterValue() as string) ?? "ALL";
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage municipality officers, technical staff, and external
            maintainers.
          </p>
        </div>
        <Link href="/admin/officers/registration">
          <Button className="shrink-0">Create Officer</Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4 w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or username..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by role:</span>
          </div>

          <div className="flex flex-wrap gap-2 w-full">
            <Button
              variant={currentRoleFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleFilter("ALL")}
              className="text-xs"
            >
              All
            </Button>
            {Object.entries(roleLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={currentRoleFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleFilter(key)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredCount} {filteredCount === 1 ? "user" : "users"} found
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading officers...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive">
                Error Loading Users
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <ShieldAlert className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-md font-semibold mb-1">
                        No users match your filters
                      </h3>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
