// Pagination compacte réutilisable (tables admin)
export default function Pager({ page, pages, total, onPage, label }) {
  if (total === 0) return null
  return (
    <div className="pager">
      <span className="pager-info">{total} {label}{pages > 1 ? ` · page ${page}/${pages}` : ''}</span>
      {pages > 1 && (
        <div className="pager-btns">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Préc.</button>
          <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Suiv. ›</button>
        </div>
      )}
    </div>
  )
}
