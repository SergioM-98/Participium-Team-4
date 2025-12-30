import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Navbar1 } from "@/components/navbar1";
import { useNavbarMenu } from "@/app/lib/hooks/useNavbarMenu";

// Mock dependencies
jest.mock("@/app/lib/hooks/useNavbarMenu");
jest.mock("@/components/LogoutButton", () => ({
  LogoutButton: () => <button>Logout</button>,
}));
jest.mock("@/components/ProfileButton", () => ({
  ProfileButton: () => <button>Profile</button>,
}));
jest.mock("@/components/NotificationBell", () => ({
  NotificationBell: () => <button>Notifications</button>,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Navbar1", () => {
  beforeEach(() => {
    (useNavbarMenu as jest.Mock).mockReturnValue({
      menu: [],
      logoUrl: "/",
      role: null,
      username: null,
    });
  });

  it("should render navbar with logo", () => {
    render(<Navbar1 />);

    const logos = screen.getAllByRole("img", { name: "Participium" });
    expect(logos.length).toBeGreaterThan(0);
    const titles = screen.getAllByText("Participium");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should render login and signup buttons when not logged in", () => {
    render(<Navbar1 />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("should render logout button when logged in", () => {
    (useNavbarMenu as jest.Mock).mockReturnValue({
      menu: [],
      logoUrl: "/",
      role: ["CITIZEN"],
      username: "testuser",
    });

    render(<Navbar1 />);

    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should render profile button when logged in", () => {
    (useNavbarMenu as jest.Mock).mockReturnValue({
      menu: [],
      logoUrl: "/",
      role: ["CITIZEN"],
      username: "testuser",
    });

    render(<Navbar1 />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should render public map link when not logged in", () => {
    render(<Navbar1 />);

    const mapLinks = screen.getAllByText("Public Map");
    expect(mapLinks.length).toBeGreaterThan(0);
  });

  it("should render with homepage variant styling", () => {
    const { container } = render(<Navbar1 variant="homepage" />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("absolute");
    expect(section).toHaveClass("backdrop-blur-md");
  });

  it("should render with default variant styling", () => {
    const { container } = render(<Navbar1 variant="default" />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-white");
    expect(section).toHaveClass("sticky");
  });

  it("should render custom logo", () => {
    render(
      <Navbar1
        logo={{
          url: "/custom",
          src: "/custom-logo.svg",
          alt: "Custom Logo",
          title: "Custom Title",
        }}
      />
    );

    const logos = screen.getAllByRole("img", { name: "Custom Logo" });
    expect(logos.length).toBeGreaterThan(0);
    const titles = screen.getAllByText("Custom Title");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should render custom auth buttons", () => {
    render(
      <Navbar1
        auth={{
          login: { title: "Sign In", url: "/signin" },
          signup: { title: "Register", url: "/register" },
          logout: { title: "Sign Out", url: "/signout" },
        }}
      />
    );

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("should render menu items", () => {
    (useNavbarMenu as jest.Mock).mockReturnValue({
      menu: [
        { title: "Reports", url: "/reports", children: [] },
        { title: "Profile", url: "/profile", children: [] },
      ],
      logoUrl: "/",
      role: ["CITIZEN"],
      username: "testuser",
    });

    render(<Navbar1 />);

    expect(screen.getByText("Reports")).toBeInTheDocument();
    const profileElements = screen.getAllByText("Profile");
    expect(profileElements.length).toBeGreaterThan(0);
  });

  it("should render notification bell for citizens", () => {
    (useNavbarMenu as jest.Mock).mockReturnValue({
      menu: [],
      logoUrl: "/",
      role: ["CITIZEN"],
      username: "testuser",
    });

    render(<Navbar1 />);

    const notificationButtons = screen.getAllByText("Notifications");
    expect(notificationButtons.length).toBeGreaterThan(0);
  });

  it("should not render notification bell for officers", () => {
    (useNavbarMenu as jest.Mock).mockReturnValue({
      menu: [],
      logoUrl: "/",
      role: ["TECHNICAL_OFFICER"],
      username: "officer",
    });

    render(<Navbar1 />);

    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });
});
