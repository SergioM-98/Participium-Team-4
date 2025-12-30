import { render, screen } from "@testing-library/react";
import { Feature43 } from "@/components/feature43";

describe("Feature43", () => {
  const mockFeatures = [
    {
      heading: "Test Feature 1",
      description: "Test description 1",
      icon: <div data-testid="icon-1">Icon 1</div>,
    },
    {
      heading: "Test Feature 2",
      description: "Test description 2",
      icon: <div data-testid="icon-2">Icon 2</div>,
    },
  ];

  it("should render with default props", () => {
    render(<Feature43 />);
    expect(screen.getByText("Fully featured components for Shadcn UI & Tailwind")).toBeInTheDocument();
  });

  it("should render custom title", () => {
    render(<Feature43 title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render default features", () => {
    render(<Feature43 />);
    expect(screen.getByText("Quality")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Innovation")).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.getByText("Efficiency")).toBeInTheDocument();
  });

  it("should render custom features", () => {
    render(<Feature43 features={mockFeatures} />);
    expect(screen.getByText("Test Feature 1")).toBeInTheDocument();
    expect(screen.getByText("Test Feature 2")).toBeInTheDocument();
    expect(screen.getByText("Test description 1")).toBeInTheDocument();
    expect(screen.getByText("Test description 2")).toBeInTheDocument();
  });

  it("should render feature icons", () => {
    render(<Feature43 features={mockFeatures} />);
    expect(screen.getByTestId("icon-1")).toBeInTheDocument();
    expect(screen.getByTestId("icon-2")).toBeInTheDocument();
  });

  it("should render features in grid layout", () => {
    const { container } = render(<Feature43 />);
    const grid = container.querySelector(".grid.gap-10");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("md:grid-cols-2");
    expect(grid).toHaveClass("lg:grid-cols-3");
  });

  it("should render icon containers with proper styling", () => {
    const { container } = render(<Feature43 features={mockFeatures} />);
    const iconContainers = container.querySelectorAll(".bg-accent.mb-5");
    expect(iconContainers).toHaveLength(2);
  });

  it("should render section with proper padding", () => {
    const { container } = render(<Feature43 />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("py-32");
  });

  it("should render title in centered container", () => {
    const { container } = render(<Feature43 title="Test Title" />);
    const titleContainer = container.querySelector(".mx-auto.mb-16.max-w-3xl.text-center");
    expect(titleContainer).toBeInTheDocument();
  });

  it("should not render title when not provided", () => {
    const { container } = render(<Feature43 title="" />);
    const titleContainer = container.querySelector(".mx-auto.mb-16");
    expect(titleContainer).not.toBeInTheDocument();
  });

  it("should render feature headings with proper styling", () => {
    const { container } = render(<Feature43 features={mockFeatures} />);
    const headings = container.querySelectorAll("h3");
    headings.forEach(heading => {
      expect(heading).toHaveClass("mb-2");
      expect(heading).toHaveClass("text-xl");
      expect(heading).toHaveClass("font-semibold");
    });
  });

  it("should render feature descriptions with muted foreground", () => {
    const { container } = render(<Feature43 features={mockFeatures} />);
    const descriptions = container.querySelectorAll(".text-muted-foreground");
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it("should handle empty features array", () => {
    const { container } = render(<Feature43 features={[]} />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(0);
  });

  it("should render all default feature descriptions", () => {
    render(<Feature43 />);
    expect(screen.getByText(/Built with attention to detail/)).toBeInTheDocument();
    expect(screen.getByText(/Crafted with user experience/)).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive documentation/)).toBeInTheDocument();
  });

  it("should render container with proper margins", () => {
    const { container } = render(<Feature43 />);
    const mainContainer = container.querySelector(".container.mx-auto");
    expect(mainContainer).toBeInTheDocument();
  });
});
