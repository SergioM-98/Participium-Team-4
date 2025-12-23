/**
 * Crop Modal Component - extracts image cropping UI
 */

import React from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface CropModalProps {
  imageSrc: string | null;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
}

export const CropModal: React.FC<CropModalProps> = ({
  imageSrc,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onClose,
  onSave,
  isOpen,
}) => {
  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
      <div className="bg-background w-full max-w-md rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Adjust Profile Picture</h3>
          <p className="text-sm text-muted-foreground">
            Drag to position, use slider to zoom.
          </p>
        </div>
        <div className="relative w-full h-64 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropComplete}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
          />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save & Upload</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
