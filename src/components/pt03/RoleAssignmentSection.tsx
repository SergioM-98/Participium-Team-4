"use client";

import { FC } from "react";
import { User, UserRole } from "@/app/admin/roles/page";
import UserRoleCard from "@/components/pt03/UserRoleCard";

type Props = {
  users: User[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
};

const RoleAssignmentSection: FC<Props> = ({ users, onRoleChange }) => {
  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No users available to assign roles.
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <UserRoleCard
              key={user.id}
              user={user}
              onRoleChange={onRoleChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleAssignmentSection;
