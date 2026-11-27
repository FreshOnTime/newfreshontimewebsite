import { ImageResponse } from 'next/og';
import { wordmarkArtwork } from '@/components/brand/wordmark-artwork';

export const alt = 'FreshPick — Sri Lankan food and restaurant discovery';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', background: '#F8F7F2', color: '#2F6B45', padding: 64, fontFamily: 'sans-serif', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 28, fontWeight: 700 }}><svg width={236} height={79} viewBox={wordmarkArtwork.viewBox}>{wordmarkArtwork.paths.map(path => <path key={path.color} fill={path.color} d={path.d} />)}</svg><span>COLOMBO · SRI LANKA</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}><span>DISCOVER FOOD.</span><span>FIND YOUR NEXT FAVOURITE.</span></div>
    <div style={{ display: 'flex', borderTop: '3px solid #E6A23C', paddingTop: 28, fontSize: 30 }}>Restaurants, food brands and stories · freshpick.lk</div>
  </div>, size);
}
