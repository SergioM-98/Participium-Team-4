"use client";

// --- IMPORTS ---
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
import { ArrowUpDown, ChevronDown, Eye } from "lucide-react";

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
// Added Tooltip imports
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import types from our data file
import { Report, ReportStatus, STATUS } from "@/lib/reports-data";
// --- END IMPORTS ---

// ====================================================================
// 1. COLUMN DEFINITIONS
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
        onClick={(e) => e.stopPropagation()} // Stop row click from triggering
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
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">{row.getValue("category")}</div>
    ),
  },
  {
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
  // --- MODIFIED ACTIONS COLUMN ---
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const router = useRouter(); // Use hook for navigation
      const report = row.original;

      const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation(); // Stop row click from triggering
        router.push(`/dashboard/reports/${report.id}`);
      };

      // Wrapped the Button in a Tooltip
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={handleViewDetails}
                aria-label="View details"
              >
                <span className="sr-only">View details</span>
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

// ====================================================================
// 2. TABLE COMPONENT
// ====================================================================

interface ReportsListClientProps {
  data: Report[];
}

export function ReportsListClient({ data }: ReportsListClientProps) {
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns, // <-- Uses the columns defined above
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

  const handleRowClick = (report: Report) => {
    router.push(`/dashboard/reports/${report.id}`);
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
