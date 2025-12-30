import { render } from "@testing-library/react";
import MapBase from "@/components/map/MapBase";

// Mock react-leaflet components
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props: any) => <div data-testid="tile-layer" {...props} />,
}));

describe("MapBase", () => {
  it("should render MapContainer", () => {
    const { getByTestId } = render(
      <MapBase>
        <div>Test Child</div>
      </MapBase>
    );
    expect(getByTestId("map-container")).toBeInTheDocument();
  });

  it("should render children inside MapContainer", () => {
    const { getByText } = render(
      <MapBase>
        <div>Test Child Content</div>
      </MapBase>
    );
    expect(getByText("Test Child Content")).toBeInTheDocument();
  });

  it("should render TileLayer", () => {
    const { getByTestId } = render(
      <MapBase>
        <div>Test</div>
      </MapBase>
    );
    expect(getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("should pass correct props to MapContainer", () => {
    const { getByTestId } = render(
      <MapBase>
        <div>Test</div>
      </MapBase>
    );
    const mapContainer = getByTestId("map-container");
    expect(mapContainer).toHaveClass("w-full");
    expect(mapContainer).toHaveClass("h-full");
  });

  it("should handle multiple children", () => {
    const { getByText } = render(
      <MapBase>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </MapBase>
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
    expect(getByText("Child 3")).toBeInTheDocument();
  });
});
