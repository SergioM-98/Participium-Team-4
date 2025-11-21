"use client";

// --- IMPORTS (Simplified) ---
import * as React from "react";
import { useRouter } from "next/navigation";
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
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Search, Filter, FileText } from "lucide-react";

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
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ReportDetailsDialog } from "./report-details-dialog";

// --- END IMPORTS ---

// ====================================================================
// A. DUMMY DATA AND TYPES
// ====================================================================

// Constants for Status
export const STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;

export type ReportStatus = keyof typeof STATUS;

// Report Type Definition (Updated for details view)
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string; // Added to satisfy ReportDetailsClient usage
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

// Dummy Data (Kept the same)
export const dummyReports: Report[] = [
  {
    id: "r1",
    title: "Pothole on Main Street near Library",
    description:
      "Large, deep pothole has formed right in front of the public library entrance, causing traffic disruption and vehicle damage risk.",
    category: "ROADS_AND_URBAN_FURNISHINGS",
    status: STATUS.PENDING,
    dateSubmitted: "2024-10-20T10:00:00Z",
    isAnonymous: false,
    submitter: {
      id: "u1",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice.s@example.com",
      username: "alicesmith",
    },
    rejectionReason: undefined,
    photos: ["/img/r1_p1.jpg"],
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "r2",
    title: "Broken Traffic Light at Oak & Elm",
    description:
      "The traffic light facing East on the corner of Oak and Elm has been stuck on red for the past two hours. Major congestion.",
    category: "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
    status: STATUS.IN_PROGRESS,
    dateSubmitted: "2024-10-21T14:30:00Z",
    isAnonymous: true,
    submitter: {
      id: "u2",
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob.j@example.com",
      username: "bobj",
    },
    rejectionReason: undefined,
    photos: ["/img/r2_p1.jpg", "/img/r2_p2.jpg"],
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: "r3",
    title: "Overflowing Public Trash Bin at Park",
    description:
      "Trash bin near the playground is completely full, and waste is spilling out onto the grass. Needs immediate collection.",
    category: "WASTE",
    status: STATUS.RESOLVED,
    dateSubmitted: "2024-10-18T08:15:00Z",
    isAnonymous: false,
    submitter: {
      id: "u3",
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie.b@example.com",
      username: "charlieb",
    },
    rejectionReason: undefined,
    photos: ["/img/r3_p1.jpg"],
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: "r4",
    title: "Non-functional street lamp on River Road",
    description:
      "Street lamp 34B is out. Area is very dark at night, creating a safety issue for pedestrians.",
    category: "PUBLIC_LIGHTING",
    status: STATUS.PENDING,
    dateSubmitted: "2024-10-22T16:00:00Z",
    isAnonymous: true,
    submitter: {
      id: "u4",
      firstName: "Diana",
      lastName: "Prince",
      email: "dianap",
      username: "",
    },
    rejectionReason: undefined,
    photos: [],
    latitude: 32.7767,
    longitude: -96.797,
  },
  {
    id: "r5",
    title: "Illegal dumping behind supermarket",
    description:
      "Someone dumped several old mattresses and construction debris behind the new supermarket location.",
    category: "WASTE",
    status: STATUS.REJECTED,
    dateSubmitted: "2024-10-23T11:45:00Z",
    isAnonymous: false,
    submitter: {
      id: "u5",
      firstName: "Evan",
      lastName: "Taylor",
      email: "evan.t@example.com",
      username: "evant",
    },
    rejectionReason:
      "The reported debris is on private property, not public land.",
    photos: ["/img/r5_p1.jpg"],
    latitude: 29.7604,
    longitude: -95.3698,
  },
  {
    id: "r6",
    title: "Fountain leaking excessively",
    description:
      "The main decorative fountain in the town square is leaking a significant amount of water from its base.",
    category: "WATER_SUPPLY",
    status: STATUS.IN_PROGRESS,
    dateSubmitted: "2024-10-24T09:30:00Z",
    isAnonymous: false,
    submitter: {
      id: "u6",
      firstName: "Fiona",
      lastName: "Green",
      email: "fiona.g@example.com",
      username: "fionag",
    },
    rejectionReason: undefined,
    photos: ["/img/r6_p1.jpg", "/img/r6_p2.jpg", "/img/r6_p3.jpg"],
    latitude: 33.4484,
    longitude: -112.074,
  },
];

// ====================================================================
// B. CONSTANTS (Styling)
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

// ====================================================================
// 1. COLUMN DEFINITIONS (Kept the same)
// ====================================================================

