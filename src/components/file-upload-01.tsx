"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { UploaderController } from "@/app/lib/controllers/uploader.controller";
import { ReportController } from "@/app/lib/controllers/report.controller";
import { useSession } from "next-auth/react";

interface UploadedFile {
  file: File;
  uploadId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUpload01Props {
  location?: { lat: number; lng: number } | null;
}

export default function FileUpload01({ location: locationProp }: FileUpload01Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>(
    {}
  );
  const { data: session, status } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const uploadFileToServer = async (file: File): Promise<{success: boolean, uploadId?: string, error?: string}> => {
    try {
      // Encode metadata in TUS format (base64)
      const filenameBase64 = btoa(file.name);
      const metadata = `filename ${filenameBase64}`;

      const formData = new FormData();
      formData.append('tus-resumable', '1.0.0');
      formData.append('upload-length', file.size.toString());
      formData.append('upload-metadata', metadata);
      formData.append('file', file);

      const result = await new UploaderController().createUploadPhoto(formData);

      if (result.success && result.location) {
        return { success: true, uploadId: result.location };
      } else {
        return { success: false, error: 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || isUploading) return;

    const currentFileCount = uploadedFiles.length;
    const newFileCount = files.length;
    const totalFiles = currentFileCount + newFileCount;

    // Check if adding these files would exceed the limit
    if (totalFiles > 3) {
      setValidationErrors([`You can upload a maximum of 3 photos. Currently you have ${currentFileCount} photo(s).`]);
      return;
    }

    setValidationErrors([]);

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      status: 'pending' as const
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Initialize progress for new files
    newFiles.forEach((uploadFile) => {
      setFileProgresses((prev) => ({
        ...prev,
        [uploadFile.file.name]: 0,
      }));
    });

    // Upload files sequentially
    setIsUploading(true);
    for (const uploadFile of newFiles) {
      await uploadSingleFile(uploadFile);
    }
    setIsUploading(false);
  };

  const uploadSingleFile = async (uploadFile: UploadedFile) => {
    const fileName = uploadFile.file.name;

    // Update status to uploading
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.file.name === fileName ? { ...f, status: 'uploading' as const } : f
      )
    );

    // Set initial progress
    setFileProgresses((prev) => ({ ...prev, [fileName]: 0 }));

    try {
      // Update progress to 50% when starting upload
      setFileProgresses((prev) => ({ ...prev, [fileName]: 50 }));

      // Perform actual upload
      const result = await uploadFileToServer(uploadFile.file);

      if (result.success) {
        // Upload completed
        setFileProgresses((prev) => ({ ...prev, [fileName]: 100 }));
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file.name === fileName
              ? { ...f, status: 'completed' as const, uploadId: result.uploadId }
              : f
          )
        );
      } else {
        // Upload failed
        setFileProgresses((prev) => ({ ...prev, [fileName]: 0 }));
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file.name === fileName
              ? { ...f, status: 'error' as const, error: result.error }
              : f
          )
        );
      }
    } catch (error) {
      // Handle unexpected errors
      setFileProgresses((prev) => ({ ...prev, [fileName]: 0 }));
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file.name === fileName
            ? { ...f, status: 'error' as const, error: 'Unexpected error during upload' }
            : f
        )
      );
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = async (filename: string) => {
    // Find the file to remove
    const fileToRemove = uploadedFiles.find(f => f.file.name === filename);
    
    // If the file was successfully uploaded, delete it from the server
    if (fileToRemove?.uploadId && fileToRemove.status === 'completed') {
      try {
        const result = await new UploaderController().deleteUpload(fileToRemove.uploadId);
        if (!result.success) {
          console.error('Failed to delete file from server:');
        }
      } catch (error) {
        console.error('Error deleting file from server:', error);
      }
    }
    
    // Remove from UI
    setUploadedFiles((prev) => prev.filter((uploadFile) => uploadFile.file.name !== filename));
    setFileProgresses((prev) => {
      const newProgresses = { ...prev };
      delete newProgresses[filename];
      return newProgresses;
    });
  };

  return (
    <div className="w-full flex items-start justify-center">
      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-md">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Report created successfully!</h3>
              <p className="mt-1 text-sm text-green-700">Your report has been submitted and is pending approval.</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-shrink-0 text-green-500 hover:text-green-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <Card className="w-full bg-background rounded-lg p-0 shadow-md">
        <CardContent className="p-0">
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Create a new report
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill the form and add images to create a new report.
                </p>
              </div>
            </div>
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
          <div className="px-6 pb-4 mt-2">
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="reportTitle" className="mb-2">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reportTitle"
                  type="text"
                  placeholder="Enter a title for your report"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={5}
                  maxLength={100}
                />
                {validationErrors.some(e => e.includes('Title')) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.find(e => e.includes('Title'))}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reportDescription" className="mb-2">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reportDescription"
                  placeholder="Describe the issue or report"
                  required
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={10}
                  maxLength={1000}
                />
                {validationErrors.some(e => e.includes('Description')) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.find(e => e.includes('Description'))}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reportCategory" className="mb-2">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select required value={category} onValueChange={setCategory}>
                  <SelectTrigger id="reportCategory" className="ps-2 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="WATER_SUPPLY">Water supply</SelectItem>
                      <SelectItem value="ARCHITECTURAL_BARRIERS">Architectural barriers</SelectItem>
                      <SelectItem value="SEWER_SYSTEM">Sewer system</SelectItem>
                      <SelectItem value="PUBLIC_LIGHTING">Public lighting</SelectItem>
                      <SelectItem value="WASTE">Waste</SelectItem>
                      <SelectItem value="ROADS_SIGNS_AND_TRAFFIC_LIGHTS">Roads, signs and traffic lights</SelectItem>
                      <SelectItem value="ROADS_AND_URBAN_FURNISHINGS">Roads and urban furnishings</SelectItem>
                      <SelectItem value="PUBLIC_GREEN_AREAS_AND_BACKGROUNDS">Public green areas and backgrounds</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {validationErrors.includes('Category is required') && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6">
            <div
              className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={handleBoxClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-2 bg-muted rounded-full p-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Upload a report image
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or,{' '}
                <label
                  htmlFor="fileUpload"
                  className="text-primary hover:text-primary/90 font-medium cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  click to browse
                </label>
              </p>
              <input
                type="file"
                id="fileUpload"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
            {(validationErrors.some(e => e.includes('photo')) || 
              validationErrors.some(e => e.includes('uploads')) ||
              validationErrors.some(e => e.includes('Maximum'))) && (
              <p className="text-xs text-red-500 mt-2">
                {validationErrors.find(e => e.includes('photo') || e.includes('uploads') || e.includes('Maximum'))}
              </p>
            )}
            {validationErrors.includes('Location is required - please select a location on the map') && (
              <p className="text-xs text-red-500 mt-2">Please select a location on the map</p>
            )}
          </div>

          <div
            className={cn(
              "px-6 pb-5 space-y-3",
              uploadedFiles.length > 0 ? "mt-4" : ""
            )}
          >
            {uploadedFiles.map((uploadFile, index) => {
              const imageUrl = URL.createObjectURL(uploadFile.file);
              const isError = uploadFile.status === 'error';
              const isCompleted = uploadFile.status === 'completed';

              return (
                <div
                  className="border border-border rounded-lg p-2 flex flex-col"
                  key={uploadFile.file.name + index}
                  onLoad={() => {
                    return () => URL.revokeObjectURL(imageUrl);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-18 h-14 bg-muted rounded-sm flex items-center justify-center self-start row-span-2 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={uploadFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 pr-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground truncate max-w-[250px]">
                            {uploadFile.file.name}
                          </span>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {Math.round(uploadFile.file.size / 1024)} KB
                          </span>
                          {isError && (
                            <span className="text-xs text-red-500">
                              Failed
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs text-green-500">
                              ✓
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 bg-transparent! hover:text-red-500"
                          onClick={() => removeFile(uploadFile.file.name)}
                          disabled={uploadFile.status === 'uploading'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
                          <div
                            className={cn(
                              "h-full transition-all",
                              isError ? "bg-red-500" : isCompleted ? "bg-green-500" : "bg-primary"
                            )}
                            style={{
                              width: `${fileProgresses[uploadFile.file.name] || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {Math.round(fileProgresses[uploadFile.file.name] || 0)}%
                        </span>
                      </div>
                      {isError && uploadFile.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* <div className="px-6 pb-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="anonymous" className="text-sm text-foreground cursor-pointer">
                Submit report anonymously
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Your personal information will not be shared with this report
            </p>
          </div> */}

          <div className="px-6 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Need help?
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="py-3 bg-background text-foreground border">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium">Need assistance?</p>
                    <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                      Upload report images by dragging and dropping files or
                      using the file browser. Supported formats: JPG, PNG, SVG.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium"
                onClick={() => {
                  setUploadedFiles([]);
                  setFileProgresses({});
                  setTitle("");
                  setDescription("");
                  setCategory("");
                  setValidationErrors([]);
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
                <Button 
                  className="h-9 px-4 text-sm font-medium"
                  disabled={isUploading || isSubmitting}
                  onClick={async () => {
                    setError(null);
                    // Validate form
                    const errors: string[] = [];
                    if (!title.trim()) {
                      errors.push('Title is required');
                    } else if (title.trim().length < 5) {
                      errors.push('Title must be at least 5 characters');
                    } else if (title.trim().length > 100) {
                      errors.push('Title must be at most 100 characters');
                    }
                    if (!description.trim()) {
                      errors.push('Description is required');
                    } else if (description.trim().length < 10) {
                      errors.push('Description must be at least 10 characters');
                    } else if (description.trim().length > 1000) {
                      errors.push('Description must be at most 1000 characters');
                    }
                    if (!category) {
                      errors.push('Category is required');
                    }
                    if (!locationProp) {
                      errors.push('Location is required - please select a location on the map');
                    }
                    const completedUploads = uploadedFiles.filter(f => f.status === 'completed');
                    if (completedUploads.length === 0) {
                      errors.push('At least 1 photo is required');
                    }
                    if (completedUploads.length > 3) {
                      errors.push('Maximum 3 photos allowed');
                    }
                    if (uploadedFiles.some(f => f.status === 'error')) {
                      errors.push('Please remove failed uploads before continuing');
                    }
                    if (errors.length > 0) {
                      setValidationErrors(errors);
                      return;
                    }
                    setValidationErrors([]);
                    setIsSubmitting(true);
                    try {
                      // Prepare photo IDs from uploaded files
                      const photoIds = completedUploads.map(f => f.uploadId).filter(Boolean) as string[];
                      // Submit report
                      const result = await new ReportController().createReport(
                        title,
                        description,
                        photoIds,
                        category,
                        locationProp!.lng,
                        locationProp!.lat,
                        isAnonymous
                      );
                      console.log('Report created successfully:', result);
                      // Reset form on success
                      setUploadedFiles([]);
                      setFileProgresses({});
                      setTitle("");
                      setDescription("");
                      setCategory("");
                      setIsAnonymous(false);
                      // Show success message
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 5000);
                    } catch (err) {
                      console.error('Error creating report:', err);
                      setError('Failed to create report. Please try again.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {isSubmitting ? 'Creating report...' : isUploading ? 'Uploading...' : 'Continue'}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
