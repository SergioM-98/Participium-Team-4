"use client";

import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { FormField } from "./ui/form-field";

// Constants moved outside component to avoid recreation on each render
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,}$/;

const VALIDATION_MESSAGES = {
  nameRequired: "Company name is required.",
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email address.",
  phoneInvalid: "Please enter a valid phone number.",
} as const;

const DEFAULT_FORM_DATA: CompanyFormData = {
  name: "",
  email: "",
  phone: "",
  hasAccess: false,
};

export interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  hasAccess?: boolean;
}

type FormErrors = Partial<Record<keyof CompanyFormData, string>>;

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void | Promise<void | boolean>;
  initialData?: Partial<CompanyFormData>;
  submitLabel?: string;
  title?: string;
  description?: string;
  onCancel?: () => void;
}

export default function CompanyForm({
  onSubmit,
  initialData,
  submitLabel = "Save company",
  title = "Create a new company",
  description = "Fill the form to register a new company.",
  onCancel,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (key: keyof CompanyFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = VALIDATION_MESSAGES.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.emailRequired;
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.emailInvalid;
    }

    if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = VALIDATION_MESSAGES.phoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const submitData: CompanyFormData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        hasAccess: formData.hasAccess ?? false,
      };

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-background rounded-lg p-0 shadow-md">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-6 pb-4">
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          <div className="px-6 pb-4 mt-2">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                id="company-name"
                label="Company Name"
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="e.g. Acme Corporation"
                error={errors.name}
                required
              />

              <FormField
                id="company-email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="e.g. info@acme.com"
                error={errors.email}
                required
              />

              <FormField
                id="company-phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="e.g. +39 123 456 7890"
                error={errors.phone}
              />

              <FormField
                id="company-hasAccess"
                label="Grant access to the system"
                type="checkbox"
                value={formData.hasAccess ?? false}
                onChange={handleChange("hasAccess")}
              />
            </div>
          </div>

          <div className="px-6 py-4 flex justify-end items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 text-sm font-medium"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="h-9 px-4 text-sm font-medium flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
