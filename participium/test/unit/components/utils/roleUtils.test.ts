import {
  ROLE_TYPES,
  isOfficerRole,
  isAdminRole,
  isExternalMaintainer,
  isCitizen,
  isOfficerOrAdmin,
  getRoleLabel,
  getRoleClasses,
  getCardDescription,
} from "@/components/profile/utils/roleUtils";

describe("roleUtils", () => {
  describe("ROLE_TYPES", () => {
    it("should have all role type constants defined", () => {
      expect(ROLE_TYPES.ADMIN).toBe("ADMIN");
      expect(ROLE_TYPES.TECHNICAL_OFFICER).toBe("TECHNICAL_OFFICER");
      expect(ROLE_TYPES.PUBLIC_RELATIONS_OFFICER).toBe("PUBLIC_RELATIONS_OFFICER");
      expect(ROLE_TYPES.EXTERNAL_MAINTAINER_WITH_ACCESS).toBe("EXTERNAL_MAINTAINER_WITH_ACCESS");
      expect(ROLE_TYPES.CITIZEN).toBe("CITIZEN");
    });
  });

  describe("isOfficerRole", () => {
    it("should return true for TECHNICAL_OFFICER", () => {
      expect(isOfficerRole(["TECHNICAL_OFFICER"])).toBe(true);
    });

    it("should return true for PUBLIC_RELATIONS_OFFICER", () => {
      expect(isOfficerRole(["PUBLIC_RELATIONS_OFFICER"])).toBe(true);
    });

    it("should return true for EXTERNAL_MAINTAINER_WITH_ACCESS", () => {
      expect(isOfficerRole(["EXTERNAL_MAINTAINER_WITH_ACCESS"])).toBe(true);
    });

    it("should return false for CITIZEN", () => {
      expect(isOfficerRole(["CITIZEN"])).toBe(false);
    });

    it("should return false for ADMIN", () => {
      expect(isOfficerRole(["ADMIN"])).toBe(false);
    });

    it("should return true for multiple roles including officer", () => {
      expect(isOfficerRole(["CITIZEN", "TECHNICAL_OFFICER"])).toBe(true);
    });

    it("should return false for empty array", () => {
      expect(isOfficerRole([])).toBe(false);
    });
  });

  describe("isAdminRole", () => {
    it("should return true for ADMIN role", () => {
      expect(isAdminRole(["ADMIN"])).toBe(true);
    });

    it("should return false for non-admin roles", () => {
      expect(isAdminRole(["CITIZEN"])).toBe(false);
      expect(isAdminRole(["TECHNICAL_OFFICER"])).toBe(false);
    });

    it("should return true for multiple roles including admin", () => {
      expect(isAdminRole(["ADMIN", "CITIZEN"])).toBe(true);
    });

    it("should return false for empty array", () => {
      expect(isAdminRole([])).toBe(false);
    });
  });

  describe("isExternalMaintainer", () => {
    it("should return true for EXTERNAL_MAINTAINER_WITH_ACCESS", () => {
      expect(isExternalMaintainer(["EXTERNAL_MAINTAINER_WITH_ACCESS"])).toBe(true);
    });

    it("should return false for other roles", () => {
      expect(isExternalMaintainer(["CITIZEN"])).toBe(false);
      expect(isExternalMaintainer(["ADMIN"])).toBe(false);
      expect(isExternalMaintainer(["TECHNICAL_OFFICER"])).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(isExternalMaintainer([])).toBe(false);
    });
  });

  describe("isCitizen", () => {
    it("should return true for CITIZEN role", () => {
      expect(isCitizen(["CITIZEN"])).toBe(true);
    });

    it("should return false for other roles", () => {
      expect(isCitizen(["ADMIN"])).toBe(false);
      expect(isCitizen(["TECHNICAL_OFFICER"])).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(isCitizen([])).toBe(false);
    });
  });

  describe("isOfficerOrAdmin", () => {
    it("should return true for officer roles", () => {
      expect(isOfficerOrAdmin(["TECHNICAL_OFFICER"])).toBe(true);
      expect(isOfficerOrAdmin(["PUBLIC_RELATIONS_OFFICER"])).toBe(true);
    });

    it("should return true for admin role", () => {
      expect(isOfficerOrAdmin(["ADMIN"])).toBe(true);
    });

    it("should return false for citizen", () => {
      expect(isOfficerOrAdmin(["CITIZEN"])).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(isOfficerOrAdmin([])).toBe(false);
    });
  });

  describe("getRoleLabel", () => {
    it("should return 'Administrator' for admin role", () => {
      expect(getRoleLabel(["ADMIN"])).toBe("Administrator");
    });

    it("should return 'External Maintainer' for external maintainer", () => {
      expect(getRoleLabel(["EXTERNAL_MAINTAINER_WITH_ACCESS"])).toBe(
        "External Maintainer"
      );
    });

    it("should return 'Officer' for officer roles", () => {
      expect(getRoleLabel(["TECHNICAL_OFFICER"])).toBe("Officer");
      expect(getRoleLabel(["PUBLIC_RELATIONS_OFFICER"])).toBe("Officer");
    });

    it("should return 'Citizen' for citizen role", () => {
      expect(getRoleLabel(["CITIZEN"])).toBe("Citizen");
    });

    it("should return 'Citizen' for empty array", () => {
      expect(getRoleLabel([])).toBe("Citizen");
    });

    it("should prioritize admin over other roles", () => {
      expect(getRoleLabel(["ADMIN", "CITIZEN"])).toBe("Administrator");
    });

    it("should prioritize external maintainer over officer", () => {
      expect(getRoleLabel(["EXTERNAL_MAINTAINER_WITH_ACCESS", "TECHNICAL_OFFICER"])).toBe(
        "External Maintainer"
      );
    });
  });

  describe("getRoleClasses", () => {
    it("should return blue classes for officer roles", () => {
      const expected = "bg-blue-50 text-blue-700 border-blue-200";
      expect(getRoleClasses(["TECHNICAL_OFFICER"])).toBe(expected);
      expect(getRoleClasses(["PUBLIC_RELATIONS_OFFICER"])).toBe(expected);
      expect(getRoleClasses(["EXTERNAL_MAINTAINER_WITH_ACCESS"])).toBe(expected);
    });

    it("should return purple classes for admin role", () => {
      expect(getRoleClasses(["ADMIN"])).toBe(
        "bg-purple-50 text-purple-700 border-purple-200"
      );
    });

    it("should return secondary classes for citizen", () => {
      expect(getRoleClasses(["CITIZEN"])).toBe(
        "bg-secondary text-secondary-foreground"
      );
    });

    it("should return secondary classes for empty array", () => {
      expect(getRoleClasses([])).toBe("bg-secondary text-secondary-foreground");
    });
  });

  describe("getCardDescription", () => {
    it("should return officer description for TECHNICAL_OFFICER", () => {
      expect(getCardDescription(["TECHNICAL_OFFICER"])).toBe(
        "View your officer details and office assignment."
      );
    });

    it("should return officer description for PUBLIC_RELATIONS_OFFICER", () => {
      expect(getCardDescription(["PUBLIC_RELATIONS_OFFICER"])).toBe(
        "View your officer details and office assignment."
      );
    });

    it("should return maintainer description for EXTERNAL_MAINTAINER_WITH_ACCESS", () => {
      expect(getCardDescription(["EXTERNAL_MAINTAINER_WITH_ACCESS"])).toBe(
        "View your external maintainer details and company assignment."
      );
    });

    it("should return admin description for ADMIN", () => {
      expect(getCardDescription(["ADMIN"])).toBe("System administrator profile.");
    });

    it("should return citizen description for CITIZEN", () => {
      expect(getCardDescription(["CITIZEN"])).toBe(
        "Manage your contact information and notification preferences."
      );
    });

    it("should return citizen description for empty array", () => {
      expect(getCardDescription([])).toBe(
        "Manage your contact information and notification preferences."
      );
    });
  });
});
