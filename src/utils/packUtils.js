export const moneyFormatter = new Intl.NumberFormat('es-AR', {
  currency: 'ARS',
  maximumFractionDigits: 0,
  style: 'currency',
})

export const percentFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export function calculateSavings(regularPrice = 0, packPrice = 0) {
  const savingsAmount = Math.max(Number(regularPrice) - Number(packPrice), 0)
  const savingsPercentage = Number(regularPrice) > 0
    ? (savingsAmount / Number(regularPrice)) * 100
    : 0

  return {
    savingsAmount,
    savingsPercentage,
  }
}

export function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0))
}

export function formatPercent(value) {
  return `${percentFormatter.format(Number(value || 0))}%`
}

export function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  return new Date(value)
}

export function formatDate(value) {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + Number(days || 0))
  return result
}

export function isExpired(userPack, now = new Date()) {
  const expiresAt = toDate(userPack?.expiresAt)
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime())
}

export function getEffectiveOperationalStatus(userPack, now = new Date()) {
  if (!userPack) return 'disabled'
  if (userPack.operationalStatus === 'disabled') return 'disabled'
  if (userPack.operationalStatus === 'consumed') return 'consumed'
  if (userPack.internalPaymentStatus === 'rejected') return 'disabled'
  if (isExpired(userPack, now)) return 'expired'
  if (Number(userPack.remainingCuts || 0) <= 0) return 'consumed'
  return userPack.operationalStatus || 'active'
}

export function isUsablePack(userPack, now = new Date()) {
  return getEffectiveOperationalStatus(userPack, now) === 'active'
}

export function mapFirebaseError(error) {
  const code = error?.code || ''

  if (code.includes('auth/popup-closed-by-user')) return 'Cerraste la ventana de Google antes de terminar.'
  if (code.includes('auth/popup-blocked')) return 'El navegador bloqueo la ventana de Google.'
  if (code.includes('auth/unauthorized-domain')) return 'Este dominio no esta autorizado en Firebase Auth. Agregalo en Authentication > Settings > Authorized domains.'
  if (code.includes('auth/operation-not-allowed')) return 'El acceso con Google no esta habilitado en Firebase Auth. Activarlo en Authentication > Sign-in method > Google.'
  if (code.includes('auth/account-exists-with-different-credential')) return 'Ese email ya esta asociado a otro metodo de acceso.'

  if (code.includes('auth/invalid-credential')) return 'No se pudo validar la cuenta de Google.'
  if (code.includes('auth/email-already-in-use')) return 'Ese email ya esta registrado.'
  if (code.includes('auth/network-request-failed')) return 'No se pudo conectar con Firebase.'
  if (code.includes('permission-denied')) return 'No tenés permisos para realizar esta acción.'

  return error?.message || 'Ocurrió un error inesperado.'
}
