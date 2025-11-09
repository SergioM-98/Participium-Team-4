"use client";

// --- IMPORTS ---
import * as React from "react";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// --- END IMPORTS ---

// Submitter info
export type Submitter = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

// Report categories
export const CATEGORIES = {
  WATER: "Water Supply - Drinking Water",
  BARRIERS: "Architectural Barriers",
  SEWER: "Sewer System",
  LIGHTING: "Public Lighting",
  WASTE: "Waste",
  SIGNS: "Road Signs and Traffic Lights",
  ROADS: "Roads and Urban Furnishings",
  GREEN: "Public Green Areas and Playgrounds",
  OTHER: "Other",
} as const;
export type ReportCategory = (typeof CATEGORIES)[keyof typeof CATEGORIES];

// Report statuses
export const STATUS = {
  PENDING: "Pending Approval",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
} as const;
export type ReportStatus = (typeof STATUS)[keyof typeof STATUS];

// The full Report structure
export type Report = {
  // --- Citizen-submitted fields ---
  id: string; // Server-generated unique ID
  title: string; //
  description: string; // "textual description"
  category: ReportCategory; //
  photos: string[]; // 1-3 photos
  latitude: number; // From map point
  longitude: number; // From map point
  isAnonymous: boolean; //

  // --- User/Submitter info ---
  submitter: Submitter; // Based on registered user

  // --- Lifecycle/Admin fields ---
  status: ReportStatus; //
  dateSubmitted: string;
  rejectionReason?: string; //
};

// Dummy Data

