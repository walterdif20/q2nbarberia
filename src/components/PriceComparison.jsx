import { formatMoney, formatPercent } from '../utils/packUtils'

export function PriceComparison({ pack }) {
  return (
    <div className="price-comparison">
      <span className="regular-price">{formatMoney(pack.regularPrice)}</span>
      <strong>{formatMoney(pack.packPrice)}</strong>
      <div className="savings-row">
        <span>Ahorrás {formatMoney(pack.savingsAmount)}</span>
        <span>{formatPercent(pack.savingsPercentage)} de descuento</span>
      </div>
    </div>
  )
}
