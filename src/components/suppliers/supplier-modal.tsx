import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, AlertTriangle, MapPin } from "lucide-react";
import { Supplier } from "@/core/domain/entities/Supplier";
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from "@/core/application/dtos/SupplierDTO";
import { Modal, FormModal } from "@/components/reassembledComps/modal";
import { User as CurrentUser } from "@/core/domain/entities/User";

type SupplierModalVariant = "view" | "create" | "edit";

interface SupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  variant: SupplierModalVariant;
  onSave?: (supplierData: CreateSupplierDTO | UpdateSupplierDTO) => void;
  isLoading?: boolean;
  currentUser?: CurrentUser | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  supplier,
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
    contactPerson: "",
    remarks: "",
    isActive: true,
  });

  useEffect(() => {
    if (supplier && (variant === "edit" || variant === "view")) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        contactPerson: supplier.contactPerson || "",
        remarks: supplier.remarks || "",
        isActive: supplier.isActive ?? true,
      });
    } else if (variant === "create") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
        remarks: "",
        isActive: true,
      });
    }
  }, [supplier, variant, isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
        remarks: "",
        isActive: true,
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
  if (variant === "view" && supplier) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Supplier Details"
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-6">
          {/* Supplier Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <span className="text-xl font-bold text-primary">
                {supplier.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{supplier.name}</h3>
              <p className="text-sm text-muted-foreground">{supplier.email}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-sm font-medium">{supplier.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-sm font-medium">{supplier.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </label>
                <p className="text-sm font-medium">
                  {supplier.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm font-medium">
                  {supplier.address || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Contact Person
                </label>
                <p className="text-sm font-medium">
                  {supplier.contactPerson || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Remarks
                </label>
                <p className="text-sm font-medium">
                  {supplier.remarks || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm font-medium">
                  {supplier.isActive ? "Active" : "Inactive"}
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
                      supplier.hasOutstandingDebt(),
                      supplier.getOverdueDebts().length > 0
                    )}
                  >
                    {supplier.hasOutstandingDebt()
                      ? supplier.getOverdueDebts().length > 0
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
                  ${supplier.getTotalDebt().toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Overdue Debts
                </label>
                <p className="text-sm font-medium">
                  {supplier.getOverdueDebts().length} overdue
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Active Debts
                </label>
                <p className="text-sm font-medium">
                  {supplier.debt.length} total
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
                  {formatDate(supplier.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm font-medium">
                  {formatDate(supplier.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Debt Details */}
          {supplier.debt.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Debt Details
              </h4>
              <div className="space-y-2">
                {supplier.debt.map((debt, index) => (
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
          placeholder="Enter supplier name"
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
          placeholder="Enter supplier address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact Person</label>
        <Input
          type="text"
          value={formData.contactPerson}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
          }
          placeholder="Enter contact person name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Remarks</label>
        <Input
          type="text"
          value={formData.remarks}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, remarks: e.target.value }))
          }
          placeholder="Enter remarks or notes"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active Supplier
        </label>
      </div>
    </>
  );

  const getTitle = () => {
    switch (variant) {
      case "create":
        return "Create New Supplier";
      case "edit":
        return "Edit Supplier";
      default:
        return "Supplier Details";
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return "Create Supplier";
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
