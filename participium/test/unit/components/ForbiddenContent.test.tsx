import { render, screen } from "@testing-library/react";
import ForbiddenContent from "@/components/ForbiddenContent";

describe("ForbiddenContent", () => {
  it("should render 403 error code", () => {
    render(<ForbiddenContent />);
    expect(screen.getByText("403")).toBeInTheDocument();
  });

  it("should render Forbidden heading", () => {
    render(<ForbiddenContent />);
    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });

  it("should render permission denied message", () => {
    render(<ForbiddenContent />);
    expect(
      screen.getByText("You do not have permission to access this page.")
    ).toBeInTheDocument();
  });

  it("should render Participium logo", () => {
    render(<ForbiddenContent />);
    const logo = screen.getByAltText("Participium");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo/participium.svg");
  });

  it("should render return to website button with link", () => {
    render(<ForbiddenContent />);
    const link = screen.getByRole("link", { name: /return to website/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("should have correct structure", () => {
    const { container } = render(<ForbiddenContent />);
    expect(container.querySelector(".space-y-8")).toBeInTheDocument();
  });
});
