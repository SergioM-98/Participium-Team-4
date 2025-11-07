"use client";

import { useMemo, useState } from "react";
import UserFormSection from "@/components/pt02/UserFormSection";
import UsersTable, { UserRow } from "@/components/pt02/UsersTable";
import {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";

export default function OfficerRegistration(submitNewOfficer: any) {
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
    <main className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <UserFormSection
          error={error}
          initialData={editingUser ?? undefined}
          submitLabel={editingUser ? "Update user" : "Save user"}
          onSubmit={saveUser}
          onCancel={editingUser ? cancelEdit : undefined}
        />

        <UsersTable
          users={users}
          onEdit={setEditingId}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
