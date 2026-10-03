import { ImageResponse } from 'next/og';

export const alt = 'FreshPick — fresh groceries and local food in Colombo, Sri Lanka';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', background: '#F8F7F2', color: '#2F6B45', padding: 64, fontFamily: 'sans-serif', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 700 }}><span>FRESHPICK</span><span>COLOMBO · SRI LANKA</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 104, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}><span>FRESH FOOD.</span><span>FULL OF LIFE.</span></div>
    <div style={{ display: 'flex', borderTop: '3px solid #E6A23C', paddingTop: 28, fontSize: 30 }}>Groceries, bakery and local food · freshpick.lk</div>
  </div>, size);
}
