import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/footer";

describe("Footer", () => {
  it("should render Participium logo", () => {
    render(<Footer />);
    const logo = screen.getByAltText("Participium");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo/participium.svg");
  });

  it("should render Participium text", () => {
    render(<Footer />);
    expect(screen.getAllByText("Participium").length).toBeGreaterThan(0);
  });

  it("should render current year in copyright", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Participium`)).toBeInTheDocument();
  });

  it("should render 'Made with ❤️ in Turin' text", () => {
    render(<Footer />);
    expect(screen.getByText(/Made with/)).toBeInTheDocument();
    expect(screen.getByText(/in Turin/)).toBeInTheDocument();
  });

  it("should render Heart icon", () => {
    const { container } = render(<Footer />);
    const heartIcon = container.querySelector(".text-red-500");
    expect(heartIcon).toBeInTheDocument();
    expect(heartIcon).toHaveClass("fill-red-500");
  });

  it("should render Politecnico di Torino", () => {
    render(<Footer />);
    expect(screen.getByText("Politecnico di Torino")).toBeInTheDocument();
  });

  it("should render GitHub link", () => {
    render(<Footer />);
    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/SergioM-98/Participium-Team-4"
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should have proper structure with container", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeInTheDocument();
    expect(container.querySelector(".container")).toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("border-t");
    expect(footer).toHaveClass("bg-gray-50");
  });

  it("should have responsive layout classes", () => {
    const { container } = render(<Footer />);
    const flexContainer = container.querySelector(".md\\:flex-row");
    expect(flexContainer).toBeInTheDocument();
  });
});
