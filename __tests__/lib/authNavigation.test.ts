import { accountDestination, accountLink, safeAccountRedirect } from '@/lib/authNavigation';

it.each(['//outside.example', '/\\outside.example', '/%5Coutside.example', '/%2f%2foutside.example', 'https://outside.example', 'javascript:alert(1)', '/\n/outside.example', '/auth/login', '/auth/signup', '/bad%encoding'])('rejects unsafe or looping account destination: %s', path => {
  expect(safeAccountRedirect(path)).toBeNull();
  expect(accountDestination('customer', path)).toBe('/dashboard');
});
it('keeps a local checkout intent across account links and returns admins to their workspace', () => {
  const path = '/checkout?bagId=weekly&plan=market#delivery';
  expect(safeAccountRedirect(path)).toBe(path);
  expect(accountDestination('customer', path)).toBe(path);
  expect(accountDestination('admin', path)).toBe('/admin');
  expect(accountLink('/auth/signup/customer', path)).toBe(`/auth/signup/customer?redirect=${encodeURIComponent(path)}`);
  expect(accountLink('/auth/login', '//outside.example')).toBe('/auth/login');
});
