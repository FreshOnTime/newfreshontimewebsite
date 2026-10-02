import AdminLayout from '@/components/admin/AdminLayout';
import { privateMetadata } from '@/lib/seo';
export const metadata = privateMetadata;
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminLayout>{children}</AdminLayout>; }
