"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RoleAssignmentSection from "@/components/pt03/RoleAssignmentSection";

export type UserRole = 
  | "Municipal Administrator" 
  | "Public Relations Officer" 
  | "Technical Office Staff";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  office?: string;
};

export default function RolesManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      fullName: "Maria Rossi",
      email: "m.rossi@comune.torino.it",
      role: "Municipal Administrator",
      office: "Main Office",
    },
    {
      id: "2",
      fullName: "Giovanni Bianchi",
      email: "g.bianchi@comune.torino.it",
      role: "Technical Office Staff",
      office: "Roads & Maintenance",
    },
    {
      id: "3",
      fullName: "Laura Verdi",
      email: "l.verdi@comune.torino.it",
      role: "Public Relations Officer",
      office: "Communications",
    },
  ]);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    
    const user = users.find((u) => u.id === userId);
    setSuccessMessage(`Role updated for ${user?.fullName}`);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Assign roles to municipality users
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
              <span className="block sm:inline">✓ {successMessage}</span>
            </div>
          )}

          <RoleAssignmentSection users={users} onRoleChange={handleRoleChange} />
        </div>
      </motion.div>
    </div>
  );
}
