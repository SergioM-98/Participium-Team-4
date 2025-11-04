"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";


export type AdminUserPayload = {
  fullName: string;
  email: string;
  role: "MunicipalAdmin" | "PublicRelations" | "TechnicalOffice";
  office?: string;
  isActive: boolean;
};

type Props = {
  onSubmit: (data: AdminUserPayload) => void;
  emailExists?: (email: string) => boolean;
};

export default function AdminUserForm({ onSubmit, emailExists }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUserPayload["role"]>("MunicipalAdmin");
  const [office, setOffice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Full name is required.");
    if (!email.trim()) return setError("Email is required.");

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) return setError("Please enter a valid email.");
    if (emailExists?.(email)) return setError("This email is already registered.");

    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      office: office.trim() || undefined,
      isActive,
    });

    // Reset form
    setFullName("");
    setEmail("");
    setRole("MunicipalAdmin");
    setOffice("");
    setIsActive(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          placeholder="e.g. Maria Rossi"
          value={fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m.rossi@comune.torino.it"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          className="w-full rounded-md border p-2 text-sm"
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setRole(e.target.value as AdminUserPayload["role"])
          }
        >
          <option value="MunicipalAdmin">Municipal Administrator</option>
          <option value="TechnicalOffice">Technical Office Staff</option>
          <option value="PublicRelations">Public Relations Officer</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="office">Office (optional)</Label>
        <Input
          id="office"
          placeholder="e.g. Roads & Maintenance"
          value={office}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOffice(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(v: boolean) => setIsActive(v)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" className="w-full">
        Save user
      </Button>
    </form>
  );
}
