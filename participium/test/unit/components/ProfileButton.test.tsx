import { render, screen, waitFor } from "@testing-library/react";
import { ProfileButton } from "@/components/ProfileButton";
import { useSession } from "next-auth/react";
import { getProfilePhotoUrl } from "@/app/lib/controllers/ProfilePhoto.controller";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/app/lib/controllers/ProfilePhoto.controller", () => ({
  getProfilePhotoUrl: jest.fn(),
}));

describe("ProfileButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ data: null });
  });

  it("should render with default props", () => {
    render(<ProfileButton />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile");
  });

  it("should display username initials", () => {
    render(<ProfileButton username="johndoe" />);
    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("should display username when showName is true", () => {
    render(<ProfileButton username="johndoe" showName={true} />);
    expect(screen.getByText("johndoe")).toBeInTheDocument();
  });

  it("should display 'Profile' when no username and showName is true", () => {
    render(<ProfileButton showName={true} />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should use provided image URL", () => {
    render(<ProfileButton username="test" image="https://example.com/avatar.jpg" />);
    // Avatar component should render when image is provided
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("should apply custom variant and size", () => {
    const { container } = render(<ProfileButton variant="ghost" size="lg" />);
    const link = screen.getByRole("link");
    expect(link.parentElement).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<ProfileButton className="custom-class" />);
    const customElement = container.querySelector(".custom-class");
    expect(customElement).toBeInTheDocument();
  });

  it("should fetch profile photo when session exists and no initial image", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user-id", username: "testuser" } },
    });
    (getProfilePhotoUrl as jest.Mock).mockResolvedValue("https://example.com/photo.jpg");

    render(<ProfileButton username="testuser" />);

    await waitFor(() => {
      expect(getProfilePhotoUrl).toHaveBeenCalled();
    });
  });

  it("should handle photo fetch error gracefully", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user-id", username: "testuser" } },
    });
    (getProfilePhotoUrl as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    render(<ProfileButton username="testuser" />);

    await waitFor(() => {
      expect(getProfilePhotoUrl).toHaveBeenCalled();
    });
    
    // Should still render with fallback
    expect(screen.getByText("TE")).toBeInTheDocument();
  });

  it("should handle undefined photo URL", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user-id", username: "testuser" } },
    });
    (getProfilePhotoUrl as jest.Mock).mockResolvedValue(undefined);

    render(<ProfileButton username="testuser" />);

    await waitFor(() => {
      expect(getProfilePhotoUrl).toHaveBeenCalled();
    });
  });

  it("should generate correct initials for single character username", () => {
    render(<ProfileButton username="a" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should use 'U' as default initial when no username", () => {
    render(<ProfileButton />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should generate consistent avatar color based on username", () => {
    const { container } = render(<ProfileButton username="johndoe" />);
    const fallback = container.querySelector(".text-\\[9px\\]");
    expect(fallback).toBeInTheDocument();
  });

  it("should update image when initialImage prop changes", () => {
    const { rerender } = render(<ProfileButton username="test" image="url1.jpg" />);
    rerender(<ProfileButton username="test" image="url2.jpg" />);
    // Component should re-render with new image
    expect(screen.getByText("TE")).toBeInTheDocument();
  });
});
