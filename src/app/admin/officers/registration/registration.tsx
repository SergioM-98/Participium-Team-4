"use client";

import { useMemo, useState } from "react";
import UserFormSection from "@/components/pt02/UserFormSection";
import UsersTable, { UserRow } from "@/components/pt02/UsersTable";
import {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";

export default function OfficerRegistration({ submitNewOfficer }: { submitNewOfficer: (formData: FormData) => Promise<any> }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  

  const editingUser = useMemo(
    () => users.find((u) => u.id === editingId),
    [users, editingId]
  );

 const saveUser = async (payload: MunicipalityUserFormData) => {
  try {
    const formData = new FormData();
    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("username", payload.username);
    formData.append("role", "OFFICER");
    formData.append("password", payload.password);
    formData.append("office", payload.office ?? "OTHER");

    const result = await submitNewOfficer(formData);

    if (result.success) {
      setUsers((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev]);
    } else {
      setError(result.error ?? "Unknown error");
    }
  } catch (err: any) {
    setError(err.message ?? "Internal error");
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
