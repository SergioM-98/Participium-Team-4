import { render, screen } from "@testing-library/react";
import NotFoundContent from "@/components/NotFoundContent";

describe("NotFoundContent", () => {
  it("should render 404 error code", () => {
    render(<NotFoundContent />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("should render Page Not Found heading", () => {
    render(<NotFoundContent />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("should render not found message", () => {
    render(<NotFoundContent />);
    expect(
      screen.getByText("Oops! The page you're looking for doesn't exist.")
    ).toBeInTheDocument();
  });

  it("should render Participium logo", () => {
    render(<NotFoundContent />);
    const logo = screen.getByAltText("Participium");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo/participium.svg");
  });

  it("should render return to website button with link", () => {
    render(<NotFoundContent />);
    const link = screen.getByRole("link", { name: /return to website/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("should have proper layout structure", () => {
    const { container } = render(<NotFoundContent />);
    expect(container.querySelector(".space-y-8")).toBeInTheDocument();
  });
});
