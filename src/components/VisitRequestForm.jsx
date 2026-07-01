import { useState } from 'react'
import { X } from 'lucide-react'

export function VisitRequestForm({ loading, onClose, onSubmit, pack }) {
  const [requestedDate, setRequestedDate] = useState('')
  const [requestedTime, setRequestedTime] = useState('')

  if (!pack) return null

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ requestedDate, requestedTime })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-labelledby="visit-title" role="dialog" aria-modal="true">
        <button className="icon-button modal-close" type="button" aria-label="Cerrar" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
        <span className="card-kicker">Próxima visita</span>
        <h2 id="visit-title">Avisar visita con {pack.packName}</h2>
        <p>Esto solo informa tu intención de visita. El corte se descuenta cuando la barbería confirma la atención.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Día estimado
            <input
              required
              type="date"
              value={requestedDate}
              onChange={(event) => setRequestedDate(event.target.value)}
            />
          </label>
          <label>
            Hora estimada
            <input
              required
              type="time"
              value={requestedTime}
              onChange={(event) => setRequestedTime(event.target.value)}
            />
          </label>
          <button className="button button-primary button-full" disabled={loading} type="submit">
            {loading ? 'Enviando...' : 'Avisar visita'}
          </button>
        </form>
      </section>
    </div>
  )
}
