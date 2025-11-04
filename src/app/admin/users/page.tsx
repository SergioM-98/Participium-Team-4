"use client";

import { useMemo, useState } from "react";
import MunicipalityUserForm, {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";


type UserRow = MunicipalityUserFormData & { id: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingUser = useMemo(
    () => users.find((u) => u.id === editingId),
    [users, editingId]
  );

  // Create or Update
  const saveUser = (payload: MunicipalityUserFormData) => {
    const normalized: MunicipalityUserFormData = {
      ...payload,
      email: payload.email.trim().toLowerCase(),
      fullName: payload.fullName.trim(),
      office: payload.office?.trim() || "",
    };

    // duplicate email check (except same editing user)
    const duplicated = users.some(
      (u) => u.email === normalized.email && u.id !== editingId
    );
    if (duplicated) {
      setError("This email is already registered.");
      return;
    }

    setError("");

    if (editingId) {
      // update
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...normalized } : u))
      );
      setEditingId(null);
    } else {
      // create
      setUsers((prev) => [{ id: crypto.randomUUID(), ...normalized }, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Municipality Users (PT02)
          </h1>
          <p className="text-sm text-gray-700">
            Create internal municipality accounts.
          </p>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4">
            <MunicipalityUserForm
              onSubmit={saveUser}
              initialData={editingUser ?? undefined}
              submitLabel={editingUser ? "Update user" : "Save user"}
              onCancel={editingUser ? cancelEdit : undefined}
            />
          </div>
        </div>

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
                            onClick={() => setEditingId(u.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDelete(u.id)}
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
      </div>
    </main>
  );
}
