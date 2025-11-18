"use client";

import { useState } from "react";
import MunicipalityUserForm, { MunicipalityUserFormData } from "@/components/MunicipalityUserForm";
import { register } from "@/app/lib/controllers/user.controller";

export default function OfficerRegistrationPage() {
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload: MunicipalityUserFormData) => {
    try {
      setError("");
      setSubmitting(true);

      const formData = new FormData();
      formData.append("firstName", payload.firstName);
      formData.append("lastName", payload.lastName);
      formData.append("username", payload.username);
      formData.append("role", "OFFICER");
      formData.append("password", payload.password);
      formData.append("office", payload.office);
      formData.append("confirmPassword", payload.confirmPassword);

      const result = await register(formData);

      if (result.success) {
        setError("");
        return true;
      } else {
        setError(result.error ?? "Unknown error");
        return false;
      }
    } catch (err: any) {
      setError(err.message ?? "Internal error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <div
            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <MunicipalityUserForm
          onSubmit={handleSubmit}
          submitLabel="Create Officer"
        />
      </div>
    </div>
  );
}
