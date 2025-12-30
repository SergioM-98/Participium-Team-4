import { render } from "@testing-library/react";
import StartingPage from "@/components/homepage";

describe("HomePage", () => {
  it("should render without crashing", () => {
    const { container } = render(<StartingPage />);
    expect(container).toBeInTheDocument();
  });

  it("should render null", () => {
    const { container } = render(<StartingPage />);
    expect(container.firstChild).toBeNull();
  });
});
