import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { Stock } from "@/core/domain/entities/Stock";
import { UpdateStockDTO } from "@/core/application/dtos/StockDTO";
import { Modal, FormModal } from "@/components/reassembledComps/modal";
import { User as CurrentUser } from "@/core/domain/entities/User";
import { useDateFormatter } from "@/lib/i18n/formatters";

type StockModalVariant = "view" | "edit";

interface StockModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  variant: StockModalVariant;
  onSave?: (stockData: UpdateStockDTO) => void;
  isLoading?: boolean;
  currentUser?: CurrentUser | null;
}

export const StockModal: React.FC<StockModalProps> = ({
  stock,
  isOpen,
  onClose,
  variant,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { formatDateLong } = useDateFormatter();
  const [formData, setFormData] = useState({
    quantity: 0,
    refillAlert: false,
  });

  useEffect(() => {
    if (stock && (variant === "edit" || variant === "view")) {
      setFormData({
        quantity: stock.quantity,
        refillAlert: stock.refillAlert,
      });
    }
  }, [stock, variant, isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        quantity: 0,
        refillAlert: false,
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSave) return;

    const submitData: UpdateStockDTO = {
      quantity: formData.quantity,
      refillAlert: formData.refillAlert,
    };

    onSave(submitData);
  };

  // View Mode
  if (variant === "view" && stock) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("stocks.stockDetails")}
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-6">
          {/* Stock Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{stock.getItemName()}</h3>
              <p className="text-sm text-muted-foreground">
                {stock.getItemBrand()} - {stock.getItemType()}
              </p>
            </div>
          </div>

          {/* Item Information */}
          {stock.item && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t("stocks.itemInformation")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("common.name")}
                  </label>
                  <p className="text-sm font-medium">{stock.item.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("items.brand")}
                  </label>
                  <p className="text-sm font-medium">
                    {stock.item.brand || t("stocks.notProvided")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("items.type")}
                  </label>
                  <p className="text-sm font-medium">
                    {stock.item.type || t("stocks.notProvided")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("items.sellable")}
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={stock.item.isSellable ? "default" : "secondary"}
                    >
                      {stock.item.isSellable ? t("common.yes") : t("common.no")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("stocks.stockInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("stocks.quantity")}
                </label>
                <p
                  className={`text-sm font-medium ${
                    stock.isLowStock(10) ? "text-red-500" : ""
                  }`}
                >
                  {stock.quantity} {t("items.units")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("stocks.stockStatus")}
                </label>
                <div className="mt-1">
                  {stock.needsRefill() ? (
                    <Badge variant="destructive">
                      {t("items.refillNeeded")}
                    </Badge>
                  ) : stock.isLowStock(10) ? (
                    <Badge variant="outline" className="text-orange-500">
                      {t("items.lowStock")}
                    </Badge>
                  ) : (
                    <Badge variant="default">{t("items.inStock")}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Refill Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("stocks.refillInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("stocks.lastRefilled")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(stock.lastRefilled)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("stocks.refillAlert")}
                </label>
                <div className="mt-1">
                  <Badge variant={stock.refillAlert ? "destructive" : "secondary"}>
                    {stock.refillAlert ? t("common.yes") : t("common.no")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("stocks.recordInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.createdAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(stock.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.updatedAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(stock.updatedAt)}
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

  // Edit Mode
  const formContent = (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("stocks.quantity")} *
        </label>
        <Input
          type="number"
          required
          min="0"
          value={formData.quantity}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              quantity: parseInt(e.target.value) || 0,
            }))
          }
          placeholder={t("stocks.enterQuantity")}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.refillAlert}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                refillAlert: e.target.checked,
              }))
            }
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">{t("stocks.refillAlert")}</span>
        </label>
      </div>

      {stock && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t("stocks.editingStockFor")}: <strong>{stock.getItemName()}</strong>
          </p>
        </div>
      )}
    </>
  );

  return (
    <FormModal
      cancelText={t("common.cancel")}
      isOpen={isOpen}
      onClose={onClose}
      title={t("stocks.editStock")}
      formContent={formContent}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={t("common.update")}
      loadingText={t("stocks.updating")}
    />
  );
};
