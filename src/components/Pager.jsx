// Pagination compacte réutilisable (tables admin).
// Toujours visible dès qu'il y a au moins un élément ; les boutons se
// désactivent quand il n'y a qu'une seule page.
export default function Pager({ page, pages, total, onPage, label }) {
  if (total === 0) return null
  return (
    <div className="pager">
      <span className="pager-info">{total} {label} · page {page}/{pages}</span>
      <div className="pager-btns">
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Préc.</button>
        <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Suiv. ›</button>
      </div>
    </div>
  )
}
