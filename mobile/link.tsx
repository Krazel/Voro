import type { AnchorHTMLAttributes } from 'react';

// Keep the bundled galleries navigable without a web server or Next router.
export default function MobileLink({ href = '/', children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} href={href.startsWith('/') ? `#${href}` : href}>{children}</a>;
}
