"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Filter,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getReportsByOfficerId } from "@/controllers/report.controller";
import type { RetrieveReportByOfficer } from "@/dtos/report.dto";
import { getPhoto } from "@/controllers/photo.controller";

type Report = RetrieveReportByOfficer;

interface ReportsListProps {
  officerId: string;
}

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

const categoryColors: Record<string, string> = {
  WATER_SUPPLY: "bg-blue-100 text-blue-800",
  ARCHITECTURAL_BARRIERS: "bg-purple-100 text-purple-800",
  SEWER_SYSTEM: "bg-amber-100 text-amber-800",
  PUBLIC_LIGHTING: "bg-yellow-100 text-yellow-800",
  WASTE: "bg-green-100 text-green-800",
  ROADS_SIGNS_AND_TRAFFIC_LIGHTS: "bg-red-100 text-red-800",
  ROADS_AND_URBAN_FURNISHINGS: "bg-orange-100 text-orange-800",
  PUBLIC_GREEN_AREAS_AND_BACKGROUNDS: "bg-emerald-100 text-emerald-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export default function ReportsList({ officerId }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [photoCache, setPhotoCache] = useState<Record<string, string>>({}); // Store photo data URLs

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getReportsByOfficerId(parseInt(officerId));

        if (!response.success) {
          setError(response.error || "Failed to load reports");
          return;
        }

        setReports(response.data);
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        if (reports && reports.length > 0) {
          const cache: Record<string, string> = {};

          for (const report of reports) {
            for (const photoFileName of report.photos) {
              if (cache[photoFileName]) continue;

              const photoResponse = await getPhoto(photoFileName);
              if (photoResponse.success && photoResponse.data) {
                cache[photoFileName] = photoResponse.data;
              }
            }
          }

          setPhotoCache(cache);
        }
      } catch (err) {
        console.error("Failed to fetch photos:", err);
      }
    }

    if (reports.length > 0) {
      fetchPhotos();
    }
  }, [reports]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          My Assigned Reports
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Overview of maintenance tasks assigned to you
        </p>
      </div>

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">
                Total Reports
              </CardDescription>
              <CardTitle className="text-3xl">{reports.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">
                Filtered Results
              </CardDescription>
              <CardTitle className="text-3xl">
                {filteredReports.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Categories</CardDescription>
              <CardTitle className="text-3xl">
                {new Set(reports.map((r) => r.category)).size}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by category:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("ALL")}
              className="text-xs"
            >
              All
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
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
          {filteredReports.length}{" "}
          {filteredReports.length === 1 ? "report" : "reports"} found
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your reports...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Error Loading Reports
            </h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery || selectedCategory !== "ALL"
                ? "Try adjusting your filters to see more results."
                : "You don't have any assigned reports yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {report.title}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      categoryColors[report.category]
                    }`}
                  >
                    {categoryLabels[report.category]}
                  </span>
                </div>
                <CardDescription className="line-clamp-3">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {report.photos.length}{" "}
                    {report.photos.length === 1 ? "photo" : "photos"}
                  </p>
                  <div className="flex gap-2 overflow-x-auto">
                    {report.photos.map((photoFileName, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 bg-muted rounded-md shrink-0 flex items-center justify-center border overflow-hidden"
                      >
                        {photoCache[photoFileName] ? (
                          <img
                            src={photoCache[photoFileName]}
                            alt={`Report photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setSelectedReport(report)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {selectedReport.title}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      categoryColors[selectedReport.category]
                    }`}
                  >
                    {categoryLabels[selectedReport.category]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="shrink-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Photos ({selectedReport.photos.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedReport.photos.map((photoFileName, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-muted rounded-lg flex items-center justify-center border overflow-hidden"
                    >
                      {photoCache[photoFileName] ? (
                        <img
                          src={photoCache[photoFileName]}
                          alt={`Report photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground">
                      Latitude: {selectedReport.latitude.toFixed(6)}
                    </p>
                    <p className="text-muted-foreground">
                      Longitude: {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1">Mark as In Progress</Button>
                <Button className="flex-1" variant="outline">
                  Mark as Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
