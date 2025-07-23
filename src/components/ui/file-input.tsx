import * as React from "react";
import { cn } from "@/lib/utils";
import {
  validateFile,
  allowedImageTypes,
  maxFileSize,
} from "@/lib/utils/validation";
import { Upload, X, File, Image } from "lucide-react";

export interface FileInputProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  accept?: string;
  maxSize?: number;
  allowedTypes?: string[];
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  showPreview?: boolean;
  multiple?: boolean;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      value,
      onChange,
      onValidationChange,
      accept,
      maxSize = maxFileSize,
      allowedTypes = allowedImageTypes,
      placeholder = "Choose a file...",
      error,
      className,
      disabled = false,
      required = false,
      showPreview = true,
      multiple = false,
      ...props
    },
    ref
  ) => {
    const [validationError, setValidationError] = React.useState<
      string | undefined
    >(error);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    // Update validation error when external error prop changes
    React.useEffect(() => {
      setValidationError(error);
    }, [error]);

    // Generate preview URL for images
    React.useEffect(() => {
      if (value && showPreview && value.type.startsWith("image/")) {
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPreviewUrl(null);
      }
    }, [value, showPreview]);

    // Validate file
    const validateFileInput = React.useCallback(
      (file: File) => {
        const validation = validateFile(file, allowedTypes, maxSize);
        setValidationError(validation.isValid ? undefined : validation.error);
        onValidationChange?.(validation.isValid, validation.error);
        return validation.isValid;
      },
      [allowedTypes, maxSize, onValidationChange]
    );

    // Handle file selection
    const handleFileChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
          onChange(null);
          setValidationError(undefined);
          onValidationChange?.(true);
          return;
        }

        const file = files[0];

        if (validateFileInput(file)) {
          onChange(file);
        } else {
          onChange(null);
          // Clear the input
          e.target.value = "";
        }
      },
      [onChange, validateFileInput]
    );

    // Handle drag and drop
    const handleDragOver = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const file = files[0];
          if (validateFileInput(file)) {
            onChange(file);
          }
        }
      },
      [onChange, validateFileInput]
    );

    // Clear file
    const handleClear = React.useCallback(() => {
      onChange(null);
      setValidationError(undefined);
      onValidationChange?.(true);
    }, [onChange, onValidationChange]);

    // Get file icon based on type
    const getFileIcon = (file: File) => {
      if (file.type.startsWith("image/")) {
        return <Image className="h-8 w-8 text-blue-500" />;
      }
      return <File className="h-8 w-8 text-gray-500" />;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const shouldShowError = validationError || error;
    const finalError = validationError || error;

    return (
      <div className={cn("w-full", className)}>
        {/* File Input */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragOver && "border-primary bg-primary/5",
            shouldShowError && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-primary/50 cursor-pointer"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={ref}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept={accept}
            disabled={disabled}
            required={required}
            multiple={multiple}
            {...props}
          />

          {!value ? (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {placeholder}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {formatFileSize(maxSize)} | Types:{" "}
                  {allowedTypes.map((type) => type.split("/")[1]).join(", ")}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File Preview */}
              {showPreview && previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  {getFileIcon(value)}
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground truncate max-w-48">
                      {value.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(value.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {shouldShowError && (
          <p className="mt-2 text-sm text-destructive">{finalError}</p>
        )}

        {/* Security Notice */}
        <p className="mt-2 text-xs text-muted-foreground">
          Files are validated for security. Only safe file types are allowed.
        </p>
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
