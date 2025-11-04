"use client";
import { useEffect, useState } from "react";

export type MunicipalityUserFormData = {
  fullName: string;
  email: string;
  role: "Municipal Administrator" | "Public Relations Officer" | "Technical Office Staff";
  office?: string;
  isActive: boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function MunicipalityUserForm({
  onSubmit,
  initialData,
  submitLabel = "Save user",
  onCancel,
}: {
  onSubmit: (data: MunicipalityUserFormData) => void;
  initialData?: Partial<MunicipalityUserFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [data, setData] = useState<MunicipalityUserFormData>({
    fullName: "",
    email: "",
    role: "Municipal Administrator",
    office: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // هنگام ورود به حالت ویرایش فرم را با داده‌ها پر کن
  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        role: (initialData.role as any) ?? "Municipal Administrator",
        isActive: initialData.isActive ?? true,
        office: initialData.office ?? "",
      }));
      setErrors({});
    }
  }, [initialData]);

  const handleChange =
    (key: keyof MunicipalityUserFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value;
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = () => {
    const next: typeof errors = {};
    if (!data.fullName.trim()) next.fullName = "Full name is required.";
    if (!emailRegex.test(data.email)) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setData({
      fullName: "",
      email: "",
      role: "Municipal Administrator",
      office: "",
      isActive: true,
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      onSubmit({
        ...data,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        office: data.office?.trim() ?? "",
      });
      if (!initialData) resetForm(); // در حالت create پاک می‌کنیم
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          className="w-full border p-2 rounded"
          value={data.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. Maria Rossi"
          aria-invalid={!!errors.fullName}
          aria-describedby="fullName-error"
        />
        {errors.fullName && (
          <p id="fullName-error" className="mt-1 text-xs text-red-600">
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border p-2 rounded"
          value={data.email}
          onChange={handleChange("email")}
          placeholder="m.rossi@comune.torino.it"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="w-full border p-2 rounded bg-white"
          value={data.role}
          onChange={handleChange("role")}
        >
          <option>Municipal Administrator</option>
          <option>Public Relations Officer</option>
          <option>Technical Office Staff</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="office">
          Office (optional)
        </label>
        <input
          id="office"
          className="w-full border p-2 rounded"
          value={data.office}
          onChange={handleChange("office")}
          placeholder="e.g. Roads & Maintenance"
        />
      </div>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.isActive}
          onChange={handleChange("isActive")}
        />
        <span className="text-sm text-gray-900">Active</span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 h-10 rounded-md bg-black text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md px-4 border bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
