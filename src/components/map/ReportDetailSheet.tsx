// src/components/map/ReportDetailSheet.tsx
"use client";

import { Report } from "@/app/lib/dtos/map.dto"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, MapPin } from "lucide-react";

interface ReportDetailSheetProps {
    report: Report | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ReportDetailSheet({ report, isOpen, onOpenChange }: ReportDetailSheetProps) {
    if (!report) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            {/* 👇 MODIFICA QUI: Aggiunto z-[9999] */}
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col z-[9999]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        {report.title}
                    </SheetTitle>
                    <SheetDescription>
                        Dettagli del report (MOCK COMPONENT).
                    </SheetDescription>
                </SheetHeader>
                <Separator />
                
                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                    <p className="text-lg font-medium">Categoria:</p>
                    <div className="px-3 py-1 bg-muted rounded-md w-fit font-mono text-sm">
                        {report.category.replace(/_/g, ' ')}
                    </div>

                    <p className="text-lg font-medium pt-2">Posizione:</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Lat: {report.latitude.toFixed(5)}, Lng: {report.longitude.toFixed(5)}
                    </div>
                    
                    <Separator />

                    <h3 className="text-xl font-bold text-primary pt-4">
                        Componente di Dettaglio Mock
                    </h3>
                    <p className="text-muted-foreground">
                        Questo è il placeholder per il componente che mostrerà i dettagli completi, foto e stato del report.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}