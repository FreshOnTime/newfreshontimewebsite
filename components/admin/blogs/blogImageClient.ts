'use client';

export async function uploadBlogImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);

  const response = await fetch('/api/upload/images/blogs', {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to upload blog image');
  }

  const url = payload?.data?.url;
  if (typeof url !== 'string' || !url) {
    throw new Error('Blog image upload did not return a valid URL');
  }
  return url;
}
