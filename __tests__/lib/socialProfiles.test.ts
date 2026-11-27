import {socialProfileUrl,SOCIAL_LABELS} from '@/lib/socialProfiles';
it('accepts official platform profile URL formats and rejects missing or unsafe links',()=>{
 expect(Object.keys(SOCIAL_LABELS)).toHaveLength(5);
 expect(socialProfileUrl('instagram','https://www.instagram.com/example/')).toBe('https://www.instagram.com/example/');
 expect(socialProfileUrl('facebook','https://www.facebook.com/example')).not.toBe('');
 expect(socialProfileUrl('x','https://twitter.com/example')).not.toBe('');
 expect(socialProfileUrl('linkedin','https://www.linkedin.com/company/example/')).not.toBe('');
 expect(socialProfileUrl('bluesky','https://bsky.app/profile/example.bsky.social')).not.toBe('');
 for(const url of ['',undefined,'http://x.com/example','https://x.com.evil.test/example','https://x.com@evil.test/example','https://x.com/','javascript:alert(1)'])expect(socialProfileUrl('x',url)).toBe('');
 expect(socialProfileUrl('bluesky','https://bsky.app/')).toBe('');
});
