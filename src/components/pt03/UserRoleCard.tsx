"use client";

import { FC, useState } from "react";
import { User, UserRole } from "@/app/admin/roles/page";

type Props = {
  user: User;
  onRoleChange: (userId: string, newRole: UserRole) => void;
};

const availableRoles: UserRole[] = [
  "Municipal Administrator",
  "Public Relations Officer",
  "Technical Office Staff",
];

const UserRoleCard: FC<Props> = ({ user, onRoleChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  const handleSave = () => {
    onRoleChange(user.id, selectedRole);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedRole(user.role);
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "Municipal Administrator":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Public Relations Officer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Technical Office Staff":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.fullName}</h3>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
          {user.office && (
            <p className="text-xs text-gray-500 mt-1">Office: {user.office}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
          {isEditing ? (
            <>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border whitespace-nowrap ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
              >
                Change Role
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRoleCard;
