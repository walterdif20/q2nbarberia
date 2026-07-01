import { useEffect, useMemo, useState } from 'react'

import { calculateSavings, formatMoney, formatPercent } from '../utils/packUtils'

const emptyForm = {
  cutsQuantity: 4,
  description: '',
  isActive: true,
  name: '',
  packPrice: 0,
  regularPrice: 0,
  validityDays: 60,
}

export function AdminPackTemplateForm({ editingPack, loading, onCancelEdit, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    setForm(editingPack || emptyForm)
  }, [editingPack])

  const savings = useMemo(
    () => calculateSavings(form.regularPrice, form.packPrice),
    [form.packPrice, form.regularPrice],
  )

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      ...form,
      savingsAmount: savings.savingsAmount,
      savingsPercentage: savings.savingsPercentage,
    })
    setForm(emptyForm)
  }

  return (
    <form className="admin-form app-card" onSubmit={handleSubmit}>
      <div className="card-title-row">
        <div>
          <span className="card-kicker">Pack comercial</span>
          <h3>{editingPack ? 'Editar pack' : 'Crear pack'}</h3>
        </div>
        {editingPack ? (
          <button className="button button-outline" type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        ) : null}
      </div>

      <div className="form-grid">
        <label>
          Nombre del pack
          <input
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
        </label>
        <label>
          Cantidad de cortes
          <input
            min="1"
            required
            type="number"
            value={form.cutsQuantity}
            onChange={(event) => updateField('cutsQuantity', event.target.value)}
          />
        </label>
        <label>
          Precio sin descuento
          <input
            min="0"
            required
            type="number"
            value={form.regularPrice}
            onChange={(event) => updateField('regularPrice', event.target.value)}
          />
        </label>
        <label>
          Precio con descuento
          <input
            min="0"
            required
            type="number"
            value={form.packPrice}
            onChange={(event) => updateField('packPrice', event.target.value)}
          />
        </label>
        <label>
          Validez en días
          <input
            min="1"
            required
            type="number"
            value={form.validityDays}
            onChange={(event) => updateField('validityDays', event.target.value)}
          />
        </label>
        <label className="checkbox-label">
          <input
            checked={Boolean(form.isActive)}
            type="checkbox"
            onChange={(event) => updateField('isActive', event.target.checked)}
          />
          Pack activo
        </label>
      </div>

      <label>
        Descripción
        <textarea
          rows="3"
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </label>

      <div className="savings-preview">
        <span>Ahorro calculado</span>
        <strong>{formatMoney(savings.savingsAmount)}</strong>
        <em>{formatPercent(savings.savingsPercentage)} de descuento</em>
      </div>

      <button className="button button-primary" disabled={loading} type="submit">
        {loading ? 'Guardando...' : 'Guardar pack'}
      </button>
    </form>
  )
}
