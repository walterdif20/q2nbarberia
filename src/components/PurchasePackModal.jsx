import { X } from 'lucide-react'

import { formatMoney } from '../utils/packUtils'
import { PriceComparison } from './PriceComparison'

export function PurchasePackModal({ loading, onClose, onConfirm, pack, settings }) {
  if (!pack) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-labelledby="purchase-title" role="dialog" aria-modal="true">
        <button className="icon-button modal-close" type="button" aria-label="Cerrar" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
        <span className="card-kicker">Transferencia manual</span>
        <h2 id="purchase-title">{pack.name}</h2>
        <PriceComparison pack={pack} />

        <div className="payment-box">
          <span>Alias de transferencia</span>
          <strong>{settings.alias}</strong>
          <small>Monto exacto: {formatMoney(pack.packPrice)}</small>
        </div>

        <p>{settings.paymentInstructions}</p>

        <button className="button button-primary button-full" disabled={loading} type="button" onClick={onConfirm}>
          {loading ? 'Activando...' : 'Ya realicé la transferencia'}
        </button>
      </section>
    </div>
  )
}
