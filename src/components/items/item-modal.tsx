import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Package,
  DollarSign,
  Tag,
  Layers,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Item } from "@/core/domain/entities/Item";
import { CreateItemDTO, UpdateItemDTO } from "@/core/application/dtos/ItemDTO";
import { Modal, FormModal } from "@/components/reassembledComps/modal";
import { User as CurrentUser } from "@/core/domain/entities/User";
import { useDateFormatter, useNumberFormatter } from "@/lib/i18n/formatters";

type ItemModalVariant = "view" | "create" | "edit";

interface ItemModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  variant: ItemModalVariant;
  onSave?: (itemData: CreateItemDTO | UpdateItemDTO) => void;
  isLoading?: boolean;
  currentUser?: CurrentUser | null;
  availableParentItems?: Item[]; // List of items that can be selected as parent
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  isOpen,
  onClose,
  variant,
  onSave,
  isLoading = false,
  availableParentItems = [],
}) => {
  const { t } = useTranslation();
  const { formatDateLong } = useDateFormatter();
  const { formatCurrency } = useNumberFormatter();
  const [isSubItem, setIsSubItem] = useState(false);
  const [isSubItemsExpanded, setIsSubItemsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    price: 0,
    isSellable: true,
    remarks: "",
    parentItemId: undefined as number | undefined,
    initialQuantity: 0,
    refillAlert: false,
  });

  useEffect(() => {
    if (item && (variant === "edit" || variant === "view")) {
      setFormData({
        name: item.name,
        brand: item.brand,
        type: item.type,
        price: item.price,
        isSellable: item.isSellable,
        remarks: item.remarks || "",
        parentItemId: item.parentItemId || undefined,
        initialQuantity: item.getTotalStock(),
        refillAlert: item.needsRefill(),
      });
      setIsSubItem(!!item.parentItemId);
    } else if (variant === "create") {
      setFormData({
        name: "",
        brand: "",
        type: "",
        price: 0,
        isSellable: true,
        remarks: "",
        parentItemId: undefined,
        initialQuantity: 0,
        refillAlert: false,
      });
      setIsSubItem(false);
    }
  }, [item, variant, isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        brand: "",
        type: "",
        price: 0,
        isSellable: true,
        remarks: "",
        parentItemId: undefined,
        initialQuantity: 0,
        refillAlert: false,
      });
      setIsSubItem(false);
      setIsSubItemsExpanded(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSave) return;

    const submitData: CreateItemDTO | UpdateItemDTO = {
      name: formData.name,
      brand: formData.brand,
      type: formData.type,
      price: formData.price,
      isSellable: formData.isSellable,
      remarks: formData.remarks || undefined,
      parentItemId: formData.parentItemId,
      initialQuantity: formData.initialQuantity,
      refillAlert: formData.refillAlert,
    };

    onSave(submitData);
  };

  // View Mode
  if (variant === "view" && item) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("items.itemDetails")}
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-6">
          {/* Item Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.brand} - {item.type}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t("items.basicInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.name")}
                </label>
                <p className="text-sm font-medium">{item.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.brand")}
                </label>
                <p className="text-sm font-medium">
                  {item.brand || t("items.notProvided")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.type")}
                </label>
                <p className="text-sm font-medium">
                  {item.type || t("items.notProvided")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.remarks")}
                </label>
                <p className="text-sm font-medium">
                  {item.remarks || t("items.notProvided")}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Sales Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("items.pricingInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.price")}
                </label>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.sellable")}
                </label>
                <div className="mt-1">
                  <Badge variant={item.isSellable ? "default" : "secondary"}>
                    {item.isSellable ? t("common.yes") : t("common.no")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t("items.stockInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.totalStock")}
                </label>
                <p
                  className={`text-sm font-medium ${
                    item.isLowStock(10) ? "text-red-500" : ""
                  }`}
                >
                  {item.getTotalStock()} {t("items.units")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("items.stockStatus")}
                </label>
                <div className="mt-1">
                  {item.needsRefill() ? (
                    <Badge variant="destructive">
                      {t("items.refillNeeded")}
                    </Badge>
                  ) : item.isLowStock(10) ? (
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

          {/* Parent Item Information (if this is a sub-item) */}
          {item.isSubItem() && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {t("items.parentItemInfo")}
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-sm">
                  <span className="text-muted-foreground">{t("items.parentItemId")}:</span>{" "}
                  <span className="font-medium">{item.parentItemId}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("items.isSubItemNote")}
                </p>
              </div>
            </div>
          )}

          {/* Sub-Items Information with Toggle */}
          {item.hasSubItems() && (
            <div className="border rounded-lg overflow-hidden">
              {/* Toggle Header */}
              <button
                type="button"
                onClick={() => setIsSubItemsExpanded(!isSubItemsExpanded)}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  {t("items.subItems")}
                  <Badge variant="secondary" className="ml-1">
                    {item.subItems.length}
                  </Badge>
                </h4>
                {isSubItemsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Collapsible Content */}
              {isSubItemsExpanded && (
                <div className="p-3 space-y-3 border-t">
                  {item.subItems.map((subItem, index) => (
                    <div
                      key={index}
                      className="p-3 bg-background border rounded-lg space-y-2"
                    >
                      {/* Sub-item Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{subItem.name}</span>
                        </div>
                        <Badge variant={subItem.isSellable ? "default" : "secondary"}>
                          {subItem.isSellable ? t("items.sellable") : t("common.no")}
                        </Badge>
                      </div>

                      {/* Sub-item Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("items.brand")}:</span>{" "}
                          <span className="font-medium">{subItem.brand || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("items.type")}:</span>{" "}
                          <span className="font-medium">{subItem.type || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("items.price")}:</span>{" "}
                          <span className="font-medium text-green-600">
                            {formatCurrency(subItem.price)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("items.stockQuantity")}:</span>{" "}
                          <span
                            className={`font-medium ${
                              subItem.isLowStock(10) ? "text-red-500" : ""
                            }`}
                          >
                            {subItem.getTotalStock()} {t("items.units")}
                          </span>
                        </div>
                      </div>

                      {/* Sub-item Stock Status */}
                      <div className="flex items-center gap-2 pt-1">
                        {subItem.needsRefill() && (
                          <Badge variant="destructive" className="text-xs">
                            {t("items.refillNeeded")}
                          </Badge>
                        )}
                        {subItem.isLowStock(10) && !subItem.needsRefill() && (
                          <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                            {t("items.lowStock")}
                          </Badge>
                        )}
                        {subItem.hasSubItems() && (
                          <Badge variant="outline" className="text-xs">
                            {t("items.hasSubItems", { count: subItem.subItems.length })}
                          </Badge>
                        )}
                      </div>

                      {/* Sub-item Remarks */}
                      {subItem.remarks && (
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          <span className="font-medium">{t("items.remarks")}:</span> {subItem.remarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("items.recordInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.createdAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(item.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.updatedAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(item.updatedAt)}
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
  const formContent = (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.name")} *
        </label>
        <Input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder={t("items.enterItemName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("items.brand")}
          </label>
          <Input
            type="text"
            value={formData.brand}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, brand: e.target.value }))
            }
            placeholder={t("items.enterBrand")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("items.type")}
          </label>
          <Input
            type="text"
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            placeholder={t("items.enterType")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("items.price")} *
          </label>
          <Input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: parseFloat(e.target.value) || 0,
              }))
            }
            placeholder={t("items.enterPrice")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("items.initialQuantity")}
          </label>
          <Input
            type="number"
            min="0"
            value={formData.initialQuantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                initialQuantity: parseInt(e.target.value) || 0,
              }))
            }
            placeholder={t("items.enterInitialQuantity")}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("items.remarks")}
        </label>
        <Input
          type="text"
          value={formData.remarks}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, remarks: e.target.value }))
          }
          placeholder={t("items.enterRemarks")}
        />
      </div>

      {/* Sub-item Selection */}
      {availableParentItems.length > 0 && (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSubItem}
              onChange={(e) => {
                setIsSubItem(e.target.checked);
                if (!e.target.checked) {
                  setFormData((prev) => ({ ...prev, parentItemId: undefined }));
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {t("items.createAsSubItem")}
            </span>
          </label>

          {isSubItem && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("items.parentItem")} *
              </label>
              <Select
                value={formData.parentItemId?.toString() || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentItemId: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              >
                <option value="">{t("items.selectParentItem")}</option>
                {availableParentItems
                  .filter((parentItem) => parentItem.id !== item?.id) // Exclude current item in edit mode
                  .map((parentItem) => (
                    <option key={parentItem.id} value={parentItem.id.toString()}>
                      {parentItem.name}
                      {parentItem.brand ? ` (${parentItem.brand})` : ""}
                    </option>
                  ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {t("items.subItemHelp")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isSellable}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isSellable: e.target.checked }))
            }
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">{t("items.isSellable")}</span>
        </label>

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
          <span className="text-sm font-medium">{t("items.refillAlert")}</span>
        </label>
      </div>
    </>
  );

  const getTitle = () => {
    switch (variant) {
      case "create":
        return t("items.createNewItem");
      case "edit":
        return t("items.editItem");
      default:
        return t("items.itemDetails");
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return t("items.createItem");
      case "edit":
        return t("common.update");
      default:
        return t("common.save");
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return t("items.creating");
      case "edit":
        return t("items.updating");
      default:
        return t("items.saving");
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
