// src/components/map/ClusterReportsSheet.tsx
import { Report } from "./ReportsClusterLayer"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Placeholder per ScrollArea (si prega di usare la vera implementazione shadcn: npm install @radix-ui/react-scroll-area)
const ScrollArea = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`overflow-y-auto ${className}`}>{children}</div>
);

interface ClusterReportsSheetProps {
    reports: Report[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onReportClick: (report: Report) => void; 
    isLoading: boolean;
}

/**
 * Sheet per mostrare la lista dei report all'interno di un cluster.
 */
export default function ClusterReportsSheet({ 
    reports, 
    isOpen, 
    onOpenChange, 
    onReportClick,
    isLoading
}: ClusterReportsSheetProps) {

    const handleCardClick = (report: Report) => {
        onOpenChange(false);
        onReportClick(report);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Report nel Cluster ({isLoading ? '...' : reports.length})</SheetTitle>
                    <SheetDescription>
                        Clicca su un report per visualizzare i dettagli.
                    </SheetDescription>
                </SheetHeader>
                <Separator />
                
                <ScrollArea className="flex-1 w-full p-2">
                    <div className="space-y-3 p-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground mt-3">Caricamento report...</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <p className="text-center text-muted-foreground pt-4">Nessun report trovato in questa area.</p>
                        ) : (
                            reports.map((report) => (
                                <Card 
                                    key={report.id} 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleCardClick(report)}
                                >
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold truncate">{report.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Categoria: {report.category.replace(/_/g, ' ')}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}