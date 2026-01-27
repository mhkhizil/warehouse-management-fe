import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User as UserEntity } from "@/core/domain/entities/User";
import { useDateFormatter } from "@/lib/i18n/formatters";

interface AccountDetailsCardProps {
  currentUser: UserEntity;
}

export function AccountDetailsCard({ currentUser }: AccountDetailsCardProps) {
  const { t } = useTranslation();
  const { formatDate, formatDateLong } = useDateFormatter();
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          {t("profile.accountDetails")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("profile.accountStatus")}
            </label>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                {t("profile.active")}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("profile.memberSince")}
            </label>
            <p className="text-sm mt-1">
              {currentUser.createdDate
                ? formatDateLong(currentUser.createdDate)
                : t("profile.notAvailable")}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("profile.lastUpdated")}
            </label>
            <p className="text-sm mt-1">
              {currentUser.updatedDate
                ? formatDate(currentUser.updatedDate)
                : t("profile.notAvailable")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
