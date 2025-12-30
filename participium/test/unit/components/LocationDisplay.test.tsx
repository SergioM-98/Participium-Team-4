import { render, screen } from "@testing-library/react";
import LocationDisplay from "@/components/LocationDisplay";

describe("LocationDisplay", () => {
  it("should display 'No location selected' when no location provided", () => {
    render(<LocationDisplay />);
    expect(screen.getByText("No location selected")).toBeInTheDocument();
  });

  it("should display 'No location selected' when null is provided", () => {
    render(<LocationDisplay selected={null} />);
    expect(screen.getByText("No location selected")).toBeInTheDocument();
  });

  it("should display coordinates for array format [lat, lng]", () => {
    render(<LocationDisplay selected={[45.1234, 7.5678]} />);
    expect(screen.getByText(/Latitude: 45\.12340/)).toBeInTheDocument();
    expect(screen.getByText(/Longitude: 7\.56780/)).toBeInTheDocument();
  });

  it("should display coordinates with 5 decimal precision", () => {
    render(<LocationDisplay selected={[45.123456789, 7.987654321]} />);
    expect(screen.getByText(/Latitude: 45\.12346/)).toBeInTheDocument();
    expect(screen.getByText(/Longitude: 7\.98765/)).toBeInTheDocument();
  });

  it("should display coordinates for object format {lat, lng}", () => {
    render(<LocationDisplay selected={{ lat: 40.7128, lng: -74.0060 }} />);
    expect(screen.getByText(/Latitude: 40\.71280/)).toBeInTheDocument();
    expect(screen.getByText(/Longitude: -74\.00600/)).toBeInTheDocument();
  });

  it("should handle negative coordinates", () => {
    render(<LocationDisplay selected={[-33.8688, 151.2093]} />);
    expect(screen.getByText(/-33\.86880/)).toBeInTheDocument();
    expect(screen.getByText(/151\.20930/)).toBeInTheDocument();
  });

  it("should handle zero coordinates", () => {
    render(<LocationDisplay selected={[0, 0]} />);
    expect(screen.getByText(/Latitude: 0\.00000/)).toBeInTheDocument();
    expect(screen.getByText(/Longitude: 0\.00000/)).toBeInTheDocument();
  });

  it("should apply correct styling when location selected", () => {
    const { container } = render(<LocationDisplay selected={[45, 7]} />);
    const locationSpan = container.querySelector(".font-mono");
    expect(locationSpan).toBeInTheDocument();
    expect(locationSpan).toHaveClass("bg-white/90");
  });

  it("should apply gray styling when no location", () => {
    const { container } = render(<LocationDisplay />);
    const noLocationSpan = container.querySelector(".bg-gray-100\\/90");
    expect(noLocationSpan).toBeInTheDocument();
    expect(noLocationSpan).toHaveTextContent("No location selected");
  });
});
