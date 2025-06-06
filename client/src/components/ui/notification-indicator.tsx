import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationIndicator() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    clearAllNotifications 
  } = useNotificationStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead()}
              className="text-xs hover:text-primary"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No tienes notificaciones
          </div>
        ) : (
          <>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`flex flex-col items-start cursor-default px-4 py-3 ${!notification.read ? 'bg-muted/40' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div className={`h-2 w-2 mt-1.5 rounded-full ${notification.read ? 'bg-muted-foreground/50' : 'bg-primary'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground/90'}`}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistance(new Date(notification.createdAt), new Date(), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${!notification.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-xs text-destructive font-medium" 
              onClick={() => clearAllNotifications()}
            >
              Borrar todas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}