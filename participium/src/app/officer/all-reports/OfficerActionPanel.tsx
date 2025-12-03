"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { approveReport, rejectReport } from "@/controllers/report.controller";
import { getAllCompanies } from "@/controllers/company.controller";

interface CompanyOption {
  id: string;
  name: string;
}

interface OfficerActionPanelProps {
  reportId: string | number;
  currentStatus: string;
  currentCategory: string;
  onActionComplete?: () => void;
}

export default function OfficerActionPanel({
  reportId,
  currentStatus,
  currentCategory,
  onActionComplete,
}: Readonly<OfficerActionPanelProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleDepartmentChange = (value: string) => {
    if (value === "NONE" || selectedDepartment === value) {
      setSelectedDepartment("");
    } else {
      setSelectedDepartment(value);
      setSelectedCompany("");
    }
  };

  const handleCompanyChange = (value: string) => {
    if (value === "NONE" || selectedCompany === value) {
      setSelectedCompany("");
    } else {
      setSelectedCompany(value);
      setSelectedDepartment("");
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const result = await getAllCompanies();
        
        if (result.success && result.data) {
          setCompanies(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const canModerate =
    currentStatus === "pending_approval" || currentStatus === "PENDING";

  const handleApprove = async () => {
    const deptValue = selectedDepartment === "NONE" ? "" : selectedDepartment;
    const companyValue = selectedCompany === "NONE" ? "" : selectedCompany;
    
    if (!deptValue && !companyValue) return;
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const assignmentValue = deptValue || companyValue;
      const isCompanyAssignment = !!companyValue;
      
      const response = await approveReport(
        Number(reportId),
        assignmentValue,
        isCompanyAssignment
      );
      if (response.success) {
        onActionComplete?.();
      } else {
        setFeedbackMessage({ type: 'error', text: response.error || 'Error assigning report' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({ type: 'error', text: 'An error occurred' });
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const response = await rejectReport(Number(reportId), rejectionReason);
      if (response.success) {
        onActionComplete?.();
      } else {
        setFeedbackMessage({ type: 'error', text: response.error || 'Error rejecting report' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({ type: 'error', text: 'An error occurred' });
      setIsLoading(false);
    }
  };

  if (!canModerate) {
    return (
      <div className="p-3 bg-muted/50 rounded-md text-center border border-dashed">
        <p className="text-xs text-muted-foreground">
          Action locked. Status: <span className="font-medium text-foreground">{currentStatus}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {feedbackMessage && (
        <div className={`p-3 rounded-md text-sm ${
          feedbackMessage.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {feedbackMessage.text}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">
        Officer Actions
      </h3>

      <div className="space-y-3">
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Verify Category
          </label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full h-9 text-sm bg-background">
              <SelectValue placeholder="Category..." />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[250px]">
              <SelectItem value="WATER_SUPPLY">Water Supply</SelectItem>
              <SelectItem value="ARCHITECTURAL_BARRIERS">
                Architectural Barriers
              </SelectItem>
              <SelectItem value="SEWER_SYSTEM">Sewer System</SelectItem>
              <SelectItem value="PUBLIC_LIGHTING">
                Public Lighting
              </SelectItem>
              <SelectItem value="WASTE">Waste</SelectItem>
              <SelectItem value="ROADS_SIGNS_AND_TRAFFIC_LIGHTS">
                Roads & Signs
              </SelectItem>
              <SelectItem value="ROADS_AND_URBAN_FURNISHINGS">
                Roads & Furnishings
              </SelectItem>
              <SelectItem value="PUBLIC_GREEN_AREAS_AND_BACKGROUNDS">
                Green Areas
              </SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Assign Department
          </label>
          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
            disabled={selectedCompany !== ""}
          >
            <SelectTrigger className="w-full h-9 text-sm bg-background">
              <SelectValue placeholder="Select Department..." />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[250px]">
              <SelectItem value="NONE">None</SelectItem>
              <SelectItem value="DEPARTMENT_OF_COMMERCE">
                Commerce
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_EDUCATIONAL_SERVICES">
                Educational Services
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES">
                Decentralization
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES">
                Social Health
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_INTERNAL_SERVICES">
                Internal Services
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION">
                Culture & Sport
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_FINANCIAL_RESOURCES">
                Financial Resources
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES">
                General Services
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES">
                Maintenance
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING">
                Urban Planning
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY">
                Environment
              </SelectItem>
              <SelectItem value="DEPARTMENT_OF_LOCAL_POLICE">
                Local Police
              </SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Assign Company
          </label>
          <Select
            value={selectedCompany}
            onValueChange={handleCompanyChange}
            disabled={companiesLoading || selectedDepartment !== ""}
          >
            <SelectTrigger className="w-full h-9 text-sm bg-background">
              <SelectValue placeholder={companiesLoading ? "Loading companies..." : "Select Company..."} />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[250px]">
              <SelectItem value="NONE">None</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleApprove}
          disabled={isLoading || (selectedDepartment === "" || selectedDepartment === "NONE") && (selectedCompany === "" || selectedCompany === "NONE") || showRejectInput}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-9 text-sm"
        >
          {isLoading && !showRejectInput ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : null}
          Approve & Assign
        </Button>

        {!showRejectInput && (
          <Button
            variant="destructive"
            onClick={() => setShowRejectInput(true)}
            disabled={isLoading}
            className="w-full h-9 text-sm"
          >
            Reject Report
          </Button>
        )}
      </div>

      {showRejectInput && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 p-3 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/30">
          <label className="text-sm font-semibold text-destructive">
            Reason for Rejection
          </label>
          <Textarea
            placeholder="Please explain why..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="bg-background h-20 text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectInput(false)}
              disabled={isLoading}
              className="flex-1 h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              className="flex-1 h-7 text-xs"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}