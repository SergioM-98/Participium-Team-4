"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { getAllCompanies } from "@/controllers/company.controller";
import { Button } from "./ui/button";
import { assignReportToCompany, updateReportStatus } from "@/app/lib/controllers/report.controller";


interface CompanyOption {
  id: string;
  name: string;
  hasAccess: boolean;
  email: string;
}

type Props = {
  reportId: string;
  reportTitle?: string;
  status: string;
  companyId: string | null;
  // Accept both direct boolean and functional updater (like setState)
  setRefreshFlag: Dispatch<SetStateAction<boolean>>;
  setReport: Dispatch<SetStateAction<any>>;
  showToast: (type: 'success' | 'error', text: string) => void;

}



export default function OfficerReportMenu(props: Readonly<Props>) {

    
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);

    

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

    
    const handleCompanyChange = (value: string) => {
        if (value === "NONE") {
            setSelectedCompany("");
        } else {
            setSelectedCompany(value);
            console.log(`Selected company: ${value}`);
        }
    };

    const handleAssignCompany = async () => {
        const company = companies.find(c => c.id === selectedCompany);
        if (!company) return;

        await assignReportToCompany(Number.parseInt(props.reportId, 10), selectedCompany);
        props.setRefreshFlag((prev)=>!prev);
        props.setReport((prev: any) => (null));
        
        const reportName = props.reportTitle || `#${props.reportId}`;
        let message = `Assigned company ${company.name} to report ${reportName}`;
        
        if (!company.hasAccess) {
            message += `. Please contact them at ${company.email}`;
        }
        
        props.showToast('success', message);
        console.log(`Assigning company ${selectedCompany} to report ${props.reportId}`);
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case "IN_PROGRESS":
                return "In Progress";
            case "RESOLVED":
                return "Resolved";
            case "SUSPENDED":
                return "Suspended";
            case "ASSIGNED":
                return "Assigned";
            default:
                return status;
        }
    };

    const handleUpdateReportStatus = async (newStatus:string) => {
        await updateReportStatus(newStatus, props.reportId);
        props.setRefreshFlag((prev)=>!prev);
        props.setReport((prev: any) => (null));
        
        const reportName = props.reportTitle || `#${props.reportId}`;
        const statusLabel = getStatusLabel(newStatus);
        
        props.showToast('success', `Updated status for report ${reportName} to ${statusLabel}`);
        console.log(`Updating status for report ${props.reportId} to ${newStatus}`);
    };

    return (
      <div className="w-full p-3 bg-card rounded-md shadow-sm border border-border">
        {/* TOP: company selector or assigned company */}
        <div className="mb-3">
          {props.companyId ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center text-sm font-semibold text-secondary">
                  {companies.find(c => c.id === props.companyId)?.name?.charAt(0).toUpperCase() || props.companyId?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{companies.find(company => company.id === props.companyId)?.name || props.companyId}</div>
                  <div className="text-[11px] text-muted-foreground">Assigned</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="company-select" className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                Assign Company
              </label>
              <Select
                value={selectedCompany}
                onValueChange={handleCompanyChange}
                disabled={companiesLoading}
              >
                <SelectTrigger id="company-select" className="w-full h-9 text-sm rounded-md border border-input bg-background">
                  <SelectValue placeholder={companiesLoading ? "Loading..." : "Select company..."} />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-[220px]">
                  <SelectItem value="NONE">None</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Button className="w-full h-9 text-sm" onClick={async ()=>await handleAssignCompany()} disabled={!selectedCompany}>
                  Assign
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM: current/next status display */}
        <div className="mb-3">
          <div className="text-[12px] text-muted-foreground flex items-center justify-between">
            <span>Current</span>
            <span className="font-medium">{props.status === "in_progress" ? "In Progress" : props.status}</span>
          </div>
          {props.status !== "resolved" && (
            <div className="text-[12px] text-muted-foreground flex items-center justify-between">
              <span>Next</span>
              <span className="font-medium">{props.status === "assigned" || props.status === "suspended" ? "In progress" : "Resolved"}</span>
            </div>
          )}
        </div>

        {/* Update button: full width */}
        {props.status !== "resolved" && (
          <div className="mb-3">
            <Button
              className="w-full h-9 text-sm"
              onClick={async ()=>{ await handleUpdateReportStatus(props.status === "assigned" || props.status=== "suspended" ? "IN_PROGRESS" : "RESOLVED"); }}
              disabled={selectedCompany != ""}
            >
              Update
            </Button>
          </div>
        )}

        {/* Suspend: full width */}
        {(props.status === "assigned" || props.status === "in_progress") && (
          <div>
            <Button className="w-full h-9 text-sm" onClick={async ()=>await handleUpdateReportStatus("SUSPENDED")} disabled={selectedCompany != ""}>
              Suspend
            </Button>
          </div>
        )}
      </div>
     );
}