import { StatusBadge } from './StatusBadge'

export function AdminVisitTable({ onCancel, onConfirm, visits }) {
  if (!visits.length) {
    return <div className="empty-state">No hay visitas informadas.</div>
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Pack</th>
            <th>Día</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td>
                <strong>{visit.userName}</strong>
                <small>{visit.userEmail}</small>
              </td>
              <td>{visit.packName}</td>
              <td>{visit.requestedDate}</td>
              <td>{visit.requestedTime}</td>
              <td><StatusBadge status={visit.status} /></td>
              <td>
                {visit.status === 'pending' ? (
                  <div className="row-actions">
                    <button type="button" onClick={() => onConfirm(visit)}>Confirmar</button>
                    <button type="button" onClick={() => onCancel(visit)}>Cancelar</button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
