import {
  getStatusColor,
  extractVisualizationPolygons,
  isPointInPolygon,
  createReportIcon,
  createClusterCustomIcon,
} from "@/components/map/utils";
import { LatLng } from "leaflet";

describe("Map Utils", () => {
  describe("getStatusColor", () => {
    it("should return correct color for PENDING_APPROVAL", () => {
      expect(getStatusColor("PENDING_APPROVAL")).toBe("#64748b");
      expect(getStatusColor("pending_approval")).toBe("#64748b");
      expect(getStatusColor(" PENDING_APPROVAL ")).toBe("#64748b");
    });

    it("should return correct color for ASSIGNED", () => {
      expect(getStatusColor("ASSIGNED")).toBe("#0891b2");
    });

    it("should return correct color for IN_PROGRESS", () => {
      expect(getStatusColor("IN_PROGRESS")).toBe("#f59e0b");
    });

    it("should return correct color for SUSPENDED", () => {
      expect(getStatusColor("SUSPENDED")).toBe("#a855f7");
    });

    it("should return correct color for REJECTED", () => {
      expect(getStatusColor("REJECTED")).toBe("#dc2626");
    });

    it("should return correct color for RESOLVED", () => {
      expect(getStatusColor("RESOLVED")).toBe("#10b981");
    });

    it("should return default color for unknown status", () => {
      expect(getStatusColor("UNKNOWN")).toBe("#6366f1");
      expect(getStatusColor("")).toBe("#6366f1");
    });
  });

  describe("extractVisualizationPolygons", () => {
    it("should extract polygons from Polygon geometry", () => {
      const geoJson = {
        features: [
          {
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [10, 20],
                  [30, 40],
                  [50, 60],
                ],
              ],
            },
          },
        ],
      };

      const result = extractVisualizationPolygons(geoJson);
      expect(result).toEqual([
        [
          [20, 10],
          [40, 30],
          [60, 50],
        ],
      ]);
    });

    it("should extract polygons from MultiPolygon geometry", () => {
      const geoJson = {
        features: [
          {
            geometry: {
              type: "MultiPolygon",
              coordinates: [
                [
                  [
                    [10, 20],
                    [30, 40],
                  ],
                ],
                [
                  [
                    [50, 60],
                    [70, 80],
                  ],
                ],
              ],
            },
          },
        ],
      };

      const result = extractVisualizationPolygons(geoJson);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([
        [20, 10],
        [40, 30],
      ]);
      expect(result[1]).toEqual([
        [60, 50],
        [80, 70],
      ]);
    });

    it("should return empty array for empty features", () => {
      const geoJson = { features: [] };
      const result = extractVisualizationPolygons(geoJson);
      expect(result).toEqual([]);
    });

    it("should handle missing features", () => {
      const geoJson = {};
      const result = extractVisualizationPolygons(geoJson);
      expect(result).toEqual([]);
    });
  });

  describe("isPointInPolygon", () => {
    const squarePolygon: [number, number][] = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ];

    it("should return true for point inside polygon", () => {
      const point = new LatLng(5, 5);
      expect(isPointInPolygon(point, squarePolygon)).toBe(true);
    });

    it("should return false for point outside polygon", () => {
      const point = new LatLng(15, 15);
      expect(isPointInPolygon(point, squarePolygon)).toBe(false);
    });

    it("should return false for point on edge", () => {
      const point = new LatLng(0, 5);
      const result = isPointInPolygon(point, squarePolygon);
      expect(typeof result).toBe("boolean");
    });

    it("should handle negative coordinates", () => {
      const point = new LatLng(5, 5);
      const negativePolygon: [number, number][] = [
        [-10, -10],
        [-10, 20],
        [20, 20],
        [20, -10],
      ];
      expect(isPointInPolygon(point, negativePolygon)).toBe(true);
    });

    it("should handle triangular polygon", () => {
      const triangle: [number, number][] = [
        [0, 0],
        [10, 0],
        [5, 10],
      ];
      const insidePoint = new LatLng(5, 3);
      const outsidePoint = new LatLng(15, 15);
      
      expect(isPointInPolygon(insidePoint, triangle)).toBe(true);
      expect(isPointInPolygon(outsidePoint, triangle)).toBe(false);
    });
  });

  describe("createReportIcon", () => {
    it("should create icon for report", () => {
      const icon = createReportIcon("WATER_SUPPLY", "PENDING_APPROVAL");
      expect(icon).toBeDefined();
      expect(icon.options.className).toBe("report-marker-icon");
    });

    it("should cache icons with same parameters", () => {
      const icon1 = createReportIcon("WASTE", "ASSIGNED");
      const icon2 = createReportIcon("WASTE", "ASSIGNED");
      expect(icon1).toBe(icon2);
    });

    it("should create different icons for different parameters", () => {
      const icon1 = createReportIcon("WASTE", "ASSIGNED");
      const icon2 = createReportIcon("WASTE", "RESOLVED");
      expect(icon1).not.toBe(icon2);
    });

    it("should have correct icon size", () => {
      const icon = createReportIcon("PUBLIC_LIGHTING", "IN_PROGRESS");
      expect(icon.options.iconSize?.x).toBe(40);
      expect(icon.options.iconSize?.y).toBe(40);
    });

    it("should have correct icon anchor", () => {
      const icon = createReportIcon("ROADS_AND_URBAN_FURNISHINGS", "SUSPENDED");
      expect(icon.options.iconAnchor?.x).toBe(20);
      expect(icon.options.iconAnchor?.y).toBe(20);
    });
  });

  describe("createClusterCustomIcon", () => {
    const mockCluster = (count: number) => ({
      getChildCount: () => count,
    });

    it("should create cluster icon with small size for count < 10", () => {
      const icon = createClusterCustomIcon(mockCluster(5));
      expect(icon).toBeDefined();
      expect(icon.options.iconSize?.x).toBe(40);
    });

    it("should create cluster icon with medium size for count >= 10", () => {
      const icon = createClusterCustomIcon(mockCluster(15));
      expect(icon.options.iconSize?.x).toBe(48);
    });

    it("should create cluster icon with large size for count >= 100", () => {
      const icon = createClusterCustomIcon(mockCluster(150));
      expect(icon.options.iconSize?.x).toBe(56);
    });

    it("should have correct className", () => {
      const icon = createClusterCustomIcon(mockCluster(25));
      expect(icon.options.className).toBe("leaflet-marker-cluster-custom");
    });
  });
});
