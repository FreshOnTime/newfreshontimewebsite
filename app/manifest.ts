import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreshPick — Experiences in Colombo',
    short_name: 'FreshPick',
    description: 'Discover food, gifts and experiences in Colombo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F7F2',
    theme_color: '#2F6B45',
    orientation: 'portrait-primary',
    categories: ['food', 'shopping', 'lifestyle'],
    icons: [72, 96, 128, 144, 152, 192, 384, 512].map(size => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any',
    })),
    shortcuts: [
      { name: 'Shop products', short_name: 'Products', url: '/products' },
      { name: 'Explore experiences', short_name: 'Experiences', url: '/experiences' },
      { name: 'My orders', short_name: 'Orders', url: '/orders' },
    ].map(shortcut => ({ ...shortcut, icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] })),
  };
}
