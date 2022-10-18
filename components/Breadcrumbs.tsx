import Link from 'next/link';

export type BreadcrumbPage = {
  href: string;
  name: string;
  active?: boolean;
};

interface BreadcrumbProps {
  pages: BreadcrumbPage[];
}

function Breadcrumbs({ pages }: BreadcrumbProps) {
  return (
    <div className="flex gap-1">
      {pages.map((page, i, { length }) =>
        length - 1 === i ? (
          <span
            key={page.name}
            className={`${page.active ? '' : 'font-semibold'} capitalize`}
          >
            {page.name}
          </span>
        ) : (
          <>
            <Link href={page.href} key={page.name}>
              <a className={`${page.active ? '' : 'font-semibold'} capitalize`}>
                {page.name}
              </a>
            </Link>
            <span key={`${page.name}+/`}>/</span>
          </>
        )
      )}
    </div>
  );
}

export default Breadcrumbs;
