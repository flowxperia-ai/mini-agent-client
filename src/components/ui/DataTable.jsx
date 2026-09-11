import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';
import { LoadingState } from './States.jsx';

/**
 * Lightweight responsive table.
 *   columns: [{ key, header, render?: (row) => node, className? }]
 */
export function DataTable({ columns, rows, loading, empty = 'Nothing here yet.', rowKey = (r) => r.id, className }) {
  if (loading && !rows) return <LoadingState compact />;
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('px-4 py-3 whitespace-nowrap first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows?.length ? (
            rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-slate-50/70">
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 align-middle text-slate-700 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6', c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500 sm:px-6">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
