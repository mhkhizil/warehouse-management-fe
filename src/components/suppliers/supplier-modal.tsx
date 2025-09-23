import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useDateFormatter } from "@/lib/i18n/formatters";

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
  const { t } = useTranslation();
  const { formatDateLong } = useDateFormatter();
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
    return formatDateLong(date);
  };

  // View Mode
  if (variant === "view" && supplier) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("suppliers.supplierDetails")}
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
              {t("suppliers.basicInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.fullName")}
                </label>
                <p className="text-sm font-medium">{supplier.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.emailAddress")}
                </label>
                <p className="text-sm font-medium">{supplier.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.phoneNumber")}
                </label>
                <p className="text-sm font-medium">
                  {supplier.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.address")}
                </label>
                <p className="text-sm font-medium">
                  {supplier.address || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.contactPerson")}
                </label>
                <p className="text-sm font-medium">
                  {supplier.contactPerson || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.remarks")}
                </label>
                <p className="text-sm font-medium">
                  {supplier.remarks || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.status")}
                </label>
                <p className="text-sm font-medium">
                  {supplier.isActive
                    ? t("suppliers.active")
                    : t("suppliers.inactive")}
                </p>
              </div>
            </div>
          </div>

          {/* Debt Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("suppliers.debtInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.debtStatus")}
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
                        ? t("suppliers.overdue")
                        : t("suppliers.hasDebt")
                      : t("suppliers.noDebt")}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.totalDebt")}
                </label>
                <p className="text-sm font-medium">
                  ${supplier.getTotalDebt().toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.overdueDebts")}
                </label>
                <p className="text-sm font-medium">
                  {supplier.getOverdueDebts().length} overdue
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.activeDebts")}
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
              {t("suppliers.accountInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.createdDate")}
                </label>
                <p className="text-sm font-medium">
                  {formatDate(supplier.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("suppliers.lastUpdated")}
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
                {t("suppliers.debtDetails")}
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
                        ? t("suppliers.overdue")
                        : t("suppliers.active")}
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
        <label className="block text-sm font-medium mb-1">
          {t("common.name")}
        </label>
        <Input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder={t("suppliers.enterSupplierName")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.email")}
        </label>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder={t("suppliers.enterEmailAddress")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.phone")}
        </label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder={t("suppliers.enterPhoneNumber")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.address")}
        </label>
        <Input
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder={t("suppliers.enterSupplierAddress")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("suppliers.contactPerson")}
        </label>
        <Input
          type="text"
          value={formData.contactPerson}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
          }
          placeholder={t("suppliers.enterContactPersonName")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("suppliers.remarks")}
        </label>
        <Input
          type="text"
          value={formData.remarks}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, remarks: e.target.value }))
          }
          placeholder={t("suppliers.enterRemarksOrNotes")}
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
          {t("suppliers.activeSupplier")}
        </label>
      </div>
    </>
  );

  const getTitle = () => {
    switch (variant) {
      case "create":
        return t("suppliers.createNewSupplier");
      case "edit":
        return t("suppliers.editSupplier");
      default:
        return t("suppliers.supplierDetails");
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return t("suppliers.createSupplier");
      case "edit":
        return t("common.update");
      default:
        return t("common.save");
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return t("suppliers.creating");
      case "edit":
        return t("suppliers.updating");
      default:
        return t("suppliers.saving");
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