const data: Report[] = [
  {
    id: "RPT-001",
    title: "Large pothole on main road",
    description: "A very deep and dangerous pothole at the intersection...",
    category: CATEGORIES.ROADS,
    photos: ["https://via.placeholder.com/600/92c952"],
    latitude: 45.0703,
    longitude: 7.6869,
    isAnonymous: false,
    submitter: {
      firstName: "Ken",
      lastName: "Adams",
      email: "ken99@example.com",
      username: "ken99",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-27",
  },
  {
    id: "RPT-002",
    title: "Streetlight out",
    description:
      "The streetlight in front of my house has been out for 3 days.",
    category: CATEGORIES.LIGHTING,
    photos: [
      "https://via.placeholder.com/600/771796",
      "https://via.placeholder.com/600/24f355",
    ],
    latitude: 45.0711,
    longitude: 7.6852,
    isAnonymous: false,
    submitter: {
      firstName: "Abe",
      lastName: "Lincoln",
      email: "Abe45@example.com",
      username: "abe45",
    },
    status: STATUS.ASSIGNED,
    dateSubmitted: "2023-10-25",
  },
  {
    id: "RPT-003",
    title: "Trash overflow at Parco Valentino",
    description: "The bins at the park are overflowing.",
    category: CATEGORIES.WASTE,
    photos: [
      "https://via.placeholder.com/600/f66b97",
      "https://via.placeholder.com/600/56a8c2",
      "https://via.placeholder.com/600/b0f7cc",
    ],
    latitude: 45.0688,
    longitude: 7.6888,
    isAnonymous: true, //
    submitter: {
      firstName: "Monserrat",
      lastName: "Lopez",
      email: "Monserrat44@example.com",
      username: "monserrat44",
    },
    status: STATUS.IN_PROGRESS,
    dateSubmitted: "2023-10-28",
  },
  {
    id: "RPT-004",
    title: "Duplicate report",
    description: "This was reported by someone else already.",
    category: CATEGORIES.OTHER,
    photos: ["https://via.placeholder.com/600/51aa97"],
    latitude: 45.0699,
    longitude: 7.6833,
    isAnonymous: false,
    submitter: {
      firstName: "Silas",
      lastName: "Ortega",
      email: "Silas22@example.com",
      username: "silas22",
    },
    status: STATUS.REJECTED,
    dateSubmitted: "2023-10-24",
    rejectionReason: "This issue has already been reported (see RPT-001).", //
  },
  {
    id: "RPT-005",
    title: "Broken swing at playground",
    description: "The swing chain is broken and unsafe for children.",
    category: CATEGORIES.GREEN,
    photos: ["https://via.placeholder.com/600/d32776"],
    latitude: 45.0722,
    longitude: 7.6811,
    isAnonymous: false,
    submitter: {
      firstName: "Carmella",
      lastName: "Smith",
      email: "carmella@example.com",
      username: "carmella",
    },
    status: STATUS.RESOLVED,
    dateSubmitted: "2023-10-22",
  },
  // --- START: Added dummy reports for pagination ---
  {
    id: "RPT-006",
    title: "Blocked sewer drain",
    description: "Water is flooding the street from a blocked sewer.",
    category: CATEGORIES.SEWER,
    photos: ["https://via.placeholder.com/600/5c6891"],
    latitude: 45.0735,
    longitude: 7.6801,
    isAnonymous: false,
    submitter: {
      firstName: "David",
      lastName: "Lee",
      email: "david.lee@example.com",
      username: "davidl",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-29",
  },
  {
    id: "RPT-007",
    title: "Missing stop sign",
    description: "The stop sign at the corner of Via Po is missing.",
    category: CATEGORIES.SIGNS,
    photos: ["https://via.placeholder.com/600/a74661"],
    latitude: 45.0683,
    longitude: 7.6912,
    isAnonymous: false,
    submitter: {
      firstName: "Maria",
      lastName: "Garcia",
      email: "m.garcia@example.com",
      username: "mariag",
    },
    status: STATUS.ASSIGNED,
    dateSubmitted: "2023-10-29",
  },
  {
    id: "RPT-008",
    title: "Ramp without access",
    description: "Sidewalk ramp is blocked by a new telephone pole.",
    category: CATEGORIES.BARRIERS,
    photos: ["https://via.placeholder.com/600/b8d399"],
    latitude: 45.0677,
    longitude: 7.6819,
    isAnonymous: false,
    submitter: {
      firstName: "Chen",
      lastName: "Wang",
      email: "chen.wang@example.com",
      username: "chenw",
    },
    status: STATUS.IN_PROGRESS,
    dateSubmitted: "2023-10-28",
  },
  {
    id: "RPT-009",
    title: "Flickering traffic light",
    description: "The red light at Corso Vittorio is flickering on and off.",
    category: CATEGORIES.SIGNS,
    photos: ["https://via.placeholder.com/600/f0b6c6"],
    latitude: 45.0649,
    longitude: 7.6835,
    isAnonymous: false,
    submitter: {
      firstName: "Ken",
      lastName: "Adams",
      email: "ken99@example.com",
      username: "ken99",
    },
    status: STATUS.SUSPENDED,
    dateSubmitted: "2023-10-27",
  },
  {
    id: "RPT-010",
    title: "Leaking fire hydrant",
    description: "A fire hydrant is leaking large amounts of water.",
    category: CATEGORIES.WATER,
    photos: ["https://via.placeholder.com/600/1b9d40"],
    latitude: 45.0631,
    longitude: 7.6811,
    isAnonymous: true,
    submitter: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      username: "testuser",
    },
    status: STATUS.RESOLVED,
    dateSubmitted: "2023-10-26",
  },
  {
    id: "RPT-011",
    title: "Overgrown trees in park",
    description: "Tree branches are blocking the path in Parco Ruffini.",
    category: CATEGORIES.GREEN,
    photos: ["https://via.placeholder.com/600/96f64c"],
    latitude: 45.0601,
    longitude: 7.6391,
    isAnonymous: false,
    submitter: {
      firstName: "Abe",
      lastName: "Lincoln",
      email: "Abe45@example.com",
      username: "abe45",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-29",
  },
  {
    id: "RPT-012",
    title: "Graffiti on public building",
    description: "Graffiti on the side of the municipal library.",
    category: CATEGORIES.ROADS,
    photos: ["https://via.placeholder.com/600/e66a9f"],
    latitude: 45.0718,
    longitude: 7.6848,
    isAnonymous: false,
    submitter: {
      firstName: "Silas",
      lastName: "Ortega",
      email: "Silas22@example.com",
      username: "silas22",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-29",
  },
  {
    id: "RPT-013",
    title: "Abandoned bicycle",
    description: "Bicycle chained to a post for months, now rusting.",
    category: CATEGORIES.WASTE,
    photos: ["https://via.placeholder.com/600/a2f9e9"],
    latitude: 45.0681,
    longitude: 7.6853,
    isAnonymous: false,
    submitter: {
      firstName: "Maria",
      lastName: "Garcia",
      email: "m.garcia@example.com",
      username: "mariag",
    },
    status: STATUS.ASSIGNED,
    dateSubmitted: "2023-10-29",
  },
  {
    id: "RPT-014",
    title: "No water pressure",
    description: "Very low water pressure in my building for 2 days.",
    category: CATEGORIES.WATER,
    photos: [], // Test case with no photos, though your rules say 1-3
    latitude: 45.0666,
    longitude: 7.6869,
    isAnonymous: false,
    submitter: {
      firstName: "David",
      lastName: "Lee",
      email: "david.lee@example.com",
      username: "davidl",
    },
    status: STATUS.IN_PROGRESS,
    dateSubmitted: "2023-10-28",
  },
  {
    id: "RPT-015",
    title: "Broken pavement",
    description: "The sidewalk is broken and uneven, a tripping hazard.",
    category: CATEGORIES.ROADS,
    photos: ["https://via.placeholder.com/600/d51a05"],
    latitude: 45.065,
    longitude: 7.6882,
    isAnonymous: false,
    submitter: {
      firstName: "Ken",
      lastName: "Adams",
      email: "ken99@example.com",
      username: "ken99",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-29",
  },
  // --- END: Added dummy reports ---
];

// Column Definitions

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
    // Submitter column logic based on anonymity
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
          <div className="font-medium text-muted-foreground">Anonymous</div> //
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
    // olumn for Category
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">{row.getValue("category")}</div>
    ),
  },
  {
    // Status column
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ReportStatus;

      let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
      let className = "";

      switch (status) {
        case STATUS.RESOLVED:
          badgeVariant = "default";
          className = "bg-green-600 hover:bg-green-600/80";
          break;
        case STATUS.REJECTED:
          badgeVariant = "destructive";
          break;
        case STATUS.PENDING:
          badgeVariant = "default";
          className = "bg-yellow-500 hover:bg-yellow-500/80 text-black";
          break;
        // Assigned, In Progress, Suspended
        default:
          badgeVariant = "secondary";
          className = "bg-blue-500 hover:bg-blue-500/80 text-white";
      }

      return (
        <Badge variant={badgeVariant} className={className}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "dateSubmitted",
    header: () => <div className="text-right">Submitted On</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateSubmitted"));
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const report = row.original;
      const status = report.status;

      const handleApprove = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert(
          `Report ${report.id} approved! (Status would change to 'Assigned')` //
        );
      };

      const handleReject = (e: React.MouseEvent) => {
        e.stopPropagation();
        const reason = prompt(
          `Why are you rejecting report ${report.id}? (This is mandatory)` //
        );
        if (reason) {
          alert(`Report ${report.id} rejected! Reason: ${reason}`);
        } else {
          alert("Rejection cancelled (reason is mandatory).");
        }
      };

      const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert(
          `Viewing details for ${report.id}. (Full data: ${JSON.stringify(
            report,
            null,
            2
          )})`
        );
      };

      // Per the lifecycle, approve/reject actions only apply to "Pending Approval" status
      const canModerate = status === STATUS.PENDING;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleViewDetails}>
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleApprove}
              disabled={!canModerate} // Only enabled if status is "Pending Approval"
              className="text-green-600 focus:text-green-600"
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReject}
              disabled={!canModerate} // Only enabled if status is "Pending Approval"
              className="text-red-600 focus:text-red-600"
            >
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Main Component

export function ReportsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Simulate navigation, showing the full report object
  const handleRowClick = (report: Report) => {
    alert(
      `Simulating navigation to details for report: ${report.id}\n
Title: ${report.title}\n
Category: ${report.category}\n
Description: ${report.description.substring(0, 50)}...\n
Anonymous: ${report.isAnonymous}`
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter submitters..."
          value={
            (table.getColumn("submitter")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("submitter")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {/* Display friendly column names */}
                    {column.id === "dateSubmitted" ? "Submitted On" : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
                  No results.
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
    </div>
  );
}
