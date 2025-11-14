import { Metadata } from 'next';
import { BlogList } from '@/components/blog/BlogList';

export const metadata: Metadata = {
  title: 'Blog | Fresh Pick',
  description: 'Read our latest articles, tips, and news about fresh produce and healthy living',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-xl text-green-50 max-w-2xl">
            Discover fresh ideas, healthy recipes, and tips for living well
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <BlogList />
      </div>
    </div>
  );
}
