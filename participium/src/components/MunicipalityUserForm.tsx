"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getCompaniesByAccess } from "@/controllers/company.controller";

export type MunicipalityUserFormData = {
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  office: string;
  password: string;
  confirmPassword: string;
  companyId?: string;
};

export type Company = {
  id: string;
  name: string;
  email?: string;
};

export default function MunicipalityUserForm({
  onSubmit,
  initialData,
  submitLabel = "Save user",
  onCancel,
}: Readonly<{
  onSubmit: (data: MunicipalityUserFormData) => void | Promise<void | boolean>;
  initialData?: Partial<MunicipalityUserFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}>) {
  const [data, setData] = useState<MunicipalityUserFormData>({
    username: "",
    firstName: "",
    lastName: "",
    role: "",
    office: "",
    password: "",
    confirmPassword: "",
    companyId: undefined,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof MunicipalityUserFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        role: initialData.role ?? "",
        office: initialData.office ?? "",
        companyId: initialData.companyId,
      }));
      setErrors({});
    }
  }, [initialData]);

  useEffect(() => {
    const retrieveCompanies = async () => {
      setLoadingCompanies(true);
      try {
        // Determina se recuperare aziende con o senza accesso in base al ruolo
        let hasAccess = false;
        if (data.role === "EXTERNAL_MAINTAINER_WITH_ACCESS") {
          hasAccess = true;
        } else if (data.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS") {
          hasAccess = false;
        } else {
          // Se il ruolo non è un EXTERNAL_MAINTAINER, non caricare aziende
          setCompanies([]);
          setLoadingCompanies(false);
          return;
        }

        const result = await getCompaniesByAccess(hasAccess);
        console.log("getCompaniesByAccess result:", result);
        console.log("result type:", typeof result);
        console.log("result keys:", result ? Object.keys(result) : "null");
        if (result.success && result.data) {
          setCompanies(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    retrieveCompanies();
  }, [data.role]);

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
    if (!data.username.trim()) {
      next.username = "Username is required.";
    } else if (!usernameRegex.test(data.username)) {
      next.username =
        "Username must be at least 3 characters and contain only letters, numbers, dots, underscores, or hyphens.";
    }
    if (!data.password) {
      next.password = "Password is required.";
    } else if (data.password.length < 8) {
      next.password = "Password must be at least 8 characters long.";
    }
    if (!data.confirmPassword) {
      next.confirmPassword = "Confirm password is required.";
    } else if (data.password !== data.confirmPassword) {
      next.confirmPassword =
        "Passwords do not match. Please verify both passwords are identical.";
    }
    if (!data.role || data.role.trim() === "")
      next.role = "Role selection is required.";

    // Office is required only for non-ADMIN roles except EXTERNAL_MAINTAINER
    if (
      data.role !== "ADMIN" &&
      data.role !== "EXTERNAL_MAINTAINER_WITH_ACCESS" &&
      data.role !== "EXTERNAL_MAINTAINER_WITHOUT_ACCESS"
    ) {
      if (!data.office || data.office.trim() === "")
        next.office = "Office selection is required.";
    }

    // Company is required only for EXTERNAL_MAINTAINER roles
    if (
      data.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ||
      data.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS"
    ) {
      if (!data.companyId || data.companyId.trim() === "")
        next.companyId = "Company selection is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setData({
      username: "",
      firstName: "",
      lastName: "",
      role: "",
      office: "",
      password: "",
      confirmPassword: "",
      companyId: undefined,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const submitData: any = {
        username: data.username.trim().toLowerCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role?.trim() ?? "",
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      // Only include office if not ADMIN and not EXTERNAL_MAINTAINER
      if (
        data.role !== "ADMIN" &&
        data.role !== "EXTERNAL_MAINTAINER_WITH_ACCESS" &&
        data.role !== "EXTERNAL_MAINTAINER_WITHOUT_ACCESS"
      ) {
        submitData.office = data.office?.trim() ?? "";
      }

      // Include companyId for EXTERNAL_MAINTAINER roles
      if (
        data.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ||
        data.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS"
      ) {
        submitData.companyId = data.companyId?.trim() ?? "";
      }

      const result = await onSubmit(submitData);
      if (!initialData && result !== false) {
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <Card className="w-full max-w-md bg-background rounded-lg p-0 shadow-md mx-4">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit}>
            <div className="p-6 pb-4">
              <h2 className="text-lg font-medium text-foreground">
                Create a new municipality user
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill the form to create a new municipality user.
              </p>
            </div>

            <div className="px-6 pb-4 mt-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={data.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="e.g. Maria"
                    aria-invalid={!!errors.firstName}
                    aria-describedby="firstName-error"
                  />
                  {errors.firstName && (
                    <p
                      id="firstName-error"
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={data.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="e.g. Rossi"
                    aria-invalid={!!errors.lastName}
                    aria-describedby="lastName-error"
                  />
                  {errors.lastName && (
                    <p
                      id="lastName-error"
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={data.username}
                    onChange={handleChange("username")}
                    placeholder="e.g. m.rossi"
                    aria-invalid={!!errors.username}
                    aria-describedby="username-error"
                  />
                  {errors.username && (
                    <p
                      id="username-error"
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    aria-describedby="password-error"
                  />
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={data.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby="confirmPassword-error"
                  />
                  {errors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    required
                    value={data.role}
                    onValueChange={(value) => {
                      setData((prev) => ({
                        ...prev,
                        role: value,
                        office:
                          value === "PUBLIC_RELATIONS_OFFICER" ||
                          value === "ADMIN"
                            ? "ORGANIZATION_OFFICE"
                            : "",
                        companyId: undefined,
                      }));
                      setErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                  >
                    <SelectTrigger
                      id="role"
                      className="ps-2 w-full"
                      aria-invalid={!!errors.role}
                      aria-describedby="role-error"
                    >
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent
                      className="w-screen sm:w-auto max-w-[90vw]"
                      style={{ maxWidth: "90vw" }}
                    >
                      <SelectGroup>
                        <SelectItem value="PUBLIC_RELATIONS_OFFICER">
                          Municipal public relations officer
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          Municipal administrator
                        </SelectItem>
                        <SelectItem value="TECHNICAL_OFFICER">
                          Technical office staff
                        </SelectItem>
                        <SelectItem value="EXTERNAL_MAINTAINER_WITH_ACCESS">
                          External Maintainer (With Access)
                        </SelectItem>
                        <SelectItem value="EXTERNAL_MAINTAINER_WITHOUT_ACCESS">
                          External Maintainer (Without Access)
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p id="role-error" className="text-xs text-red-500 mt-1">
                      {errors.role}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office">Office</Label>
                  {data.role === "ADMIN" ? (
                    <Input
                      id="office"
                      value="N/A"
                      disabled
                      className="bg-muted"
                    />
                  ) : data.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ||
                    data.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS" ? (
                    <Input
                      id="office"
                      value="N/A"
                      disabled
                      className="bg-muted"
                    />
                  ) : (
                    <Select
                      required
                      value={data.office}
                      disabled={!data.role || data.role === ""}
                      onValueChange={(value) => {
                        setData((prev) => ({ ...prev, office: value }));
                        setErrors((prev) => ({ ...prev, office: undefined }));
                      }}
                    >
                      <SelectTrigger
                        id="office"
                        className="ps-2 w-full"
                        aria-invalid={!!errors.office}
                        aria-describedby="office-error"
                      >
                        <SelectValue placeholder="Select Office" />
                      </SelectTrigger>
                      <SelectContent
                        className="w-screen sm:w-auto max-w-[90vw]"
                        style={{ maxWidth: "90vw" }}
                      >
                        <SelectGroup>
                          <SelectItem value="DEPARTMENT_OF_COMMERCE">
                            Department of Commerce
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_EDUCATIONAL_SERVICES">
                            Department of Educational Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES">
                            Department of Decentralization and Civic Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES">
                            Department of Social Health and Housing Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_INTERNAL_SERVICES">
                            Department of Internal Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION">
                            Department of Culture Sport Major Events and Tourism
                            Promotion
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_FINANCIAL_RESOURCES">
                            Department of Financial Resources
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES">
                            Department of General Services Procurement and
                            Supplies
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES">
                            Department of Maintenance and Technical Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING">
                            Department of Urban Planning and Private Building
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY">
                            Department of Environment Major Projects Infras and
                            Mobility
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_LOCAL_POLICE">
                            Department of Local Police
                          </SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                  {errors.office && (
                    <p id="office-error" className="text-xs text-red-500 mt-1">
                      {errors.office}
                    </p>
                  )}
                </div>

                {(data.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ||
                  data.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS") && (
                  <div className="space-y-2">
                    <Label htmlFor="companyId">Company</Label>
                    <Select
                      required
                      disabled={loadingCompanies}
                      value={data.companyId ?? ""}
                      onValueChange={(value) => {
                        setData((prev) => ({ ...prev, companyId: value }));
                        setErrors((prev) => ({
                          ...prev,
                          companyId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="companyId"
                        className="ps-2 w-full"
                        aria-invalid={!!errors.companyId}
                        aria-describedby="companyId-error"
                      >
                        <SelectValue
                          placeholder={
                            loadingCompanies
                              ? "Loading companies..."
                              : "Select Company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="w-screen sm:w-auto max-w-[90vw]"
                        style={{ maxWidth: "90vw" }}
                      >
                        <SelectGroup>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.companyId && (
                      <p
                        id="companyId-error"
                        className="text-xs text-red-500 mt-1"
                      >
                        {errors.companyId}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4 text-sm font-medium"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="h-9 px-4 text-sm font-medium flex-1"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Saving..." : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
