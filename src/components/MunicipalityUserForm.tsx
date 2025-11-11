"use client";
import { useEffect, useState } from "react";

export type MunicipalityUserFormData = {
  username: string;
  firstName: string;
  lastName: string;
  office: string;
  isActive: boolean;
  password: string;
};

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
    username: "",
    firstName: "",
    lastName: "",
    office: "",
    isActive: true,
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MunicipalityUserFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        isActive: initialData.isActive ?? true,
        office: initialData.office ?? "",
      }));
      setErrors({});
    }
  }, [initialData]);

  const handleChange =
    (key: keyof MunicipalityUserFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;

  const validate = () => {
    const next: typeof errors = {};
    if (!data.firstName.trim()) next.firstName = "First name is required.";
    if (!data.lastName.trim()) next.lastName = "Last name is required.";
    if (!usernameRegex.test(data.username)) next.username = "Username must be at least 3 characters and contain only letters, numbers, . _ or -";
    if (!data.password || data.password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setData({
      username: "",
      firstName: "",
      lastName: "",
      office: "",
      isActive: true,
      password: "",
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
        username: data.username.trim().toLowerCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        office: data.office?.trim() ?? "",
      });
      if (!initialData) resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="text-sm font-medium text-gray-900">
          First name
        </label>
        <input
          id="firstName"
          value={data.firstName}
          onChange={handleChange("firstName")}
          className="w-full border p-2 rounded"
          placeholder="e.g. Maria"
          aria-invalid={!!errors.firstName}
          aria-describedby="firstName-error"
        />
        {errors.firstName && <p id="firstName-error" className="text-xs text-red-600">{errors.firstName}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="text-sm font-medium text-gray-900">
          Last name
        </label>
        <input
          id="lastName"
          value={data.lastName}
          onChange={handleChange("lastName")}
          className="w-full border p-2 rounded"
          placeholder="e.g. Rossi"
          aria-invalid={!!errors.lastName}
          aria-describedby="lastName-error"
        />
        {errors.lastName && <p id="lastName-error" className="text-xs text-red-600">{errors.lastName}</p>}
      </div>

      <div>
        <label htmlFor="username" className="text-sm font-medium text-gray-900">
          Username
        </label>
        <input
          id="username"
          value={data.username}
          onChange={handleChange("username")}
          className="w-full border p-2 rounded"
          placeholder="e.g. m.rossi"
          aria-invalid={!!errors.username}
          aria-describedby="username-error"
        />
        {errors.username && <p id="username-error" className="text-xs text-red-600">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-gray-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={data.password}
          onChange={handleChange("password")}
          className="w-full border p-2 rounded"
          placeholder="********"
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
        />
        {errors.password && <p id="password-error" className="text-xs text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="office" className="text-sm font-medium text-gray-900">
          Office
        </label>
        <select
          id="office"
          value={data.office}
          onChange={(e) => setData((prev) => ({ ...prev, office: e.target.value }))}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Office (Optional)</option>
          <option value="DEPARTMENT_OF_COMMERCE">Department of Commerce</option>
          <option value="DEPARTMENT_OF_EDUCATIONAL_SERVICES">Department of Educational Services</option>
          <option value="DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES">Department of Decentralization and Civic Services</option>
          <option value="DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES">Department of Social Health and Housing Services</option>
          <option value="DEPARTMENT_OF_INTERNAL_SERVICES">Department of Internal Services</option>
          <option value="DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION">Department of Culture Sport Major Events and Tourism Promotion</option>
          <option value="DEPARTMENT_OF_FINANCIAL_RESOURCES">Department of Financial Resources</option>
          <option value="DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES">Department of General Services Procurement and Supplies</option>
          <option value="DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES">Department of Maintenance and Technical Services</option>
          <option value="DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING">Department of Urban Planning and Private Building</option>
          <option value="DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY">Department of Environment Major Projects Infras and Mobility</option>
          <option value="DEPARTMENT_OF_LOCAL_POLICE">Department of Local Police</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={data.isActive} onChange={handleChange("isActive")} />
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
          <button type="button" onClick={onCancel} className="h-10 rounded-md px-4 border bg-white hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
