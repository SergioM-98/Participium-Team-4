"use client";

import { useState } from "react";
import MunicipalityUserForm, {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";
import { updateOfficer } from "@/controllers/user.controller";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Types
type UserProp = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  office?: string | null;
  companyId?: string | null;
  email?: string | null;
};

export default function EditOfficerClient({ user }: { user: UserProp }) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: MunicipalityUserFormData) => {
    try {
      setError("");
      setSuccess("");
      setSubmitting(true);

      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("username", data.username);
      formData.append("role", data.role);

      // Only append password if provided (non-empty)
      if (data.password && data.password.trim() !== "") {
        formData.append("password", data.password);
        formData.append("confirmPassword", data.confirmPassword);
      }

      if (data.office) formData.append("office", data.office);
      if (data.companyId) formData.append("companyId", data.companyId);
      if (user.email) formData.append("email", user.email);

      const result = await updateOfficer(user.id, formData);

      if (result.success) {
        setSuccess(`User ${data.username} updated successfully!`);
        router.refresh();
        setTimeout(() => router.push("/admin/users"), 1500);
        return true;
      } else {
        setError(result.error ?? "Failed to update user");
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
      <div className="w-full max-w-md space-y-4">
        {/* Error Alert */}
        {error && (
          <div
            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm whitespace-pre-wrap break-words"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div
            className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-sm animate-in fade-in duration-300"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Main Form */}
        <MunicipalityUserForm
          // [NEW] Dynamically set the title
          customTitle={`Editing ${user.firstName} ${user.lastName}`}
          // [NEW] Disable identity fields
          disableIdentity={true}
          submitLabel={submitting ? "Saving..." : "Save Changes"}
          onSubmit={handleSubmit}
          initialData={{
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role,
            office: user.office || "",
            companyId: user.companyId || undefined,
            password: "",
            confirmPassword: "",
          }}
        />
      </div>
    </div>
  );
}
