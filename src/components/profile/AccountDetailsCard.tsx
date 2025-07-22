
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User as UserEntity } from "@/core/domain/entities/User";

interface AccountDetailsCardProps {
  currentUser: UserEntity;
}

export function AccountDetailsCard({ currentUser }: AccountDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Account Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Account Status
            </label>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Member Since
            </label>
            <p className="text-sm mt-1">
              {currentUser.createdDate
                ? new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(currentUser.createdDate)
                : "N/A"}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Last Updated
            </label>
            <p className="text-sm mt-1">
              {currentUser.updatedDate
                ? new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(currentUser.updatedDate)
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
