"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Search, Save, X } from "lucide-react";

// Mock data structure - will be replaced with real API calls
interface Officer {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

const AVAILABLE_ROLES = [
  { value: "TECHNICAL_OFFICER", label: "Technical Officer" },
  { value: "PUBLIC_RELATIONS_OFFICER", label: "Public Relations Officer" },
  { value: "EXTERNAL_MAINTAINER_WITH_ACCESS", label: "External Maintainer (With Access)" },
  { value: "EXTERNAL_MAINTAINER_WITHOUT_ACCESS", label: "External Maintainer (Without Access)" },
];

export default function RoleManagementPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Mock data - replace with real API call
  useEffect(() => {
    const mockOfficers: Officer[] = [
      {
        id: "1",
        username: "tech_officer1",
        firstName: "Mario",
        lastName: "Rossi",
        roles: ["TECHNICAL_OFFICER"],
      },
      {
        id: "2",
        username: "pr_officer1",
        firstName: "Luigi",
        lastName: "Bianchi",
        roles: ["PUBLIC_RELATIONS_OFFICER"],
      },
      {
        id: "3",
        username: "multi_role",
        firstName: "Giuseppe",
        lastName: "Verdi",
        roles: ["TECHNICAL_OFFICER", "PUBLIC_RELATIONS_OFFICER"],
      },
    ];
    setOfficers(mockOfficers);
    setFilteredOfficers(mockOfficers);
  }, []);

  useEffect(() => {
    const filtered = officers.filter(
      (officer) =>
        officer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOfficers(filtered);
  }, [searchTerm, officers]);

  const handleEditRoles = (officer: Officer) => {
    setEditingId(officer.id);
    setTempRoles([...officer.roles]);
    setError("");
    setSuccess("");
  };

  const handleToggleRole = (roleValue: string) => {
    setTempRoles((prev) =>
      prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  const handleSaveRoles = async (officerId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Replace with actual API call
      // await updateOfficerRoles(officerId, tempRoles);
      
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setOfficers((prev) =>
        prev.map((officer) =>
          officer.id === officerId ? { ...officer, roles: [...tempRoles] } : officer
        )
      );

      setSuccess("Roles updated successfully!");
      setEditingId(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update roles");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTempRoles([]);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Officer Roles</h1>
        <p className="text-muted-foreground">
          Assign or modify roles for municipality staff members
        </p>
      </div>

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <div className="text-green-800">{success}</div>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <div className="text-red-800">{error}</div>
        </Alert>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by username, first name, or last name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOfficers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No officers found
            </CardContent>
          </Card>
        ) : (
          filteredOfficers.map((officer) => (
            <Card key={officer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {officer.firstName} {officer.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      @{officer.username}
                    </p>
                  </div>
                  {editingId !== officer.id && (
                    <Button
                      onClick={() => handleEditRoles(officer)}
                      variant="outline"
                      disabled={editingId !== null}
                    >
                      Edit Roles
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingId === officer.id ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select Roles:</p>
                      {AVAILABLE_ROLES.map((role) => (
                        <div key={role.value} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${officer.id}-${role.value}`}
                            checked={tempRoles.includes(role.value)}
                            onCheckedChange={() => handleToggleRole(role.value)}
                          />
                          <label
                            htmlFor={`${officer.id}-${role.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleSaveRoles(officer.id)}
                        disabled={loading || tempRoles.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-2">Current Roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {officer.roles.length > 0 ? (
                        officer.roles.map((role) => {
                          const roleLabel =
                            AVAILABLE_ROLES.find((r) => r.value === role)?.label ||
                            role;
                          return (
                            <span
                              key={role}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                            >
                              {roleLabel}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No roles assigned
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
