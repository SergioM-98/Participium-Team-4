import { render } from "@testing-library/react";
import { TelegramIcon } from "@/components/TelegramIcon";

describe("TelegramIcon", () => {
  it("should render svg element", () => {
    const { container } = render(<TelegramIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const customClass = "custom-telegram-icon";
    const { container } = render(<TelegramIcon className={customClass} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass(customClass);
  });

  it("should apply custom styles", () => {
    const customStyle = { width: "50px", height: "50px" };
    const { container } = render(<TelegramIcon style={customStyle} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveStyle(customStyle);
  });

  it("should have correct viewBox", () => {
    const { container } = render(<TelegramIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("should have path element", () => {
    const { container } = render(<TelegramIcon />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("should render without className when not provided", () => {
    const { container } = render(<TelegramIcon />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toBeFalsy();
  });
});
