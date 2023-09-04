/* eslint-disable jsx-a11y/anchor-is-valid */
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Fragment } from 'react';
import { cn } from '../utils/tw-utils';

export interface BreadcrumbPage {
  href: string;
  name: string;
  active?: boolean;
}

interface BreadcrumbProps {
  pages: BreadcrumbPage[];
}

function Breadcrumbs({ pages }: BreadcrumbProps) {
  return (
    <div className="items-center hidden gap-1 md:flex">
      {pages.map((page, i, { length }) =>
        length - 1 === i ? (
          <span
            key={page.name}
            className={cn('capitalize', { 'font-semibold': page.active })}
          >
            {page.name}
          </span>
        ) : (
          <Fragment key={page.name}>
            <Link key={page.name} href={page.href}>
              <a className={cn('capitalize', { 'font-semibold': page.active })}>
                {page.name}
              </a>
            </Link>
            <ChevronRightIcon className="h-5" />
          </Fragment>
        )
      )}
    </div>
  );
}

export default Breadcrumbs;
