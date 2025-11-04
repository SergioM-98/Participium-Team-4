"use client";
import { useState } from "react";

type Role = "MunicipalAdmin" | "PublicRelations" | "TechnicalOffice";
type FormData = {
  fullName: string;
  email: string;
  role: Role;
  office: string;      // نام اداره/بخش (اختیاری ولی مفید)
  isActive: boolean;   // کاربر فعال؟
};

export default function AdminUserForm({
  onSubmit,
}: { onSubmit: (data: FormData) => void }) {
  const [data, setData] = useState<FormData>({
    fullName: "",
    email: "",
    role: "MunicipalAdmin",
    office: "",
    isActive: true,
  });

  const handleChange =
    (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData({ ...data, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.fullName.trim() || !data.email.trim()) return; // ولیدیشن خیلی ساده
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          className="w-full rounded-md border p-2"
          value={data.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. Maria Rossi"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="w-full rounded-md border p-2"
          value={data.email}
          onChange={handleChange("email")}
          placeholder="m.rossi@comune.torino.it"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="role">Role</label>
        <select
          id="role"
          className="w-full rounded-md border p-2 bg-white"
          value={data.role}
          onChange={handleChange("role")}
        >
          <option value="MunicipalAdmin">Municipal Administrator</option>
          <option value="PublicRelations">Public Relations Officer</option>
          <option value="TechnicalOffice">Technical Office Staff</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="office">Office (optional)</label>
        <input
          id="office"
          className="w-full rounded-md border p-2"
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
        <span className="text-sm">Active</span>
      </label>

      <button type="submit" className="w-full h-10 rounded-md bg-black text-white hover:opacity-90">
        Save user
      </button>
    </form>
  );
}
