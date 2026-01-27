import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormModal, Modal } from "@/components/reassembledComps/modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerDebt } from "@/core/domain/entities/CustomerDebt";
import {
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useDateFormatter, useNumberFormatter } from "@/lib/i18n/formatters";

type DebtModalVariant = "view" | "create" | "edit";

interface DebtsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    customerId: number;
    amount: number;
    dueDate: string;
    isSettled?: boolean;
    transactionId?: number;
    remarks?: string;
  }) => Promise<void>;
  onSave?: (data: {
    customerId: number;
    amount: number;
    dueDate: string;
    isSettled?: boolean;
    transactionId?: number;
    remarks?: string;
  }) => Promise<void>;
  initialData?: Partial<CustomerDebt> | null;
  isLoading?: boolean;
  currentUser?: unknown;
  variant?: DebtModalVariant;
}

export function DebtsFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  variant = "create",
  isLoading = false,
}: DebtsFormModalProps) {
  const { t } = useTranslation();
  const { formatDateLong } = useDateFormatter();
  const { formatCurrency } = useNumberFormatter();
  const [form, setForm] = useState({
    customerId: initialData?.customerId ?? 0,
    amount: initialData?.amount ?? 0,
    dueDate: initialData?.dueDate?.slice(0, 10) ?? "",
    isSettled: initialData?.isSettled ?? false,
    transactionId:
      initialData?.transactionId ?? (undefined as number | undefined),
    remarks: initialData?.remarks ?? "",
  });

  useEffect(() => {
    if (variant === "view" || variant === "edit") {
      setForm({
        customerId: initialData?.customerId ?? 0,
        amount: initialData?.amount ?? 0,
        dueDate: initialData?.dueDate?.slice(0, 10) ?? "",
        isSettled: initialData?.isSettled ?? false,
        transactionId: initialData?.transactionId ?? undefined,
        remarks: initialData?.remarks ?? "",
      });
    } else if (variant === "create") {
      setForm({
        customerId: 0,
        amount: 0,
        dueDate: "",
        isSettled: false,
        transactionId: undefined,
        remarks: "",
      });
    }
  }, [initialData, variant]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setForm({
        customerId: 0,
        amount: 0,
        dueDate: "",
        isSettled: false,
        transactionId: undefined,
        remarks: "",
      });
    }
  }, [isOpen]);

  const getStatusBadge = () => {
    if (initialData?.isSettled) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {t("customers.settled")}
        </Badge>
      );
    }

    const dueDate = initialData?.dueDate ? new Date(initialData.dueDate) : null;
    const now = new Date();

    if (dueDate && dueDate < now) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t("customers.overdue")}
        </Badge>
      );
    }

    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {t("customers.unsettled")}
      </Badge>
    );
  };

  // View Mode - Show all customer debt information
  if (variant === "view" && initialData) {
    const debt = initialData as CustomerDebt;
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("customers.debts.debtDetails")}
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-6">
          {/* Debt Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {formatCurrency(debt.amount ?? 0)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("customers.debts.debtAmount")}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("customers.debts.customerInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debts.columns.customer")}
                </label>
                <p className="text-sm font-medium">
                  {debt.customer?.name ||
                    `${t("customers.debts.form.customerId")}: ${
                      debt.customerId
                    }`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debts.form.customerId")}
                </label>
                <p className="text-sm font-medium">{debt.customerId}</p>
              </div>
            </div>
          </div>

          {/* Debt Details */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("customers.debts.debtInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debts.columns.amount")}
                </label>
                <p className="text-sm font-medium">
                  {formatCurrency(debt.amount ?? 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debts.columns.dueDate")}
                </label>
                <p className="text-sm font-medium">
                  {debt.dueDate ? formatDateLong(debt.dueDate) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debts.columns.status")}
                </label>
                <div className="mt-1">{getStatusBadge()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("customers.debts.form.transactionId")}
                </label>
                <p className="text-sm font-medium">
                  {debt.transactionId || t("customers.debts.notProvided")}
                </p>
              </div>
            </div>
          </div>

          {/* Alert Information */}
          {debt.alertSent !== undefined && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {t("customers.debts.alertInformation")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("customers.debts.columns.alertSent")}
                  </label>
                  <p className="text-sm font-medium">
                    <Badge variant={debt.alertSent ? "default" : "secondary"}>
                      {debt.alertSent ? t("common.yes") : t("common.no")}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          {debt.remarks && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("customers.debts.form.remarks")}
              </h4>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{debt.remarks}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("customers.debts.recordInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.createdAt")}
                </label>
                <p className="text-sm font-medium">
                  {debt.createdAt ? formatDateLong(debt.createdAt) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.updatedAt")}
                </label>
                <p className="text-sm font-medium">
                  {debt.updatedAt ? formatDateLong(debt.updatedAt) : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>{t("common.close")}</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Create/Edit Mode
  const getTitle = () => {
    switch (variant) {
      case "create":
        return t("customers.debts.createTitle");
      case "edit":
        return t("customers.debts.editTitle");
      default:
        return t("customers.debts.debtDetails");
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return t("common.create");
      case "edit":
        return t("common.save");
      default:
        return t("common.save");
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return t("customers.debts.creating");
      case "edit":
        return t("customers.debts.updating");
      default:
        return t("customers.debts.saving");
    }
  };

  const formContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("customers.debts.form.customerId")}
        </label>
        <Input
          type="number"
          value={form.customerId}
          onChange={(e) =>
            setForm((f) => ({ ...f, customerId: Number(e.target.value) }))
          }
          placeholder={t("customers.debts.form.customerIdPlaceholder")}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("customers.debts.form.amount")}
        </label>
        <Input
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) =>
            setForm((f) => ({ ...f, amount: Number(e.target.value) }))
          }
          placeholder={t("customers.debts.form.amountPlaceholder")}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("customers.debts.form.dueDate")}
        </label>
        <Input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("customers.debts.form.transactionId")}
        </label>
        <Input
          type="number"
          value={form.transactionId ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              transactionId: e.target.value
                ? Number(e.target.value)
                : undefined,
            }))
          }
          placeholder={t("customers.debts.form.transactionIdPlaceholder")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("customers.debts.form.remarks")}
        </label>
        <Input
          type="text"
          value={form.remarks}
          onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
          placeholder={t("customers.debts.form.remarksPlaceholder")}
        />
      </div>
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      submitText={getSubmitText()}
      cancelText={t("common.cancel")}
      loadingText={getLoadingText()}
      isLoading={isLoading}
      onSubmit={async () => {
        if (onSubmit) {
          await onSubmit({
            customerId: Number(form.customerId),
            amount: Number(form.amount),
            dueDate: new Date(form.dueDate).toISOString(),
            isSettled: form.isSettled,
            transactionId: form.transactionId
              ? Number(form.transactionId)
              : undefined,
            remarks: form.remarks?.trim() || undefined,
          });
        }
      }}
      formContent={formContent}
    />
  );
}



