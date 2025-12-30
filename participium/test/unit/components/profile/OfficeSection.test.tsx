import { render, screen } from "@testing-library/react";
import { OfficeSection } from "@/components/profile/OfficeSection";

describe("OfficeSection", () => {
  it("should render office items", () => {
    const offices = ["DEPARTMENT_OF_MAINTENANCE"];
    render(<OfficeSection office={offices} />);
    expect(screen.getByText("DEPARTMENT OF MAINTENANCE")).toBeInTheDocument();
  });

  it("should render multiple office items", () => {
    const offices = [
      "DEPARTMENT_OF_MAINTENANCE",
      "TECHNICAL_SERVICES",
    ];
    render(<OfficeSection office={offices} />);
    expect(screen.getByText("DEPARTMENT OF MAINTENANCE")).toBeInTheDocument();
    expect(screen.getByText("TECHNICAL SERVICES")).toBeInTheDocument();
  });

  it("should render 'Department / Office' label", () => {
    const offices = ["DEPARTMENT_OF_MAINTENANCE"];
    render(<OfficeSection office={offices} />);
    expect(screen.getByText("Department / Office")).toBeInTheDocument();
  });

  it("should replace underscores with spaces in office names", () => {
    const offices = ["DEPARTMENT_OF_PUBLIC_WORKS"];
    render(<OfficeSection office={offices} />);
    expect(screen.getByText("DEPARTMENT OF PUBLIC WORKS")).toBeInTheDocument();
  });

  it("should not render when office array is empty", () => {
    const { container } = render(<OfficeSection office={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when office is undefined", () => {
    const { container } = render(<OfficeSection office={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render Building2 icon", () => {
    const offices = ["TEST_OFFICE"];
    const { container } = render(<OfficeSection office={offices} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should apply correct styling to office items", () => {
    const offices = ["TEST_OFFICE"];
    const { container } = render(<OfficeSection office={offices} />);
    const officeItem = screen.getByText("TEST OFFICE");
    expect(officeItem).toHaveClass("bg-primary/10");
    expect(officeItem).toHaveClass("rounded");
  });
});
