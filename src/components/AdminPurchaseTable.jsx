import { formatDate, formatMoney, getEffectiveOperationalStatus } from '../utils/packUtils'
import { StatusBadge } from './StatusBadge'

const paymentStatusLabels = {
  approved: 'Pago aprobado',
  pending: 'Pendiente de revisión',
  rejected: 'Pago rechazado',
}

export function AdminPurchaseTable({
  onApprove,
  onDisable,
  onReactivate,
  onReject,
  purchases,
}) {
  if (!purchases.length) {
    return <div className="empty-state">No hay compras para mostrar.</div>
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Pack</th>
            <th>Pago</th>
            <th>Estado</th>
            <th>Cortes</th>
            <th>Vence</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => {
            const effectiveStatus = getEffectiveOperationalStatus(purchase)

            return (
              <tr key={purchase.id}>
                <td>
                  <strong>{purchase.userName}</strong>
                  <small>{purchase.userEmail}</small>
                </td>
                <td>
                  <strong>{purchase.packName}</strong>
                  <small>{formatMoney(purchase.packPrice)}</small>
                </td>
                <td>
                  <StatusBadge
                    label={paymentStatusLabels[purchase.internalPaymentStatus]}
                    status={purchase.internalPaymentStatus}
                  />
                </td>
                <td>
                  <StatusBadge status={effectiveStatus} />
                </td>
                <td>{purchase.remainingCuts} / {purchase.initialCuts}</td>
                <td>{formatDate(purchase.expiresAt)}</td>
                <td>
                  <div className="row-actions">
                    {purchase.internalPaymentStatus === 'pending' ? (
                      <>
                        <button type="button" onClick={() => onApprove(purchase)}>Aprobar</button>
                        <button type="button" onClick={() => onReject(purchase)}>Rechazar</button>
                      </>
                    ) : null}
                    {purchase.operationalStatus !== 'disabled' ? (
                      <button type="button" onClick={() => onDisable(purchase)}>Dar de baja</button>
                    ) : (
                      <button type="button" onClick={() => onReactivate(purchase)}>Reactivar</button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
