"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import type { MunicipalityUserFormData } from "@/components/MunicipalityUserForm";

export type UserRow = MunicipalityUserFormData & { id: string };

type Props = {
  users: UserRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const UsersTable: FC<Props> = ({ users, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-2xl font-bold tracking-tighter mb-4">Users</h2>

      {users.length === 0 ? (
        <p className="text-muted-foreground">No users yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Office</th>
                <th className="py-2 pr-3">Active</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">{u.fullName}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3">{u.role}</td>
                  <td className="py-2 pr-3">{u.office || "-"}</td>
                  <td className="py-2 pr-3">{u.isActive ? "Yes" : "No"}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => onEdit(u.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => onDelete(u.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default UsersTable;
