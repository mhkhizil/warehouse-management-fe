import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useDateFormatter } from "@/lib/i18n/formatters";

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
  const { t } = useTranslation();
  const { formatDateLong } = useDateFormatter();
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

  // formatDate is now handled by useDateFormatter hook

  // View Mode
  if (variant === "view" && customer) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("customers.customerDetails")}
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
              {t("customers.basicInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.fullName")}
                </label>
                <p className="text-sm font-medium">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.emailAddress")}
                </label>
                <p className="text-sm font-medium">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.phoneNumber")}
                </label>
                <p className="text-sm font-medium">
                  {customer.phone || t("customers.notProvided")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.address")}
                </label>
                <p className="text-sm font-medium">
                  {customer.address || t("customers.notProvided")}
                </p>
              </div>
            </div>
          </div>

          {/* Debt Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("customers.debtInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debtStatus")}
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
                        ? t("customers.overdue")
                        : t("customers.hasDebt")
                      : t("customers.noDebt")}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.totalDebt")}
                </label>
                <p className="text-sm font-medium">
                  ${customer.getTotalDebt().toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.overdueDebts")}
                </label>
                <p className="text-sm font-medium">
                  {customer.getOverdueDebts().length}{" "}
                  {t("customers.overdue").toLowerCase()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.activeDebts")}
                </label>
                <p className="text-sm font-medium">
                  {customer.debt.length} {t("customers.total").toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t("customers.accountInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.createdAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(customer.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.updatedAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(customer.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Debt Details */}
          {customer.debt.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t("customers.debtDetails")}
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
                        {t("customers.due")}: {formatDateLong(debt.dueDate)}
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
                        ? t("customers.overdue")
                        : t("customers.active")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>{t("common.close")}</Button>
          </div>
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
          placeholder={t("customers.enterCustomerName")}
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
          placeholder={t("customers.enterEmailAddress")}
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
          placeholder={t("customers.enterPhoneNumber")}
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
          placeholder={t("customers.enterCustomerAddress")}
        />
      </div>
    </>
  );

  const getTitle = () => {
    switch (variant) {
      case "create":
        return t("customers.createNewCustomer");
      case "edit":
        return t("customers.editCustomer");
      default:
        return t("customers.customerDetails");
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return t("customers.createCustomer");
      case "edit":
        return t("common.update");
      default:
        return t("common.save");
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return t("customers.creating");
      case "edit":
        return t("customers.updating");
      default:
        return t("customers.saving");
    }
  };

  return (
    <FormModal
    cancelText={t("common.cancel")}
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
