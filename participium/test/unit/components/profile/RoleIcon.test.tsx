import { render } from "@testing-library/react";
import { getRoleIcon } from "@/components/profile/RoleIcon";

describe("RoleIcon", () => {
  it("should return ShieldAlert icon for technical officer", () => {
    const { container } = render(<>{getRoleIcon(["TECHNICAL_OFFICER"])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });

  it("should return ShieldAlert icon for public relations officer", () => {
    const { container } = render(<>{getRoleIcon(["PUBLIC_RELATIONS_OFFICER"])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should return ShieldAlert icon for external maintainer", () => {
    const { container } = render(<>{getRoleIcon(["EXTERNAL_MAINTAINER_WITH_ACCESS"])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should return ShieldCheck icon for admin", () => {
    const { container } = render(<>{getRoleIcon(["ADMIN"])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should return UserCheck icon for citizen", () => {
    const { container } = render(<>{getRoleIcon(["CITIZEN"])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should return UserCheck icon for empty role array", () => {
    const { container } = render(<>{getRoleIcon([])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should prioritize officer role over citizen", () => {
    const { container } = render(<>{getRoleIcon(["CITIZEN", "TECHNICAL_OFFICER"])}</>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
