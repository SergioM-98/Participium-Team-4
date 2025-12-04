"use client";

import { useCallback, useState } from "react";
import CompanyForm, {
  CompanyFormData,
} from "@/components/CompanyForm";
import { Alert } from "@/components/ui/alert";
import { createCompany } from "@/controllers/company.controller";

// Constants for alert auto-dismiss timing
const SUCCESS_ALERT_DURATION_MS = 4000;

export default function CompanyRegistrationPage() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleSubmit = useCallback(
    async (payload: CompanyFormData): Promise<boolean> => {
      // Clear previous messages
      setError("");
      setSuccess("");

      try {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("email", payload.email);
        formData.append("phone", payload.phone);
        formData.append("hasAccess", String(payload.hasAccess ?? false));

        const result = await createCompany(formData);

        if (result.success) {
          setSuccess(`Company ${payload.name} created successfully!`);
          setResetTrigger((prev) => prev + 1);
          setTimeout(() => setSuccess(""), SUCCESS_ALERT_DURATION_MS);
          return true;
        }

        setError(result.error ?? "Unknown error");
        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Internal error";
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && <Alert variant="error" message={error} />}
        {success && <Alert variant="success" message={success} />}
        <CompanyForm
          onSubmit={handleSubmit}
          submitLabel="Create Company"
          key={resetTrigger}
        />
      </div>
    </div>
  );
}
