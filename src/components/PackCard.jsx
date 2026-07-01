import { CalendarDays, Scissors } from 'lucide-react'

import { PriceComparison } from './PriceComparison'

export function PackCard({ pack, onBuy }) {
  return (
    <article className="app-card pack-card">
      <div className="card-topline">
        <span>
          <Scissors size={17} strokeWidth={2.4} aria-hidden="true" />
          {pack.cutsQuantity} cortes
        </span>
        <span>
          <CalendarDays size={17} strokeWidth={2.4} aria-hidden="true" />
          {pack.validityDays} días
        </span>
      </div>
      <h3>{pack.name}</h3>
      {pack.description ? <p>{pack.description}</p> : null}
      <PriceComparison pack={pack} />
      <button className="button button-primary button-full" type="button" onClick={() => onBuy(pack)}>
        Comprar pack
      </button>
    </article>
  )
}
