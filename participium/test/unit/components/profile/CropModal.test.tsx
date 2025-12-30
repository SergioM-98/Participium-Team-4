import { render, screen, fireEvent } from "@testing-library/react";
import { CropModal } from "@/components/profile/CropModal";

jest.mock("react-easy-crop", () => {
  return function MockCropper(props: any) {
    return (
      <div data-testid="cropper" data-image={props.image}>
        Mock Cropper
      </div>
    );
  };
});

describe("CropModal", () => {
  const mockOnCropChange = jest.fn();
  const mockOnZoomChange = jest.fn();
  const mockOnCropComplete = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    imageSrc: "https://example.com/image.jpg",
    crop: { x: 0, y: 0 },
    zoom: 1,
    onCropChange: mockOnCropChange,
    onZoomChange: mockOnZoomChange,
    onCropComplete: mockOnCropComplete,
    onClose: mockOnClose,
    onSave: mockOnSave,
    isOpen: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(<CropModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when imageSrc is null", () => {
    const { container } = render(<CropModal {...defaultProps} imageSrc={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true and imageSrc exists", () => {
    render(<CropModal {...defaultProps} />);
    expect(screen.getByTestId("cropper")).toBeInTheDocument();
  });

  it("should render modal title", () => {
    render(<CropModal {...defaultProps} />);
    expect(screen.getByText("Adjust Profile Picture")).toBeInTheDocument();
  });

  it("should render modal description", () => {
    render(<CropModal {...defaultProps} />);
    expect(screen.getByText("Drag to position, use slider to zoom.")).toBeInTheDocument();
  });

  it("should render Cropper component with correct image", () => {
    render(<CropModal {...defaultProps} />);
    const cropper = screen.getByTestId("cropper");
    expect(cropper).toHaveAttribute("data-image", "https://example.com/image.jpg");
  });

  it("should render zoom slider", () => {
    render(<CropModal {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "3");
    expect(slider).toHaveAttribute("step", "0.1");
  });

  it("should call onZoomChange when slider value changes", () => {
    render(<CropModal {...defaultProps} />);
    const slider = screen.getByRole("slider");
    
    fireEvent.change(slider, { target: { value: "2" } });
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(2);
  });

  it("should render Cancel button", () => {
    render(<CropModal {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should render Save & Upload button", () => {
    render(<CropModal {...defaultProps} />);
    expect(screen.getByText("Save & Upload")).toBeInTheDocument();
  });

  it("should call onClose when Cancel button is clicked", () => {
    render(<CropModal {...defaultProps} />);
    const cancelButton = screen.getByText("Cancel");
    
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should call onSave when Save & Upload button is clicked", () => {
    render(<CropModal {...defaultProps} />);
    const saveButton = screen.getByText("Save & Upload");
    
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should render ZoomIn and ZoomOut icons", () => {
    const { container } = render(<CropModal {...defaultProps} />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should have proper modal overlay styling", () => {
    const { container } = render(<CropModal {...defaultProps} />);
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("bg-black/80");
  });

  it("should set zoom slider value correctly", () => {
    render(<CropModal {...defaultProps} zoom={2.5} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("2.5");
  });

  it("should render with different imageSrc", () => {
    render(<CropModal {...defaultProps} imageSrc="https://example.com/different.jpg" />);
    const cropper = screen.getByTestId("cropper");
    expect(cropper).toHaveAttribute("data-image", "https://example.com/different.jpg");
  });
});
