"use client";

import { FC } from "react";
import type { MunicipalityUserFormData } from "@/components/MunicipalityUserForm";

export type UserRow = MunicipalityUserFormData & { id: string };

type Props = {
  users: UserRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const UsersTable: FC<Props> = ({ users, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-900">Users</h2>

      {users.length === 0 ? (
        <p className="text-sm text-gray-700">No users yet.</p>
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
    </div>
  );
};

export default UsersTable;
