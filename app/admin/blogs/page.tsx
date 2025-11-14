import { Metadata } from 'next';
import { BlogsPage } from '@/components/admin/blogs/BlogsPage';

export const metadata: Metadata = {
  title: 'Blogs | Admin Dashboard',
  description: 'Manage blog posts in the admin dashboard',
};

export default function Blogs() {
  return <BlogsPage />;
}
