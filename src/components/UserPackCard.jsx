import { CalendarCheck, Clock3, Scissors } from 'lucide-react'

import { formatDate, getEffectiveOperationalStatus } from '../utils/packUtils'
import { StatusBadge } from './StatusBadge'

const userStatusMap = {
  active: 'active',
  consumed: 'consumed',
  disabled: 'disabled',
  expired: 'expired',
}

export function UserPackCard({ pack, onRequestVisit }) {
  const effectiveStatus = getEffectiveOperationalStatus(pack)
  const canRequestVisit = effectiveStatus === 'active'

  return (
    <article className="app-card user-pack-card">
      <div className="card-title-row">
        <div>
          <span className="card-kicker">Mi pack</span>
          <h3>{pack.packName}</h3>
        </div>
        <StatusBadge status={userStatusMap[effectiveStatus] || 'disabled'} />
      </div>

      <div className="metric-grid">
        <div>
          <Scissors size={18} aria-hidden="true" />
          <strong>{pack.remainingCuts}</strong>
          <span>cortes restantes</span>
        </div>
        <div>
          <CalendarCheck size={18} aria-hidden="true" />
          <strong>{pack.initialCuts}</strong>
          <span>cortes iniciales</span>
        </div>
        <div>
          <Clock3 size={18} aria-hidden="true" />
          <strong>{formatDate(pack.expiresAt)}</strong>
          <span>vencimiento</span>
        </div>
      </div>

      <button
        className="button button-outline button-full"
        disabled={!canRequestVisit}
        type="button"
        onClick={() => onRequestVisit(pack)}
      >
        Avisar próxima visita
      </button>
    </article>
  )
}
