import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db, isFirebaseConfigured } from '../firebase'
import { getEffectiveOperationalStatus } from '../utils/packUtils'

function visitRequestsCollection() {
  return collection(db, 'visitRequests')
}

function usageLogsCollection() {
  return collection(db, 'packUsageLogs')
}

function toMillis(value) {
  return value?.toMillis?.() || value?.seconds * 1000 || 0
}

function sortNewestFirst(items) {
  return [...items].sort((first, second) => toMillis(second.createdAt) - toMillis(first.createdAt))
}

export function listenUserVisits(userId, callback) {
  if (!isFirebaseConfigured || !db || !userId) {
    callback([])
    return () => {}
  }

  const q = query(
    visitRequestsCollection(),
    where('userId', '==', userId),
  )

  return onSnapshot(q, (snapshot) => {
    callback(sortNewestFirst(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
  })
}

export function listenAllVisits(callback) {
  if (!isFirebaseConfigured || !db) {
    callback([])
    return () => {}
  }

  const q = query(visitRequestsCollection())
  return onSnapshot(q, (snapshot) => {
    callback(sortNewestFirst(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
  })
}

export async function createVisitRequest({ user, userPack, requestedDate, requestedTime }) {
  await addDoc(visitRequestsCollection(), {
    cancelledAt: null,
    cancelledBy: null,
    confirmedAt: null,
    confirmedBy: null,
    createdAt: serverTimestamp(),
    packName: userPack.packName,
    requestedDate,
    requestedTime,
    status: 'pending',
    updatedAt: serverTimestamp(),
    userEmail: user.email,
    userId: user.uid,
    userName: user.displayName || user.email,
    userPackId: userPack.id,
  })
}

export async function confirmVisit(visitRequestId, adminUser) {
  await runTransaction(db, async (transaction) => {
    const visitRef = doc(db, 'visitRequests', visitRequestId)
    const visitSnapshot = await transaction.get(visitRef)

    if (!visitSnapshot.exists()) {
      throw new Error('La visita no existe.')
    }

    const visit = { id: visitSnapshot.id, ...visitSnapshot.data() }

    if (visit.status !== 'pending') {
      throw new Error('La visita ya fue gestionada.')
    }

    const packRef = doc(db, 'userPacks', visit.userPackId)
    const packSnapshot = await transaction.get(packRef)

    if (!packSnapshot.exists()) {
      throw new Error('El pack asociado no existe.')
    }

    const userPack = { id: packSnapshot.id, ...packSnapshot.data() }
    const effectiveStatus = getEffectiveOperationalStatus(userPack)
    const previousRemainingCuts = Number(userPack.remainingCuts || 0)

    if (effectiveStatus !== 'active') {
      throw new Error('No se puede usar un pack vencido, consumido o dado de baja.')
    }

    if (previousRemainingCuts <= 0) {
      throw new Error('El pack no tiene cortes disponibles.')
    }

    const newRemainingCuts = previousRemainingCuts - 1
    const nextOperationalStatus = newRemainingCuts === 0 ? 'consumed' : 'active'
    const now = serverTimestamp()

    transaction.update(packRef, {
      operationalStatus: nextOperationalStatus,
      remainingCuts: newRemainingCuts,
      updatedAt: now,
    })

    transaction.update(visitRef, {
      confirmedAt: now,
      confirmedBy: adminUser.uid,
      status: 'confirmed',
      updatedAt: now,
    })

    transaction.set(doc(usageLogsCollection()), {
      action: 'cut_confirmed',
      createdAt: now,
      createdBy: adminUser.uid,
      newRemainingCuts,
      previousRemainingCuts,
      userId: userPack.userId,
      userPackId: userPack.id,
      visitRequestId,
    })

    if (newRemainingCuts === 0) {
      transaction.set(doc(usageLogsCollection()), {
        action: 'pack_consumed',
        createdAt: now,
        createdBy: adminUser.uid,
        newRemainingCuts,
        previousRemainingCuts: newRemainingCuts,
        userId: userPack.userId,
        userPackId: userPack.id,
        visitRequestId,
      })
    }
  })
}

export async function cancelVisit(visitRequestId, adminUser) {
  await updateDoc(doc(db, 'visitRequests', visitRequestId), {
    cancelledAt: serverTimestamp(),
    cancelledBy: adminUser.uid,
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  })
}
