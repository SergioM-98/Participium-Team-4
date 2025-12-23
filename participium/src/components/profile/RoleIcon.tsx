/**
 * Role icon component - extracts icon rendering logic
 */

import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { isOfficerRole, isAdminRole } from "./utils/roleUtils";

export const getRoleIcon = (role: string[]) => {
  if (isOfficerRole(role)) {
    return <ShieldAlert className="h-3 w-3" />;
  }
  if (isAdminRole(role)) {
    return <ShieldCheck className="h-3 w-3" />;
  }
  return <UserCheck className="h-3 w-3" />;
};
