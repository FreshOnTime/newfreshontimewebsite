import { AccountPage } from '@/components/account/AccountPage';
import { NotificationCenter } from '@/components/NotificationCenter';
export default function NotificationsPage() {
  return <AccountPage title="Notifications" description="FreshPick updates and announcements, with read status saved to your account."><NotificationCenter /></AccountPage>;
}
