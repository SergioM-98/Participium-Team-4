"use client";

import { useState, useEffect } from "react";
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
  FileText,
  Eye, // Added Eye icon
  Loader2,
  AlertCircle,
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Tooltip Imports for functionality
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ReportDetailsDialog } from "./report-details-dialog";
import { getPendingApprovalReports } from "@/controllers/report.controller";

// ====================================================================
// TYPES & CONSTANTS
// ====================================================================

const categoryLabels: Record<string, string> = {
  WATER_SUPPLY: "Water Supply",
  ARCHITECTURAL_BARRIERS: "Architectural Barriers",
  SEWER_SYSTEM: "Sewer System",
  PUBLIC_LIGHTING: "Public Lighting",
  WASTE: "Waste",
  ROADS_SIGNS_AND_TRAFFIC_LIGHTS: "Roads, Signs & Traffic Lights",
  ROADS_AND_URBAN_FURNISHINGS: "Roads & Urban Furnishings",
  PUBLIC_GREEN_AREAS_AND_BACKGROUNDS: "Public Green Areas",
  OTHER: "Other",
};

export const STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;
export type ReportStatus = keyof typeof STATUS;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: keyof typeof categoryLabels;
  status: ReportStatus;
  dateSubmitted: string;
  isAnonymous: boolean;
  submitter: User;
  rejectionReason?: string;
  photos: string[];
  latitude: number;
  longitude: number;
}

// Status Colors Helper
const getStatusClasses = (status: ReportStatus): string => {
  switch (status) {
    case STATUS.RESOLVED:
      return "bg-green-600 text-white";
    case STATUS.REJECTED:
      return "bg-red-600 text-white";
    case STATUS.PENDING:
      return "bg-yellow-500 text-black";
    default: // IN_PROGRESS
      return "bg-blue-500 text-white";
  }
};

// ====================================================================
// COLUMN DEFINITIONS
// ====================================================================

const columns: ColumnDef<Report>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate font-medium">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    id: "submitter",
    accessorFn: (row) =>
      row.isAnonymous
        ? "Anonymous"
        : `${row.submitter.firstName} ${row.submitter.lastName}`,
    header: "Submitter",
    enableSorting: false,
    cell: ({ row }) => {
      const submitter = row.original.submitter;
      const isAnonymous = row.original.isAnonymous;

      if (isAnonymous) {
        return (
          <div className="font-medium text-muted-foreground">Anonymous</div>
        );
      }

      return (
        <div>
          <div className="font-medium">
            {submitter.firstName} {submitter.lastName}
          </div>
          <div className="text-muted-foreground text-xs">{submitter.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    filterFn: "equals",
    enableSorting: true,
    cell: ({ row }) => {
      const categoryKey = row.getValue(
        "category"
      ) as keyof typeof categoryLabels;
      const label = categoryLabels[categoryKey] || categoryKey;
      return <div className="text-sm font-medium">{label}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as ReportStatus;
      const className = `text-xs px-2 py-1 ${getStatusClasses(status)}`;

      return <Badge className={className}>{status.replace("_", " ")}</Badge>;
    },
  },
  {
    accessorKey: "dateSubmitted",
    header: () => "Submitted On",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateSubmitted"));
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div className="text-sm text-muted-foreground">{formatted}</div>;
    },
  },
  // NEW COLUMN FOR ACTIONS
  {
    id: "actions",
    header: () => <div className="text-center">Details</div>,
    enableSorting: false,
    cell: ({ row, table }) => {
      const report = row.original;
      const { setSelectedReport } = table.options.meta as {
        setSelectedReport: (report: Report) => void;
      };

      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto h-8 p-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click event
                    setSelectedReport(report);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
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

interface AllReportsListProps {
  data?: Report[];
}

export function AllReportsList({ data }: AllReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>(data || []);
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Default sorting remains on Date Submitted (newest first)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "dateSubmitted", desc: true },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  // Function to fetch reports
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getPendingApprovalReports("PENDING_APPROVAL");

      if (!response.success) {
        setError(response.error || "Failed to load reports");
        setReports([]);
        return;
      }

      // Transform the response data to match Report interface
      // inside fetchReports function (~line 200)
      const transformedReports = response.data.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category as keyof typeof categoryLabels,
        status: STATUS.PENDING,
        dateSubmitted: new Date().toISOString(),
        isAnonymous: !r.citizen,
        submitter: r.citizen
          ? {
              id: r.citizen.id,
              firstName: r.citizen.firstName,
              lastName: r.citizen.lastName,
              email: r.citizen.email,
              username: r.citizen.username,
            }
          : {
              id: "anon",
              firstName: "Anonymous",
              lastName: "User",
              email: "",
              username: "",
            },
        rejectionReason: undefined,
        // FIX: Force this to be an array if r.photos is null/undefined
        photos: Array.isArray(r.photos) ? r.photos : [],
        latitude: r.latitude,
        longitude: r.longitude,
      }));

      setReports(transformedReports);
    } catch (err) {
      setError("An unexpected error occurred");
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reports from backend on component mount and when refreshTrigger changes
  useEffect(() => {
    if (data && data.length > 0) {
      // If data is provided as prop, use it
      setReports(data);
      setIsLoading(false);
    } else {
      // Otherwise, fetch from backend
      fetchReports();
    }
  }, [refreshTrigger]);

  const handleDialogClose = () => {
    setSelectedReport(null);
    // Trigger a refresh of the reports list
    setRefreshTrigger((prev) => prev + 1);
  };

  const table = useReactTable({
    data: reports,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    globalFilterFn: (row, columnId, filterValue) => {
      const lowerFilter = filterValue.toLowerCase();
      const submitter = row.original.submitter;

      if (row.original.isAnonymous) return false;

      const fullName =
        `${submitter.firstName} ${submitter.lastName}`.toLowerCase();
      const email = submitter.email.toLowerCase();

      return fullName.includes(lowerFilter) || email.includes(lowerFilter);
    },
    // Pass setSelectedReport via meta data so the cell renderer can use it.
    meta: {
      setSelectedReport: setSelectedReport,
    },
  });

  const handleCategoryFilter = (categoryKey: string) => {
    table
      .getColumn("category")
      ?.setFilterValue(categoryKey === "ALL" ? undefined : categoryKey);
  };

  const currentCategoryFilter =
    (table.getColumn("category")?.getFilterValue() as string) ?? "ALL";
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          All Submitted Reports
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          A full list of all community reports submitted to the system.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4 w-full">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by submitter name or email..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Category Filters */}
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by category:</span>
          </div>

          {/* Single-line flex container with equal width distribution */}
          <div className="flex gap-2 w-full [&>button]:flex-1">
            <Button
              variant={currentCategoryFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter("ALL")}
              className="text-xs"
            >
              All
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={currentCategoryFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(key)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* --- */}

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredCount} {filteredCount === 1 ? "report" : "reports"} found
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading reports...</p>
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
                Error Loading Reports
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* TanStack Table */}
      {!isLoading && (
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
                    onClick={() => setSelectedReport(row.original)}
                    className="cursor-pointer"
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
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-md font-semibold mb-1">
                        No reports match your filters
                      </h3>
                      <p className="text-muted-foreground max-w-md text-sm">
                        Try adjusting your search query or category filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {filteredCount}{" "}
          row(s) selected.
        </div>
        <div className="space-x-2">
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

      {/* The Dialog Component is rendered here when a report is selected */}
      {selectedReport && (
        <ReportDetailsDialog
          report={selectedReport}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
