import { render, screen } from "@testing-library/react";
import { ProfileInfo } from "@/components/profile/ProfileInfo";

describe("ProfileInfo", () => {
  const defaultProps = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    role: ["CITIZEN"],
    isExternalMaintainer: false,
  };

  it("should render first name and last name", () => {
    render(<ProfileInfo {...defaultProps} />);
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
  });

  it("should render username with @ symbol", () => {
    render(<ProfileInfo {...defaultProps} />);
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
  });

  it("should render role label", () => {
    render(<ProfileInfo {...defaultProps} />);
    expect(screen.getByText("Citizen")).toBeInTheDocument();
  });

  it("should render First Name and Last Name labels", () => {
    render(<ProfileInfo {...defaultProps} />);
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
  });

  it("should show dash when first name is empty", () => {
    render(<ProfileInfo {...defaultProps} firstName="" />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should show dash when last name is empty", () => {
    render(<ProfileInfo {...defaultProps} lastName="" />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("should render company section for external maintainer", () => {
    render(
      <ProfileInfo
        {...defaultProps}
        isExternalMaintainer={true}
        companyName="Test Company"
      />
    );
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  it("should not render company section for non-external maintainer", () => {
    render(
      <ProfileInfo
        {...defaultProps}
        isExternalMaintainer={false}
        companyName="Test Company"
      />
    );
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
  });

  it("should show 'Not assigned' when company name is not provided for external maintainer", () => {
    render(<ProfileInfo {...defaultProps} isExternalMaintainer={true} />);
    expect(screen.getByText("Not assigned")).toBeInTheDocument();
  });

  it("should render admin role correctly", () => {
    render(<ProfileInfo {...defaultProps} role={["ADMIN"]} />);
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("should render officer role correctly", () => {
    render(<ProfileInfo {...defaultProps} role={["TECHNICAL_OFFICER"]} />);
    expect(screen.getByText("Officer")).toBeInTheDocument();
  });

  it("should render external maintainer role correctly", () => {
    render(
      <ProfileInfo
        {...defaultProps}
        role={["EXTERNAL_MAINTAINER_WITH_ACCESS"]}
        isExternalMaintainer={true}
        companyName="ABC Corp"
      />
    );
    expect(screen.getByText("External Maintainer")).toBeInTheDocument();
    expect(screen.getByText("ABC Corp")).toBeInTheDocument();
  });
});
