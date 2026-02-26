import { useData } from "@/context/DataContext";
import Notification from "./Notification";

export default function RealtimeNotifications() {
  const { notifications, dismissNotification } = useData();

  if (notifications.length === 0) return null;

  // Show only the most recent notification
  const latest = notifications[notifications.length - 1];

  return (
    <Notification
      key={latest.id}
      message={latest.message}
      type={latest.type}
      onClose={() => dismissNotification(latest.id)}
      duration={5000}
    />
  );
}
