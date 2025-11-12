"use client";

import { useState } from "react";
import UserFormSection from "@/components/pt02/UserFormSection";
import {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";

interface OfficerRegistrationProps {
  submitNewOfficer: (formData: FormData) => Promise<any>;
}

export default function OfficerRegistration({ 
  submitNewOfficer,
}: OfficerRegistrationProps) {
  const [error, setError] = useState<string>("");

  const saveUser = async (payload: MunicipalityUserFormData) => {
    try {
      const formData = new FormData();
      formData.append("firstName", payload.firstName);
      formData.append("lastName", payload.lastName);
      formData.append("username", payload.username);
      formData.append("role", "OFFICER");
      formData.append("password", payload.password);
      formData.append("office", payload.office);

      console.log("Sending data:", {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        role: "OFFICER",
        password: "****",
        office: payload.office
      });

      const result = await submitNewOfficer(formData);

      console.log("Backend response:", result);

      if (result.success) {
        setError("");
        console.log("Officer created successfully");
        return true; // Successo - il form verrà resettato
      } else {
        setError(result.error ?? "Unknown error");
        return false; // Errore - il form NON verrà resettato
      }
    } catch (err: any) {
      setError(err.message ?? "Internal error");
      return false; // Errore - il form NON verrà resettato
    }
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
      </div>
    </main>
  );
}
