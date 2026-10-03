import { AccountPage } from '@/components/account/AccountPage';
import MessageList from '@/components/supplier/MessageList';

export default function MessagesPage() {
  return <AccountPage title="Messages" description="Updates from the FreshPick team about your account and deliveries."><MessageList /></AccountPage>;
}
