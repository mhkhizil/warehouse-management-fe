import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { useUserManagement } from "../core/presentation/hooks/useUserManagement";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Check,
  Camera,
  Upload,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import {
  checkPasswordStrength,
  calculatePasswordStrength,
  type PasswordRequirement,
} from "@/lib/utils/password";
import { User as UserEntity } from "@/core/domain/entities/User";

export default function Profile() {
  const { user: currentUser, updateUser } = useAuth();
  const { updateProfile, uploadProfileImage, isLoading, error, clearError } =
    useUserManagement();

  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Profile image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name,
      }));
    }
  }, [currentUser]);

  // Update password requirements when new password changes
  useEffect(() => {
    if (formData.newPassword) {
      const requirements = checkPasswordStrength(formData.newPassword);
      setPasswordRequirements(requirements);
      setPasswordStrength(calculatePasswordStrength(formData.newPassword));
    } else {
      setPasswordRequirements([]);
      setPasswordStrength(0);
    }
  }, [formData.newPassword]);

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage("Image file must be less than 5MB");
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) {
      return;
    }

    try {
      setIsUploadingImage(true);
      clearError();
      setMessage(null);

      const result = await uploadProfileImage(selectedImage);

      // Use refreshed user data from server if available, otherwise update manually
      if (result.refreshedUser) {
        updateUser(result.refreshedUser);
      } else if (currentUser) {
        // Fallback: update user profile image URL in auth context
        const updatedUser = new UserEntity({
          ...currentUser,
          profileImageUrl: result.profileImageUrl,
        });

        updateUser(updatedUser);
      }

      setMessage("Profile image updated successfully!");
      setSelectedImage(null);
      setImagePreview(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Failed to upload profile image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);

    // Validate passwords match if changing password
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setMessage("New passwords do not match");
      return;
    }

    // Validate password strength if changing password
    if (formData.newPassword && passwordStrength < 80) {
      setMessage("Password must meet at least 4 out of 5 requirements");
      return;
    }

    try {
      const updateData: {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};

      // Only include name if it's different
      if (formData.name !== currentUser?.name) {
        updateData.name = formData.name;
      }

      // Only include password fields if changing password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setMessage("Current password is required to change password");
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        setMessage("No changes to save");
        return;
      }

      const updatedUser = await updateProfile(updateData);

      // Update the user in auth context to reflect changes immediately in UI
      updateUser(updatedUser);

      setMessage("Profile updated successfully!");
      setIsEditing(false);

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData((prev) => ({
      ...prev,
      name: currentUser?.name || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setMessage(null);
    clearError();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "STAFF":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <CarPartsLoader size="md" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account information and password
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto"
          >
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Profile Information Card */}
        <div className="lg:col-span-8">
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
                        onClick={triggerFileInput}
                        className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm group-hover:scale-110"
                      >
                        <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
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
                          onClick={removeSelectedImage}
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
                                `${(selectedImage.size / 1024 / 1024).toFixed(
                                  2
                                )} MB`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={removeSelectedImage}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleImageUpload}
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
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Name
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
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
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  currentPassword: e.target.value,
                                }))
                              }
                              placeholder="Enter current password"
                              className="w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              placeholder="Enter new password"
                              minLength={6}
                              className="w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {formData.newPassword && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Password Strength
                                </span>
                                <span className="text-xs font-medium">
                                  {passwordStrength}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    passwordStrength < 40
                                      ? "bg-destructive"
                                      : passwordStrength < 80
                                      ? "bg-primary/60"
                                      : "bg-primary"
                                  )}
                                  style={{ width: `${passwordStrength}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Password Requirements */}
                          {formData.newPassword &&
                            passwordRequirements.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <span className="text-xs text-muted-foreground">
                                  Password Requirements:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                  {passwordRequirements.map(
                                    (requirement, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        <Check
                                          className={cn(
                                            "h-3 w-3 flex-shrink-0",
                                            requirement.isValid
                                              ? "text-primary"
                                              : "text-muted-foreground"
                                          )}
                                        />
                                        <span
                                          className={cn(
                                            "leading-tight",
                                            requirement.isValid
                                              ? "text-primary"
                                              : "text-muted-foreground"
                                          )}
                                        >
                                          {requirement.label}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              placeholder="Confirm new password"
                              minLength={6}
                              className="w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
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
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Information Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Account Status
                  </label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Member Since
                  </label>
                  <p className="text-sm mt-1">
                    {currentUser.createdDate
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(currentUser.createdDate)
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm mt-1">
                    {currentUser.updatedDate
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(currentUser.updatedDate)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          {/* <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span>User Management</span>
                <Badge
                  variant={currentUser.isAdmin() ? "default" : "secondary"}
                  className="text-xs"
                >
                  {currentUser.isAdmin() ? "Full Access" : "View Only"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span>Inventory</span>
                <Badge variant="default" className="text-xs">
                  Full Access
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span>Orders</span>
                <Badge variant="default" className="text-xs">
                  Full Access
                </Badge>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-md p-3 text-sm",
            message.includes("successfully")
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800"
              : "bg-destructive/15 text-destructive border border-destructive/20"
          )}
        >
          {message}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
