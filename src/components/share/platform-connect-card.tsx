import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-social";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PlatformConnectCardProps {
  platformName: string;
  Icon: LucideIcon;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  iconColorClassName: string;
  views?: number;
  userName?: string;
  userAvatar?: string;
}

export function PlatformConnectCard({ platformName, Icon, isConnected, onConnect, onDisconnect, iconColorClassName, views, userName, userAvatar }: PlatformConnectCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={cn("h-5 w-5", iconColorClassName)} />
          {platformName}
        </CardTitle>
        {isConnected ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {isConnected && userName && userAvatar ? (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{userName}</p>
                {views !== undefined ? (
                <p className="text-xs text-muted-foreground">{views.toLocaleString()} views</p>
                ) : (
                <p className="text-xs text-muted-foreground">Connecting</p>
                )}
              </div>
              </div>
            ) : (
              <>
            <div className="text-xs text-muted-foreground mb-3">
              {isConnected ? `Connected to ${platformName}.` : `Not connected.`}
            </div>
          </>
        )}
        <Button
          onClick={isConnected ? onDisconnect : onConnect}
          variant={isConnected ? "outline" : "default"}
          size="sm"
          className="w-full"
        >
          {isConnected ? "Disconnect" : `Connect to ${platformName}`}
        </Button>
      </CardContent>
    </Card>
  );
}
