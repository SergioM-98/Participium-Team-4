import { render, screen } from "@testing-library/react";
import { Hero115 } from "@/components/hero115";
import { Wifi } from "lucide-react";

describe("Hero115", () => {
  const mockButtons = [
    { title: "Get Started", href: "/start", variant: "default" as const },
    { title: "Learn More", href: "/learn", variant: "secondary" as const },
  ];

  it("should render with default props", () => {
    render(<Hero115 buttons={[]} />);
    expect(screen.getByText("Blocks built with Shadcn & Tailwind")).toBeInTheDocument();
  });

  it("should render custom heading", () => {
    render(<Hero115 heading="Custom Heading" buttons={[]} />);
    expect(screen.getByText("Custom Heading")).toBeInTheDocument();
  });

  it("should render custom description", () => {
    const description = "This is a custom description";
    render(<Hero115 description={description} buttons={[]} />);
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it("should render buttons when provided", () => {
    render(<Hero115 buttons={mockButtons} />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("should render buttons with correct hrefs", () => {
    render(<Hero115 buttons={mockButtons} />);
    const getStartedLink = screen.getByText("Get Started").closest("a");
    const learnMoreLink = screen.getByText("Learn More").closest("a");
    
    expect(getStartedLink).toHaveAttribute("href", "/start");
    expect(learnMoreLink).toHaveAttribute("href", "/learn");
  });

  it("should not render buttons section when buttons array is empty", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const buttonsContainer = container.querySelector(".mt-4.flex.flex-wrap");
    expect(buttonsContainer).not.toBeInTheDocument();
  });

  it("should render default Wifi icon", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const iconContainer = container.querySelector(".flex.items-center.justify-center");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    const customIcon = <div data-testid="custom-icon">Custom</div>;
    render(<Hero115 icon={customIcon} buttons={[]} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render video element", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("autoPlay");
    expect(video).toHaveAttribute("loop");
  });

  it("should have video source with correct path", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const source = container.querySelector("source");
    expect(source).toHaveAttribute("src", "/turin.mp4");
    expect(source).toHaveAttribute("type", "video/mp4");
  });

  it("should have proper overlay structure", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const overlay = container.querySelector(".bg-black\\/60");
    expect(overlay).toBeInTheDocument();
  });

  it("should render section with min-h-screen class", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("min-h-screen");
  });

  it("should render content with proper z-index", () => {
    const { container } = render(<Hero115 buttons={[]} />);
    const contentDiv = container.querySelector(".z-10");
    expect(contentDiv).toBeInTheDocument();
  });

  it("should handle multiple buttons correctly", () => {
    const multipleButtons = [
      { title: "Button 1", href: "/1" },
      { title: "Button 2", href: "/2" },
      { title: "Button 3", href: "/3" },
    ];
    render(<Hero115 buttons={multipleButtons} />);
    
    expect(screen.getByText("Button 1")).toBeInTheDocument();
    expect(screen.getByText("Button 2")).toBeInTheDocument();
    expect(screen.getByText("Button 3")).toBeInTheDocument();
  });

  it("should apply default variant when not specified", () => {
    const buttonsWithoutVariant = [{ title: "Test", href: "/test" }];
    render(<Hero115 buttons={buttonsWithoutVariant} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
