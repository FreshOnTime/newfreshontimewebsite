import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, ArrowLeft, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  category?: string;
  tags: string[];
  publishedAt?: string;
  views: number;
  authorName?: string;
  author?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface BlogPostProps {
  blog: Blog;
}

export function BlogPost({ blog }: BlogPostProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <article className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              {blog.category && (
                <Badge variant="secondary" className="text-sm">
                  {blog.category}
                </Badge>
              )}
              {blog.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{blog.views} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8">
              {blog.excerpt}
            </p>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <Tag className="h-4 w-4 text-gray-500" />
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {blog.featuredImage?.url && (
              <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-8">
                <Image
                  src={blog.featuredImage.url}
                  alt={blog.featuredImage.alt || blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-600 hover:prose-a:text-green-700 prose-strong:text-gray-900 prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Enjoyed this article?</h2>
            <p className="text-xl text-green-50 mb-6">
              Discover more fresh ideas and tips on our blog
            </p>
            <Link href="/blog">
              <Button size="lg" variant="secondary">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
