'use client';

import { useRef, useState } from 'react';
import {
  Bold,
  Eye,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered,
  Loader2,
  Pencil,
  Quote,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { uploadBlogImage } from '@/components/admin/blogs/blogImageClient';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MarkdownEditor({ value, onChange, disabled = false }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const replaceSelection = (before: string, after = '', placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${before}${placeholder}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  };

  const prefixLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return replaceSelection(prefix, '', 'List item');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || 'List item';
    const transformed = selected
      .split('\n')
      .map((line, index) => prefix === '1. ' ? `${index + 1}. ${line}` : `${prefix}${line}`)
      .join('\n');
    onChange(`${value.slice(0, start)}${transformed}${value.slice(end)}`);
  };

  const handleImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(file);
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Blog image';
      replaceSelection(`![${alt}](`, ')', url);
      toast.success('Image uploaded and inserted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  if (disabled) {
    return (
      <div className="rounded-md border bg-background p-5">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => replaceSelection('## ', '', 'Heading')}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => replaceSelection('**', '**', 'bold text')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => replaceSelection('*', '*', 'italic text')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => prefixLines('- ')}>
          <ListIcon className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => prefixLines('1. ')}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => prefixLines('> ')}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => replaceSelection('[', '](https://)', 'link text')}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          <span className="ml-1.5 hidden sm:inline">Image</span>
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => handleImage(event.target.files?.[0])}
        />
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" size="sm" variant={!preview ? 'secondary' : 'ghost'} onClick={() => setPreview(false)}>
            <Pencil className="h-4 w-4 mr-1" /> Write
          </Button>
          <Button type="button" size="sm" variant={preview ? 'secondary' : 'ghost'} onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4 mr-1" /> Preview
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="min-h-[320px] p-6">
          <div className="prose prose-sm md:prose-base max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*Start writing to preview your article.*'}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Start writing your story..."
          required
          rows={18}
          className="min-h-[360px] resize-y rounded-none border-0 font-sans text-base leading-7 focus-visible:ring-0"
        />
      )}
    </div>
  );
}
