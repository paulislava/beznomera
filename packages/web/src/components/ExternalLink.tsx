import Link from 'next/link';
import React from 'react';

export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }
) {
  return <Link {...props} href={props.href} />;
}
