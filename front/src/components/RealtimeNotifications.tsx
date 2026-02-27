import { useData } from "@/context/DataContext";
import Notification from "./Notification";

export default function RealtimeNotifications() {
  const { notifications, dismissNotification } = useData();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col-reverse gap-3 max-w-sm w-[calc(100vw-2rem)]">
      {notifications.map((n) => (
        <Notification
          key={n.id}
          message={n.message}
          type={n.type}
          createdAt={n.createdAt}
          duration={n.duration}
          onClose={() => dismissNotification(n.id)}
          inline
        />
      ))}
    </div>
  );
}