export const columns: ColumnDef<Report>[] = [
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitter
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    cell: ({ row }) => {
      const categoryKey = row.getValue(
        "category"
      ) as keyof typeof categoryLabels;
      const label = categoryLabels[categoryKey] || categoryKey;

      // Category rendered as plain text (no colors/badges)
      return <div className="text-sm font-medium">{label}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ReportStatus;

      let className = "text-xs px-2 py-1";

      switch (status) {
        case STATUS.RESOLVED:
          className += " bg-green-600 hover:bg-green-600/80 text-white";
          break;
        case STATUS.REJECTED:
          className += " bg-red-600 hover:bg-red-600/80 text-white";
          break;
        case STATUS.PENDING:
          className += " bg-yellow-500 hover:bg-yellow-500/80 text-black";
          break;
        default: // IN_PROGRESS
          className += " bg-blue-500 hover:bg-blue-500/80 text-white";
          break;
      }

      return <Badge className={className}>{status.replace("_", " ")}</Badge>;
    },
  },
  {
    accessorKey: "dateSubmitted",
    header: () => <div className="text-right">Submitted On</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateSubmitted"));
      // Formatting matches original component's locale style
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return (
        <div className="text-right text-sm text-muted-foreground">
          {formatted}
        </div>
      ); // Kept the subtle text styling
    },
  },
  // The 'actions' column remains empty
];

// ====================================================================
// 2. TABLE COMPONENT
// ====================================================================

interface AllReportsListProps {
  data?: Report[];
}

export function AllReportsList({ data = dummyReports }: AllReportsListProps) {
  const router = useRouter();

  // State for the modal dialog
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(
    null
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "dateSubmitted", desc: true }, // Default sorting: most recent first
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    // MODIFICATION: Update globalFilterFn to search by submitter name or email
    globalFilterFn: (row, columnId, filterValue) => {
      const lowerFilter = filterValue.toLowerCase();
      const submitter = row.original.submitter;

      // Check for anonymous reports
      if (row.original.isAnonymous) {
        return false; // Anonymous reports cannot be filtered by name/email
      }

      // Check full name, first name, last name, and email
      const fullName =
        `${submitter.firstName} ${submitter.lastName}`.toLowerCase();
      const firstName = submitter.firstName.toLowerCase();
      const lastName = submitter.lastName.toLowerCase();
      const email = submitter.email.toLowerCase();

      return (
        fullName.includes(lowerFilter) ||
        firstName.includes(lowerFilter) ||
        lastName.includes(lowerFilter) ||
        email.includes(lowerFilter)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const handleRowClick = (report: Report) => {
    // Row click opens the details dialog
    setSelectedReport(report);
  };

  const currentCategoryFilter =
    (table.getColumn("category")?.getFilterValue() as string) ?? "ALL";

  const handleCategoryFilter = (categoryKey: string) => {
    if (categoryKey === "ALL") {
      table.getColumn("category")?.setFilterValue(undefined);
    } else {
      table.getColumn("category")?.setFilterValue(categoryKey);
    }
  };

  const categoryKeys = Object.keys(categoryLabels);
  const totalButtons = categoryKeys.length + 1;

  const getGridClasses = () => {
    // Find the best fit for all buttons (max 6 columns)
    const lgCols = Math.min(totalButtons, 6);
    const mdCols = Math.min(totalButtons, 5);
    const smCols = Math.min(totalButtons, 4);
    const xsCols = Math.min(totalButtons, 3);

    // We use explicit grid styles to force equal width distribution, maximizing horizontal usage.
    return `grid grid-cols-${xsCols} sm:grid-cols-${smCols} md:grid-cols-${mdCols} lg:grid-cols-${lgCols} gap-2`;
  };

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

      {/* Filters and Search - Ensures full width alignment */}
      <div className="mb-6 space-y-4 w-full">
        {/* Search Input - MODIFIED placeholder text */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by submitter name or email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Category Filters - Uses a responsive grid to distribute button width equally */}
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by category:</span>
          </div>

          {/* Single-line flex container with equal width distribution */}
          <div className="flex gap-2 w-full [&>button]:flex-1">
            {/* All Button */}
            <Button
              variant={currentCategoryFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter("ALL")}
              className="text-xs"
            >
              All
            </Button>

            {/* Category Buttons */}
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
          {table.getFilteredRowModel().rows.length}{" "}
          {table.getFilteredRowModel().rows.length === 1 ? "report" : "reports"}{" "}
          found
        </p>
      </div>

      {/* TanStack Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
