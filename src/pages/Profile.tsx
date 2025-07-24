import React, { useState, useEffect } from "react";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { useUserManagement } from "../core/presentation/hooks/useUserManagement";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import { Header, HeaderButton } from "@/components/reassembledComps/header";
import {
  ProfileInformationCard,
  AccountDetailsCard,
} from "@/components/profile";
import { User as UserEntity } from "@/core/domain/entities/User";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user: currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const { updateProfile, uploadProfileImage, isLoading, error, clearError } =
    useUserManagement();

  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Profile image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name,
      }));
    }
  }, [currentUser]);

  // Handle image file selection with validation
  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);

    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
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

      toast({
        title: "Success",
        description: "Profile image updated successfully!",
        variant: "success",
      });
      setMessage("Profile image updated successfully!");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
      setMessage("Failed to upload profile image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      setMessage("New passwords do not match");
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
          toast({
            title: "Validation Error",
            description: "Current password is required to change password",
            variant: "destructive",
          });
          setMessage("Current password is required to change password");
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Info",
          description: "No changes to save",
          variant: "info",
        });
        setMessage("No changes to save");
        return;
      }

      const updatedUser = await updateProfile(updateData);

      // Update the user in auth context to reflect changes immediately in UI
      // Preserve the existing profileImageUrl if the updated user doesn't have it
      const userToUpdate = updatedUser.profileImageUrl
        ? updatedUser
        : new UserEntity({
            ...updatedUser,
            profileImageUrl: currentUser?.profileImageUrl,
          });

      updateUser(userToUpdate);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "success",
      });
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
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
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
      <Header
        title="Profile Settings"
        description="Manage your account information and password"
      >
        {!isEditing && (
          <HeaderButton onClick={() => setIsEditing(true)}>
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </HeaderButton>
        )}
      </Header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Profile Information Card */}
        <div className="lg:col-span-8">
          <ProfileInformationCard
            currentUser={currentUser}
            isEditing={isEditing}
            formData={formData}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            isUploadingImage={isUploadingImage}
            isLoading={isLoading}
            onImageSelect={handleImageSelect}
            onImageUpload={handleImageUpload}
            onRemoveSelectedImage={removeSelectedImage}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onFormDataChange={(field: string, value: string) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
            getRoleBadgeVariant={getRoleBadgeVariant}
            onImageValidation={() => {}} // No longer needed
          />
        </div>

        {/* Account Information Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <AccountDetailsCard currentUser={currentUser} />

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
