import { 
    Droplet, 
    Accessibility, 
    Waves, 
    Lightbulb, 
    Trash2, 
    TrafficCone, 
    UtilityPole, 
    Trees, 
    AlertTriangle 
} from 'lucide-react';


const getIconByCategory = (category: string) => {
    switch (category) {
        case 'WATER_SUPPLY':
            return <Droplet className="w-5 h-5 text-black" />;
        case 'ARCHITECTURAL_BARRIERS':
            return <Accessibility className="w-5 h-5 text-black" />; 
        case 'SEWER_SYSTEM':
            return <Waves className="w-5 h-5 text-black" />;
        case 'PUBLIC_LIGHTING':
            return <Lightbulb className="w-5 h-5 text-black" />;
        case 'WASTE':
            return <Trash2 className="w-5 h-5 text-black" />;
        case 'ROADS_SIGNS_AND_TRAFFIC_LIGHTS':
            return <TrafficCone className="w-5 h-5 text-black" />;
        case 'ROADS_AND_URBAN_FURNISHINGS':
            return <UtilityPole className="w-5 h-5 text-black" />;
        case 'PUBLIC_GREEN_AREAS_AND_BACKGROUNDS':
            return <Trees className="w-5 h-5 text-black" />;
        case 'OTHER':
        default:
            return <AlertTriangle className="w-5 h-5 text-black" />;
    }
};


interface ReportMarkerProps {
    category: string;
}

export const ReportMarkerIcon = ({ category }: ReportMarkerProps) => (
  <div className="group relative flex items-center justify-center w-10 h-10">
    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse group-hover:bg-primary/30" />
    
    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-primary shadow-md transition-transform group-hover:scale-110">
        {getIconByCategory(category)}
    </div>
  </div>
);

interface ClusterIconProps {
  count: number;
  sizeClass?: string;
}

export const ClusterMarkerIcon = ({ count }: ClusterIconProps) => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="relative flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border-2 border-primary text-primary shadow-lg rounded-full w-full h-full transition-all hover:bg-primary hover:text-white hover:border-white hover:scale-105">
        <span className="text-sm font-bold leading-none">{count}</span>
    </div>
  </div>
);