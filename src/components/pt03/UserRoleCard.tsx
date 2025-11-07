"use client";

import { assignRole } from "@/actions/municipalityUser";
import { retrieveRoles } from "@/actions/role";
import { Role } from "@/app/lib/dtos/role.dto";
import { MunicipalityUser } from "@/dtos/municipalityUser.dto";
import { FC, useEffect, useState } from "react";

type Props = {
  user: MunicipalityUser;
  onRoleChange: (userId: string, newRole: string) => void;
};

const UserRoleCard: FC<Props> = ({ user, onRoleChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const handleSave = async () => {
    try {
      await assignRole(user.id, selectedRole);
      onRoleChange(user.id, selectedRole);
      setIsEditing(false);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  const handleCancel = () => {
    setSelectedRole(user.role);
    setIsEditing(false);
  };

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await retrieveRoles();
        if (response.success && response.data) {
          setAvailableRoles(response.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    }

    fetchRoles();
  }, []);

  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
          {user.department && (
            <p className="text-xs text-gray-500 mt-1">
              Department: {user.department}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
          {isEditing ? (
            <>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as string)}
                className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
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
                className={`px-3 py-1 text-sm font-medium rounded-full border whitespace-nowrap`}
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
