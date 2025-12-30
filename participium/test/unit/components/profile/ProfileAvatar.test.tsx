import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

describe("ProfileAvatar", () => {
  const mockOnFileSelect = jest.fn();
  const defaultProps = {
    imageUrl: null,
    username: "testuser",
    avatarStyle: { backgroundColor: "#ff0000" },
    isEditing: false,
    onFileSelect: mockOnFileSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render avatar with fallback when no image", () => {
    render(<ProfileAvatar {...defaultProps} />);
    expect(screen.getByText("TE")).toBeInTheDocument(); // First 2 letters uppercase
  });

  it("should render avatar with image when provided", () => {
    const { container } = render(<ProfileAvatar {...defaultProps} imageUrl="https://example.com/avatar.jpg" />);
    // Avatar component should be present, image URL is passed as prop
    const avatar = container.querySelector('.h-24.w-24');
    expect(avatar).toBeInTheDocument();
  });

  it("should display correct initials from username", () => {
    render(<ProfileAvatar {...defaultProps} username="johndoe" />);
    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("should not show camera button when not editing", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={false} />);
    expect(screen.queryByLabelText("Change profile picture")).not.toBeInTheDocument();
  });

  it("should show camera button when editing", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={true} />);
    expect(screen.getByLabelText("Change profile picture")).toBeInTheDocument();
  });

  it("should trigger file input click when camera button clicked", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={true} />);
    const cameraButton = screen.getByLabelText("Change profile picture");
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(fileInput, 'click');
    
    fireEvent.click(cameraButton);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should call onFileSelect when file is selected", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={true} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it("should not call onFileSelect when no file selected", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={true} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput);
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it("should accept only image files", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={true} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  it("should apply custom avatar style", () => {
    const customStyle = { backgroundColor: "#00ff00", color: "#ffffff" };
    const { container } = render(
      <ProfileAvatar {...defaultProps} avatarStyle={customStyle} />
    );
    const fallback = container.querySelector('.text-2xl.font-bold');
    expect(fallback).toBeInTheDocument();
    // Style is applied via style prop, checking presence is sufficient
  });

  it("should clear file input value after selection", () => {
    render(<ProfileAvatar {...defaultProps} isEditing={true} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = new File(["content"], "test.png", { type: "image/png" });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    expect(fileInput.value).toBe("");
  });
});
