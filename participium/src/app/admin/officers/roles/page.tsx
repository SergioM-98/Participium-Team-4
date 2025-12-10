"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Search, Save, X } from "lucide-react";
import { deleteOfficer, getAllofficers, updateOfficerOffices } from "@/app/lib/controllers/user.controller";

// Mock data structure - will be replaced with real API calls
interface Officer {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  offices: string[];
}

const AVAILABLE_OFFICES = [
  { value: "DEPARTMENT_OF_COMMERCE", label: "Department of Commerce" },
  { value: "DEPARTMENT_OF_EDUCATIONAL_SERVICES", label: "Department of Educational Services" },
  { value: "DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES", label: "Department of Decentralization and Civic Services" },
  { value: "DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES", label: "Department of Social Health and Housing Services" },
  { value: "DEPARTMENT_OF_INTERNAL_SERVICES", label: "Department of Internal Services" },
  { value: "DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION", label: "Department of Culture, Sport, Major Events and Tourism Promotion" },
  { value: "DEPARTMENT_OF_FINANCIAL_RESOURCES", label: "Department of Financial Resources" },
  { value: "DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES", label: "Department of General Services Procurement and Supplies" },
  { value: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES", label: "Department of Maintenance and Technical Services" },
  { value: "DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING", label: "Department of Urban Planning and Private Building" },
  { value: "DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY", label: "Department of Environment Major Projects Infras and Mobility" },
  { value: "DEPARTMENT_OF_LOCAL_POLICE", label: "Department of Local Police" },
  { value: "OTHER", label: "Other" }
];

export default function OfficeManagementPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempOffices, setTempOffices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [startFetch, setStartFetch] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Mock data - replace with real API call
  useEffect(() => {
    const loadOfficers = async () => {
      const fetchedOfficers = await getAllofficers();
      if(!fetchedOfficers.success) return;

      const techOfficers = fetchedOfficers.data.map((officer) =>{
        return {
          id: officer.id,
          username: officer.username,
          firstName: officer.firstName,
          lastName: officer.lastName,
          offices: officer.office
        }
      });

      setOfficers(techOfficers);
      setFilteredOfficers(techOfficers);
    }
    loadOfficers();
  }, [startFetch]);

  useEffect(() => {
    const filtered = officers.filter(
      (officer) =>
        officer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOfficers(filtered);
  }, [searchTerm, officers]);

  const handleEditOffices = (officer: Officer) => {
    setEditingId(officer.id);
    setTempOffices([...officer.offices]);
    setError("");
    setSuccess("");
  };

  const handleToggleOffice = (officeValue: string) => {
    setTempOffices((prev) =>
      prev.includes(officeValue)
        ? prev.filter((r) => r !== officeValue)
        : [...prev, officeValue]
    );
  };

  const handleSaveOffices = async (officerId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      
      const response = await updateOfficerOffices(officerId, tempOffices);
      if (!response) {
        setError("Failed to update offices");
      }

      setSuccess("Offices updated successfully!");
      setEditingId(null);
      setStartFetch(prev => !prev);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update offices");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTempOffices([]);
    setError("");
  };

  const handleCancelOfficer = async (officerId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await deleteOfficer(officerId);
      if (!response) {
        setError("Failed to delete officer");
        return;
      }

      setSuccess("Officer deleted successfully!");
      setEditingId(null);
      setConfirmDeleteId(null);
      setStartFetch(prev => !prev);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete officer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Officer Offices</h1>
        <p className="text-muted-foreground">
          Assign or modify offices for municipality staff members
        </p>
      </div>

      {success && (
        <Alert message={success} className="mb-6 bg-green-50 border-green-200">
          <div className="text-green-800">{success}</div>
        </Alert>
      )}

      {error && (
        <Alert message={error} className="mb-6 bg-red-50 border-red-200">
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
                      onClick={() => handleEditOffices(officer)}
                      variant="outline"
                      disabled={editingId !== null}
                    >
                      Edit Offices
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingId === officer.id ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select Offices:</p>
                      {AVAILABLE_OFFICES.map((office) => (
                        <div key={office.value} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${officer.id}-${office.value}`}
                            checked={tempOffices.includes(office.value)}
                            onCheckedChange={() => handleToggleOffice(office.value)}
                          />
                          <label
                            htmlFor={`${officer.id}-${office.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {office.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => handleSaveOffices(officer.id)}
                        disabled={loading || tempOffices.length === 0}
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
                      <Button
                        onClick={() => setConfirmDeleteId(officer.id)}
                        variant="outline"
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Delete officer
                      </Button>
                      
                      {confirmDeleteId === officer.id && (
                        <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-3">
                            Are you sure you want to delete this officer? This action cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCancelOfficer(officer.id)}
                              variant="destructive"
                              disabled={loading}
                              className="flex items-center gap-2"
                            >
                              Confirm Delete
                            </Button>
                            <Button
                              onClick={() => setConfirmDeleteId(null)}
                              variant="outline"
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-2">Current Offices:</p>
                    <div className="flex flex-wrap gap-2">
                      {officer.offices.length > 0 ? (
                        officer.offices.map((office) => {
                          const officeLabel =
                            AVAILABLE_OFFICES.find((o) => o.value === office)?.label ||
                            office;
                          return (
                            <span
                              key={office}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                            >
                              {officeLabel}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No offices assigned
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