// src/components/map/ReportDetailSheet.tsx
"use client";

import { useEffect, useState } from "react";
import { Report } from "@/app/lib/dtos/map.dto"; 
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getReportById } from "@/app/lib/controllers/reportMap.controller";
import ReportDetailsCard from "@/components/ReportDetailsCard"; 
import { Loader2 } from "lucide-react";

interface ReportDetailSheetProps {
    report: Report | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ReportDetailSheet({ report, isOpen, onOpenChange }: Readonly<ReportDetailSheetProps>) {
    const [fullReport, setFullReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && report?.id) {
            setLoading(true);
            setFullReport(null);
            
            // 👇 CHIAMATA DIRETTA AL CONTROLLER
            getReportById({ id: report.id })
                .then((response) => {
                    if (response.success && response.data) {
                        // Mappiamo la risposta per il componente UI
                        setFullReport({
                            id: response.data.id,
                            title: response.data.title,
                            description: response.data.description,
                            category: response.data.category,
                            status: response.data.status?.toLowerCase() || 'pending',
                            latitude: response.data.latitude,
                            longitude: response.data.longitude,
                            reporterName: response.data.username,
                            createdAt: response.data.createdAt,
                            photoUrls: response.data.photos || []
                        });
                    } else {
                        console.error("Error fetching report details:", response.error);
                    }
                })
                .catch((err) => console.error("Failed to load details", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, report]);

    if (!report) return null;

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm rounded-l-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }
        
        if (fullReport) {
            return (
                <ReportDetailsCard 
                    report={fullReport} 
                    onClose={() => onOpenChange(false)} 
                />
            );
        }
        
        return (
            <div className="flex h-full w-full items-center justify-center bg-background rounded-l-xl p-6">
                <p className="text-muted-foreground">Report details not available.</p>
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col z-[9999] p-0 overflow-y-auto bg-transparent border-none shadow-none">
                {renderContent()}
            </SheetContent>
        </Sheet>
    );
}