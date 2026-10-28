import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  const openNotification = async (id: string, link: string | null) => {
    await markRead(id);
    if (link) navigate(link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notificações</p>
            <p className="text-xs text-muted-foreground">Atualizações da plataforma</p>
          </div>
          <Button variant="ghost" size="icon" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">A carregar...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Sem notificações.</p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification.id, notification.link)}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-muted" : "bg-primary"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{notification.title}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: pt })}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
