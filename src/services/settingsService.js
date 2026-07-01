import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db, isFirebaseConfigured } from '../firebase'

export const DEFAULT_SETTINGS = {
  alias: 'q2nbarberia',
  businessName: 'Q2N Barber Shop',
  paymentInstructions:
    'Transferí el monto exacto al alias indicado. Después tocá “Ya realicé la transferencia” para activar tu pack.',
}

function settingsRef() {
  return doc(db, 'barberSettings', 'main')
}

export function listenSettings(callback) {
  if (!isFirebaseConfigured || !db) {
    callback(DEFAULT_SETTINGS)
    return () => {}
  }

  return onSnapshot(settingsRef(), (snapshot) => {
    callback(snapshot.exists() ? { ...DEFAULT_SETTINGS, ...snapshot.data() } : DEFAULT_SETTINGS)
  })
}

export async function getSettings() {
  if (!isFirebaseConfigured || !db) return DEFAULT_SETTINGS
  const snapshot = await getDoc(settingsRef())
  return snapshot.exists() ? { ...DEFAULT_SETTINGS, ...snapshot.data() } : DEFAULT_SETTINGS
}

export async function saveSettings(data) {
  await setDoc(
    settingsRef(),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
