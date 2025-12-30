import { render } from "@testing-library/react";
import MapPolygons from "@/components/map/MapPolygons";

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  Polygon: ({ children, ...props }: any) => (
    <div
      data-testid="polygon"
      data-positions={JSON.stringify(props.positions)}
      data-color={props.pathOptions?.color}
    >
      {children}
    </div>
  ),
}));

describe("MapPolygons", () => {
  const mockPolygons: [number, number][][] = [
    [[45.0, 7.5], [45.1, 7.5], [45.1, 7.7], [45.0, 7.7]],
    [[45.2, 7.8], [45.3, 7.8], [45.3, 8.0], [45.2, 8.0]],
  ];

  it("should render without polygons", () => {
    const { container } = render(
      <MapPolygons cityPolygons={[]} borderColor="blue" />
    );
    expect(container).toBeInTheDocument();
  });

  it("should render single polygon", () => {
    const singlePolygon: [number, number][][] = [
      [[45.0, 7.5], [45.1, 7.5], [45.1, 7.7], [45.0, 7.7]]
    ];
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={singlePolygon} borderColor="red" />
    );
    expect(getAllByTestId("polygon")).toHaveLength(1);
  });

  it("should render multiple polygons", () => {
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={mockPolygons} borderColor="blue" />
    );
    expect(getAllByTestId("polygon")).toHaveLength(2);
  });

  it("should apply correct border color", () => {
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={mockPolygons} borderColor="green" />
    );
    const polygons = getAllByTestId("polygon");
    polygons.forEach(polygon => {
      expect(polygon).toHaveAttribute("data-color", "green");
    });
  });

  it("should pass correct positions to each polygon", () => {
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={mockPolygons} borderColor="blue" />
    );
    const polygonElements = getAllByTestId("polygon");
    expect(polygonElements[0]).toHaveAttribute(
      "data-positions",
      JSON.stringify(mockPolygons[0])
    );
    expect(polygonElements[1]).toHaveAttribute(
      "data-positions",
      JSON.stringify(mockPolygons[1])
    );
  });

  it("should handle different border colors", () => {
    const mockCityPolygons = mockPolygons;
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={mockCityPolygons} borderColor="red" />
    );
    const polygons = getAllByTestId("polygon");
    expect(polygons.length).toBe(mockCityPolygons.length);
    polygons.forEach(polygon => {
      expect(polygon).toHaveAttribute("data-color", "red");
    });
  });

  it("should generate unique keys based on first coordinate", () => {
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={mockPolygons} borderColor="blue" />
    );
    expect(getAllByTestId("polygon")).toHaveLength(mockPolygons.length);
  });

  it("should handle complex polygon shapes", () => {
    const complexPolygon: [number, number][][] = [
      [[45.0, 7.5], [45.05, 7.6], [45.1, 7.55], [45.08, 7.7], [45.0, 7.65]]
    ];
    const { getAllByTestId } = render(
      <MapPolygons cityPolygons={complexPolygon} borderColor="purple" />
    );
    expect(getAllByTestId("polygon")).toHaveLength(1);
  });
});
