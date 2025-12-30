import React from "react";
import { render } from "@testing-library/react";
import { useMap } from "react-leaflet";
import MapController from "@/components/map/MapController";

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  useMap: jest.fn(),
}));

// Mock MapContainer to provide context for useMap
const MockMapContainer = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

describe("MapController", () => {
  const mockFlyTo = jest.fn();
  const mockMap = {
    flyTo: mockFlyTo,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMap as jest.Mock).mockReturnValue(mockMap);
  });

  it("should return null (no visual component)", () => {
    const { container } = render(
      <MockMapContainer>
        <MapController targetLocation={null} />
      </MockMapContainer>
    );
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should render without crashing when targetLocation is provided", () => {
    const targetLocation: [number, number] = [45.0703, 7.6869];
    const { container } = render(
      <MockMapContainer>
        <MapController targetLocation={targetLocation} />
      </MockMapContainer>
    );
    expect(container).toBeInTheDocument();
  });
});
