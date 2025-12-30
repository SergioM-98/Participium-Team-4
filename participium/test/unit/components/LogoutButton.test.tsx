import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LogoutButton } from "@/components/LogoutButton";
import { signOut } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render logout button", () => {
    render(<LogoutButton />);
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should apply custom variant and size", () => {
    const { container } = render(<LogoutButton variant="destructive" size="lg" />);
    const button = screen.getByText("Logout");
    expect(button).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<LogoutButton className="custom-class" />);
    const button = container.querySelector(".custom-class");
    expect(button).toBeInTheDocument();
  });

  it("should open dialog when button is clicked", () => {
    render(<LogoutButton />);
    const logoutButton = screen.getByText("Logout");
    
    fireEvent.click(logoutButton);
    
    expect(screen.getByText("Are you sure you want to log out?")).toBeInTheDocument();
    expect(screen.getByText("You will be logged out and redirected to the home page.")).toBeInTheDocument();
  });

  it("should show Cancel and Log out buttons in dialog", () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText("Logout"));
    
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("should call signOut when Log out is confirmed", async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText("Logout"));
    
    const logoutConfirmButton = screen.getByText("Log out");
    fireEvent.click(logoutConfirmButton);
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    });
  });

  it("should call signOut when logout is confirmed", async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText("Logout"));
    
    const logoutConfirmButton = screen.getByText("Log out");
    fireEvent.click(logoutConfirmButton);
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });
});
