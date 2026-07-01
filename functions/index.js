import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'

initializeApp()

const db = getFirestore()

async function assertAdmin(uid) {
  if (!uid) throw new HttpsError('unauthenticated', 'Se requiere iniciar sesión.')
  const user = await db.collection('users').doc(uid).get()
  if (!user.exists || user.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'Se requiere rol admin.')
  }
}

export const scheduledExpireUserPacks = onSchedule(
  {
    region: 'southamerica-east1',
    schedule: 'every day 03:00',
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  async () => {
    const now = new Date()
    const snapshot = await db
      .collection('userPacks')
      .where('operationalStatus', '==', 'active')
      .where('expiresAt', '<=', now)
      .get()

    const batch = db.batch()

    snapshot.docs.forEach((packDoc) => {
      const pack = packDoc.data()
      batch.update(packDoc.ref, {
        operationalStatus: 'expired',
        updatedAt: FieldValue.serverTimestamp(),
      })
      batch.create(db.collection('packUsageLogs').doc(), {
        action: 'pack_expired',
        createdAt: FieldValue.serverTimestamp(),
        createdBy: 'scheduledExpireUserPacks',
        newRemainingCuts: pack.remainingCuts ?? null,
        previousRemainingCuts: pack.remainingCuts ?? null,
        userId: pack.userId,
        userPackId: packDoc.id,
        visitRequestId: null,
      })
    })

    await batch.commit()
    return { expired: snapshot.size }
  },
)

export const confirmVisit = onCall({ region: 'southamerica-east1' }, async (request) => {
  await assertAdmin(request.auth?.uid)

  const { visitRequestId } = request.data || {}
  if (!visitRequestId) {
    throw new HttpsError('invalid-argument', 'Falta visitRequestId.')
  }

  await db.runTransaction(async (transaction) => {
    const visitRef = db.collection('visitRequests').doc(visitRequestId)
    const visitSnapshot = await transaction.get(visitRef)

    if (!visitSnapshot.exists) throw new HttpsError('not-found', 'La visita no existe.')

    const visit = visitSnapshot.data()
    if (visit.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'La visita ya fue gestionada.')
    }

    const packRef = db.collection('userPacks').doc(visit.userPackId)
    const packSnapshot = await transaction.get(packRef)
    if (!packSnapshot.exists) throw new HttpsError('not-found', 'El pack no existe.')

    const pack = packSnapshot.data()
    const expiresAt = pack.expiresAt?.toDate?.() || new Date(pack.expiresAt)
    const remainingCuts = Number(pack.remainingCuts || 0)

    if (
      pack.operationalStatus !== 'active'
      || pack.internalPaymentStatus === 'rejected'
      || remainingCuts <= 0
      || expiresAt <= new Date()
    ) {
      throw new HttpsError('failed-precondition', 'El pack no puede usarse.')
    }

    const newRemainingCuts = remainingCuts - 1
    const nextStatus = newRemainingCuts === 0 ? 'consumed' : 'active'
    const now = FieldValue.serverTimestamp()

    transaction.update(packRef, {
      operationalStatus: nextStatus,
      remainingCuts: newRemainingCuts,
      updatedAt: now,
    })
    transaction.update(visitRef, {
      confirmedAt: now,
      confirmedBy: request.auth.uid,
      status: 'confirmed',
      updatedAt: now,
    })
    transaction.create(db.collection('packUsageLogs').doc(), {
      action: 'cut_confirmed',
      createdAt: now,
      createdBy: request.auth.uid,
      newRemainingCuts,
      previousRemainingCuts: remainingCuts,
      userId: pack.userId,
      userPackId: packRef.id,
      visitRequestId,
    })
  })

  return { ok: true }
})
