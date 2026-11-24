import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreshPick — Sri Lankan food makers',
    short_name: 'FreshPick',
    description: 'Find local makers, items, batches and food stories across Sri Lanka.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F7F2',
    theme_color: '#9b3921',
    orientation: 'portrait-primary',
    categories: ['food', 'shopping', 'lifestyle'],
    icons: [72, 96, 128, 144, 152, 192, 384, 512].map(size => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any',
    })),
    shortcuts: [
      { name: 'Explore makers', short_name: 'Makers', url: '/makers' },
      { name: 'Food stories', short_name: 'Stories', url: '/stories' },
      { name: 'Saved picks', short_name: 'Saved', url: '/saved' },
    ].map(shortcut => ({ ...shortcut, icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] })),
  };
}
