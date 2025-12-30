import { render } from "@testing-library/react";
import { ReportMarkerIcon, ClusterMarkerIcon } from "@/components/map/MapIcons";

describe("MapIcons", () => {
  describe("ReportMarkerIcon", () => {
    it("should render for WATER_SUPPLY category", () => {
      const { container } = render(
        <ReportMarkerIcon category="WATER_SUPPLY" status="PENDING_APPROVAL" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for ARCHITECTURAL_BARRIERS category", () => {
      const { container } = render(
        <ReportMarkerIcon category="ARCHITECTURAL_BARRIERS" status="ASSIGNED" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for SEWER_SYSTEM category", () => {
      const { container } = render(
        <ReportMarkerIcon category="SEWER_SYSTEM" status="IN_PROGRESS" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for PUBLIC_LIGHTING category", () => {
      const { container } = render(
        <ReportMarkerIcon category="PUBLIC_LIGHTING" status="RESOLVED" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for WASTE category", () => {
      const { container } = render(
        <ReportMarkerIcon category="WASTE" status="SUSPENDED" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for ROADS_SIGNS_AND_TRAFFIC_LIGHTS category", () => {
      const { container } = render(
        <ReportMarkerIcon category="ROADS_SIGNS_AND_TRAFFIC_LIGHTS" status="REJECTED" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for ROADS_AND_URBAN_FURNISHINGS category", () => {
      const { container } = render(
        <ReportMarkerIcon category="ROADS_AND_URBAN_FURNISHINGS" status="ASSIGNED" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render for PUBLIC_GREEN_AREAS_AND_BACKGROUNDS category", () => {
      const { container } = render(
        <ReportMarkerIcon category="PUBLIC_GREEN_AREAS_AND_BACKGROUNDS" status="RESOLVED" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render default icon for unknown category", () => {
      const { container } = render(
        <ReportMarkerIcon category="UNKNOWN_CATEGORY" status="PENDING_APPROVAL" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should apply correct border color based on status", () => {
      const { container } = render(
        <ReportMarkerIcon category="WASTE" status="RESOLVED" />
      );
      const innerDiv = container.querySelector('[style*="border"]');
      expect(innerDiv).toBeInTheDocument();
    });

    it("should have correct structure with animations", () => {
      const { container } = render(
        <ReportMarkerIcon category="WATER_SUPPLY" status="ASSIGNED" />
      );
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
      expect(container.querySelector(".group")).toBeInTheDocument();
    });
  });

  describe("ClusterMarkerIcon", () => {
    it("should render cluster with count", () => {
      const { container } = render(<ClusterMarkerIcon count={5} />);
      expect(container.textContent).toBe("5");
    });

    it("should render cluster with large count", () => {
      const { container } = render(<ClusterMarkerIcon count={150} />);
      expect(container.textContent).toBe("150");
    });

    it("should render cluster with single digit", () => {
      const { container } = render(<ClusterMarkerIcon count={7} />);
      expect(container.textContent).toBe("7");
    });

    it("should have correct styling classes", () => {
      const { container } = render(<ClusterMarkerIcon count={10} />);
      const clusterDiv = container.querySelector(".bg-white\\/95");
      expect(clusterDiv).toBeInTheDocument();
      expect(clusterDiv).toHaveClass("rounded-full");
      expect(clusterDiv).toHaveClass("border-2");
      expect(clusterDiv).toHaveClass("border-primary");
    });

    it("should have hover effects", () => {
      const { container } = render(<ClusterMarkerIcon count={25} />);
      const clusterDiv = container.querySelector(".hover\\:bg-primary");
      expect(clusterDiv).toBeInTheDocument();
      expect(clusterDiv).toHaveClass("hover:scale-105");
    });

    it("should render with zero count", () => {
      const { container } = render(<ClusterMarkerIcon count={0} />);
      expect(container.textContent).toBe("0");
    });
  });
});
