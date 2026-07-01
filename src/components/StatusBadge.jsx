const statusLabels = {
  active: 'Pack activo',
  approved: 'Pago aprobado',
  cancelled: 'Visita cancelada',
  confirmed: 'Visita confirmada',
  consumed: 'Pack consumido',
  disabled: 'Pack dado de baja',
  expired: 'Pack vencido',
  pending: 'Visita informada',
  rejected: 'Pago rechazado',
  unavailable: 'No disponible',
}

export function StatusBadge({ label, status, tone }) {
  const normalizedTone = tone || status

  return (
    <span className={`status-badge status-${normalizedTone}`}>
      {label || statusLabels[status] || status}
    </span>
  )
}
