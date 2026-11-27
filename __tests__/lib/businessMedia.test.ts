import {businessMediaSource,readArticleCover} from '@/lib/businessMedia';
it('accepts existing upload paths and safe HTTPS URLs but rejects unsafe media',()=>{
 expect(businessMediaSource('/uploads/products/photo.webp')).toBe('/uploads/products/photo.webp');
 expect(businessMediaSource('https://example.org/cover.webp')).toBe('https://example.org/cover.webp');
 for(const bad of ['javascript:alert(1)','//evil.example/a','http://example.org/a','https://user:pass@example.org/a','/uploads/products/../private','/api/admin/users'])expect(businessMediaSource(bad)).toBeUndefined();
});
it('normalizes optional article cover records without inventing a stock image',()=>{
 expect(readArticleCover(null)).toBeUndefined();
 expect(readArticleCover({url:'javascript:alert(1)',alt:'Bad'})).toBeUndefined();
 expect(readArticleCover({url:'/images/editorial/market-crates.webp',alt:'  Fresh vegetables  '})).toEqual({url:'/images/editorial/market-crates.webp',alt:'Fresh vegetables'});
});
