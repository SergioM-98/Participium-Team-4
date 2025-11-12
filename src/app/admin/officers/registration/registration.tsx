"use client";

import { useState } from "react";
import UserFormSection from "@/components/pt02/UserFormSection";
import UsersTable, { UserRow } from "@/components/pt02/UsersTable";
import {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";

export default function OfficerRegistration({ submitNewOfficer }: { submitNewOfficer: (formData: FormData) => Promise<any> }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string>("");

  const saveUser = async (payload: MunicipalityUserFormData) => {
    try {
      const formData = new FormData();
      formData.append("firstName", payload.firstName);
      formData.append("lastName", payload.lastName);
      formData.append("username", payload.username);
      formData.append("role", "OFFICER");
      formData.append("password", payload.password);
      formData.append("office", (payload.office === "" ? "OTHER" : payload.office));

      console.log("Sending data:", {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        role: "OFFICER",
        password: "****",
        office: payload.office === "" ? "OTHER" : payload.office
      });

      const result = await submitNewOfficer(formData);

      console.log("Backend response:", result);

      if (result.success) {
        // Backend returns username, but table needs full user data
        // For now, we'll create a temporary representation
        const newUser: UserRow = {
          id: BigInt(Date.now()), // Temporary ID until page refresh
          firstName: payload.firstName,
          lastName: payload.lastName,
          username: payload.username,
          role: "OFFICER",
          office: payload.office as any,
        };
        setUsers((prev) => [newUser, ...prev]);
        setError("");
      } else {
        setError(result.error ?? "Unknown error");
      }
    } catch (err: any) {
      setError(err.message ?? "Internal error");
    }
  };

  const handleDelete = (id: bigint) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleEdit = (id: bigint) => {
    // Edit functionality disabled - requires type conversion between form and table schemas
    console.log("Edit user:", id);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <UserFormSection
          error={error}
          initialData={undefined}
          submitLabel="Save user"
          onSubmit={saveUser}
          onCancel={undefined}
        />

        <UsersTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
