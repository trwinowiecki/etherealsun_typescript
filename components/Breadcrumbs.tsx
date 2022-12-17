/* eslint-disable jsx-a11y/anchor-is-valid */
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Fragment } from 'react';

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
    <div className="flex items-center gap-1">
      {pages.map((page, i, { length }) =>
        length - 1 === i ? (
          <span
            key={page.name}
            className={`${page.active ? '' : 'font-semibold'} capitalize`}
          >
            {page.name}
          </span>
        ) : (
          <Fragment key={page.name}>
            <Link key={page.name} href={page.href}>
              <a className={`${page.active ? '' : 'font-semibold'} capitalize`}>
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
