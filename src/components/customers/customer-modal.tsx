import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, DollarSign, AlertTriangle, MapPin } from "lucide-react";
import { Customer } from "@/core/domain/entities/Customer";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "@/core/application/dtos/CustomerDTO";
import { Modal, FormModal } from "@/components/reassembledComps/modal";
import { User as CurrentUser } from "@/core/domain/entities/User";

type CustomerModalVariant = "view" | "create" | "edit";

interface CustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  variant: CustomerModalVariant;
  onSave?: (customerData: CreateCustomerDTO | UpdateCustomerDTO) => void;
  isLoading?: boolean;
  currentUser?: CurrentUser | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  variant,
  onSave,
  isLoading = false,

}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (customer && (variant === "edit" || variant === "view")) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else if (variant === "create") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [customer, variant, isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSave) return;

    onSave(formData);
  };

  const getDebtBadgeVariant = (hasDebt: boolean, isOverdue: boolean) => {
    if (!hasDebt) return "secondary";
    if (isOverdue) return "destructive";
    return "default";
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // View Mode
  if (variant === "view" && customer) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Customer Details"
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-6">
          {/* Customer Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <span className="text-xl font-bold text-primary">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-sm font-medium">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-sm font-medium">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </label>
                <p className="text-sm font-medium">
                  {customer.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm font-medium">
                  {customer.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Debt Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Debt Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Debt Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={getDebtBadgeVariant(
                      customer.hasOutstandingDebt(),
                      customer.getOverdueDebts().length > 0
                    )}
                  >
                    {customer.hasOutstandingDebt()
                      ? customer.getOverdueDebts().length > 0
                        ? "Overdue"
                        : "Has Debt"
                      : "No Debt"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Debt
                </label>
                <p className="text-sm font-medium">
                  ${customer.getTotalDebt().toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Overdue Debts
                </label>
                <p className="text-sm font-medium">
                  {customer.getOverdueDebts().length} overdue
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Active Debts
                </label>
                <p className="text-sm font-medium">
                  {customer.debt.length} total
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created Date
                </label>
                <p className="text-sm font-medium">
                  {formatDate(customer.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm font-medium">
                  {formatDate(customer.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Debt Details */}
          {customer.debt.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Debt Details
              </h4>
              <div className="space-y-2">
                {customer.debt.map((debt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        ${debt.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Due: {formatDate(debt.dueDate)}
                      </span>
                    </div>
                    <Badge
                      variant={
                        new Date(debt.dueDate) < new Date()
                          ? "destructive"
                          : "default"
                      }
                    >
                      {new Date(debt.dueDate) < new Date()
                        ? "Overdue"
                        : "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Create/Edit Mode
  const formContent = (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter customer name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Input
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder="Enter customer address"
        />
      </div>
    </>
  );

  const getTitle = () => {
    switch (variant) {
      case "create":
        return "Create New Customer";
      case "edit":
        return "Edit Customer";
      default:
        return "Customer Details";
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return "Create Customer";
      case "edit":
        return "Update";
      default:
        return "Save";
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return "Creating...";
      case "edit":
        return "Updating...";
      default:
        return "Saving...";
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      formContent={formContent}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={getSubmitText()}
      loadingText={getLoadingText()}
    />
  );
};
