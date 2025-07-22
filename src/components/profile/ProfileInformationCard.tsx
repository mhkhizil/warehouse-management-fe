import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import { PasswordInput } from "@/components/reassembledComps/password-input";
import { User as UserEntity } from "@/core/domain/entities/User";

interface ProfileInformationCardProps {
  currentUser: UserEntity;
  isEditing: boolean;
  formData: {
    name: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  selectedImage: File | null;
  imagePreview: string | null;
  isUploadingImage: boolean;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: () => void;
  onRemoveSelectedImage: () => void;
  onTriggerFileInput: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormDataChange: (field: string, value: string) => void;
  getRoleBadgeVariant: (role: string) => "default" | "secondary" | "outline";
}

export function ProfileInformationCard({
  currentUser,
  isEditing,
  formData,
  selectedImage,
  imagePreview,
  isUploadingImage,
  isLoading,
  fileInputRef,
  onImageSelect,
  onImageUpload,
  onRemoveSelectedImage,
  onTriggerFileInput,
  onSubmit,
  onCancel,
  onFormDataChange,
  getRoleBadgeVariant,
}: ProfileInformationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Info Display */}
        {!isEditing && (
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative group">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {currentUser.profileImageUrl ? (
                    <img
                      src={currentUser.profileImageUrl}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={onTriggerFileInput}
                  className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm group-hover:scale-110"
                >
                  <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={onImageSelect}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {currentUser.name}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {currentUser.email}
                </p>
                <div className="mt-2">
                  <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                    {currentUser.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <p className="text-sm sm:text-base break-all">
                  {currentUser.email}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </div>
                <p className="text-sm sm:text-base">
                  {currentUser.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Image Upload Preview Modal */}
            {(selectedImage || imagePreview) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-muted/50 backdrop-blur-sm rounded-lg p-4 border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Profile Picture
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveSelectedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {imagePreview && (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm text-muted-foreground">
                        {selectedImage?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedImage &&
                          `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRemoveSelectedImage}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={onImageUpload}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <CarPartsLoader
                            size="xs"
                            variant="inline"
                            showText={false}
                            className="mr-2"
                          />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isUploadingImage ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFormDataChange("name", e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full"
                />
              </div>

              {/* Password Change Section */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-4">
                  Change Password (Optional)
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <PasswordInput
                      value={formData.currentPassword}
                      onChange={(value) =>
                        onFormDataChange("currentPassword", value)
                      }
                      placeholder="Enter current password"
                      showStrengthIndicator={false}
                      showRequirements={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password
                    </label>
                    <PasswordInput
                      value={formData.newPassword}
                      onChange={(value) =>
                        onFormDataChange("newPassword", value)
                      }
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <PasswordInput
                      value={formData.confirmPassword}
                      onChange={(value) =>
                        onFormDataChange("confirmPassword", value)
                      }
                      placeholder="Confirm new password"
                      minLength={6}
                      showStrengthIndicator={false}
                      showRequirements={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <CarPartsLoader
                    size="xs"
                    variant="inline"
                    showText={false}
                    className="mr-2"
                  />
                ) : (
                  <div className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
