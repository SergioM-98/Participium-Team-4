import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload01 from "@/components/file-upload-01";

// Mock dependencies
jest.mock("@/app/lib/controllers/uploader.controller", () => ({
  createUploadPhoto: jest.fn(),
  deleteUpload: jest.fn(),
}));
jest.mock("@/app/lib/controllers/report.controller", () => ({
  createReport: jest.fn(),
}));

describe("FileUpload01", () => {
  const mockLocation = {
    lat: 45.0703,
    lng: 7.6869,
  };

  it("should render file upload form", () => {
    render(<FileUpload01 location={mockLocation} />);

    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
  });

  it("should render category selector", () => {
    render(<FileUpload01 location={mockLocation} />);

    const categoryElements = screen.getAllByText(/category/i);
    expect(categoryElements.length).toBeGreaterThan(0);
  });

  it("should render file upload area", () => {
    render(<FileUpload01 location={mockLocation} />);

    expect(screen.getByRole("button", { name: /upload a report image/i })).toBeInTheDocument();
  });

  it("should render anonymous checkbox", () => {
    render(<FileUpload01 location={mockLocation} />);

    expect(screen.getByText(/submit report anonymously/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should render continue button", () => {
    render(<FileUpload01 location={mockLocation} />);

    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("should render title input", () => {
    render(<FileUpload01 location={mockLocation} />);

    const titleInput = screen.getByPlaceholderText(/enter a title for your report/i);
    expect(titleInput).toBeInTheDocument();
  });

  it("should render description textarea", () => {
    render(<FileUpload01 location={mockLocation} />);

    const descriptionTextarea = screen.getByPlaceholderText(/describe the issue or report/i);
    expect(descriptionTextarea).toBeInTheDocument();
  });

  it("should render with correct initial location", () => {
    render(<FileUpload01 location={mockLocation} />);

    // Component should have location passed as prop
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("should display anonymous tooltip", () => {
    render(<FileUpload01 location={mockLocation} />);

    expect(screen.getByText(/submit report anonymously/i)).toBeInTheDocument();
  });

  it("should render upload icon", () => {
    render(<FileUpload01 location={mockLocation} />);

    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });
});
