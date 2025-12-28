/**
 * Utility functions for role-based logic
 */

export const ROLE_TYPES = {
  ADMIN: "ADMIN",
  TECHNICAL_OFFICER: "TECHNICAL_OFFICER",
  PUBLIC_RELATIONS_OFFICER: "PUBLIC_RELATIONS_OFFICER",
  EXTERNAL_MAINTAINER_WITH_ACCESS: "EXTERNAL_MAINTAINER_WITH_ACCESS",
  CITIZEN: "CITIZEN",
} as const;

export const isOfficerRole = (role: string[]): boolean =>
  role.includes(ROLE_TYPES.TECHNICAL_OFFICER) ||
  role.includes(ROLE_TYPES.PUBLIC_RELATIONS_OFFICER) ||
  role.includes(ROLE_TYPES.EXTERNAL_MAINTAINER_WITH_ACCESS);

export const isAdminRole = (role: string[]): boolean =>
  role.includes(ROLE_TYPES.ADMIN);

export const isExternalMaintainer = (role: string[]): boolean =>
  role.includes(ROLE_TYPES.EXTERNAL_MAINTAINER_WITH_ACCESS);

export const isCitizen = (role: string[]): boolean =>
  role.includes(ROLE_TYPES.CITIZEN);

export const isOfficerOrAdmin = (role: string[]): boolean =>
  isOfficerRole(role) || isAdminRole(role);

export const getRoleLabel = (role: string[]): string => {
  if (isAdminRole(role)) {
    return "Administrator";
  }
  if (isExternalMaintainer(role)) {
    return "External Maintainer";
  }
  if (isOfficerRole(role)) {
    return "Officer";
  }
  return "Citizen";
};

export const getRoleClasses = (role: string[]): string => {
  if (isOfficerRole(role)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (isAdminRole(role)) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  return "bg-secondary text-secondary-foreground";
};

export const getCardDescription = (role: string[]): string => {
  if (
    role.includes(ROLE_TYPES.TECHNICAL_OFFICER) ||
    role.includes(ROLE_TYPES.PUBLIC_RELATIONS_OFFICER)
  ) {
    return "View your officer details and office assignment.";
  }
  if (isExternalMaintainer(role)) {
    return "View your external maintainer details and company assignment.";
  }
  if (isAdminRole(role)) {
    return "System administrator profile.";
  }
  return "Manage your contact information and notification preferences.";
};
