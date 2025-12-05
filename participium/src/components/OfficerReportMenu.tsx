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
}

type Props = {
  reportId: string;
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
        }
    };

    const handleAssignCompany = async () => {
        await assignReportToCompany(Number.parseInt(props.reportId, 10), selectedCompany);
        props.setRefreshFlag((prev)=>!prev);
        props.setReport((prev: any) => (null));
        props.showToast('success', `Assigned company ${selectedCompany} to report ${props.reportId}`);
        console.log(`Assigning company ${selectedCompany} to report ${props.reportId}`);
    };

    const handleUpdateReportStatus = async (newStatus:string) => {
        await updateReportStatus(newStatus, props.reportId);
        props.setRefreshFlag((prev)=>!prev);
        props.setReport((prev: any) => (null));
        props.showToast('success', `Updated status for report ${props.reportId} to ${newStatus}`);
        console.log(`Updating status for report ${props.reportId} to ${newStatus}`);
    };

    return (
      <div className="w-full p-3 bg-card rounded-md shadow-sm border border-border">
        {/* TOP: company selector or assigned company */}
        <div className="mb-3">
          {!props.companyId ? (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                Assign Company
              </label>
              <Select
                value={selectedCompany}
                onValueChange={handleCompanyChange}
                disabled={companiesLoading}
              >
                <SelectTrigger className="w-full h-9 text-sm rounded-md border border-input bg-background">
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
          ) : (
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
          )}
        </div>

        {/* BOTTOM: left = current/next, right = update button */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[12px] text-muted-foreground flex items-center justify-between">
              <span>Current</span>
              <span className="font-medium">{props.status === "in_progress" ? "In Progress" : props.status}</span>
            </div>
            {props.status !== "resolved" && (<div className="text-[12px] text-muted-foreground flex items-center justify-between mb-1">
              <span>Next</span>
              <span className="font-medium">{props.status === "assigned" || props.status === "suspended" ? "In progress" : "Resolved"}</span>
            </div>)}
          </div>

          {props.status !== "resolved" && (<div className="w-36 flex-shrink-0 flex flex-col items-stretch">
            <Button
              className="w-full h-9 text-sm mb-2"
              onClick={async ()=>{ await handleUpdateReportStatus(props.status === "assigned" || props.status=== "suspended" ? "IN_PROGRESS" : "RESOLVED"); }}
              disabled={selectedCompany != ""}
            >
              Update
            </Button>
            {/* NOTE: il pulsante Suspend è stato spostato sotto tutto per occupare tutta la larghezza */}
          </div>)}
        </div>

        {/* Suspend: full width, sotto tutto */}
        {(props.status === "assigned" || props.status === "in_progress") && (
          <div className="mt-3">
            <Button className="w-full h-9 text-sm" onClick={async ()=>await handleUpdateReportStatus("SUSPENDED")} disabled={selectedCompany != ""}>
              Suspend
            </Button>
          </div>
        )}
      </div>
     );
}