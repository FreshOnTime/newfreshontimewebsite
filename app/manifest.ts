import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreshPick — Discover the world of food',
    short_name: 'FreshPick',
    description: 'Discover restaurants, local producers, food events and stories, starting in Sri Lanka.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F7F2',
    theme_color: '#9b3921',
    orientation: 'portrait-primary',
    categories: ['food', 'lifestyle', 'travel'],
    icons: [72, 96, 128, 144, 152, 192, 384, 512].map(size => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any',
    })),
    shortcuts: [
      { name: 'Discover food', short_name: 'Discover', url: '/discover' },
      { name: 'Food events', short_name: 'Events', url: '/experiences' },
      { name: 'Food stories', short_name: 'Stories', url: '/stories' },
      { name: 'Saved picks', short_name: 'Saved', url: '/saved' },
    ].map(shortcut => ({ ...shortcut, icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] })),
  };
}
