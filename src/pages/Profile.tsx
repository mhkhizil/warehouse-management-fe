import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CarPartsLoader from "@/components/ui/car-parts-loader";
import {
  checkPasswordStrength,
  calculatePasswordStrength,
  type PasswordRequirement,
} from "@/lib/utils/password";

export default function Profile() {
  const { user: currentUser, updateUser } = useAuth();
  const { updateProfile, isLoading, error, clearError } = useUserManagement();

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
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Current Info Display */}
            {!isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {currentUser.name}
                    </h3>
                    <p className="text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {currentUser.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {isEditing && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Change Password (Optional)
                  </h4>

                  <div>
                    <label className="block text-sm font-medium mb-1">
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
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                    <label className="block text-sm font-medium mb-1">
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                      <div className="mt-2 space-y-2">
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
                        <div className="mt-2 space-y-2">
                          <span className="text-xs text-muted-foreground">
                            Password Requirements:
                          </span>
                          <div className="space-y-1">
                            {passwordRequirements.map((requirement, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs"
                              >
                                <Check
                                  className={cn(
                                    "h-3 w-3",
                                    requirement.isValid
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                                <span
                                  className={cn(
                                    requirement.isValid
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {requirement.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
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
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading}>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

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
