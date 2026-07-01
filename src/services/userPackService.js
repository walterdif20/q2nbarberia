import {
  Timestamp,
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
import { addDays, getEffectiveOperationalStatus } from '../utils/packUtils'
import { getSettings } from './settingsService'

function userPacksCollection() {
  return collection(db, 'userPacks')
}

function logsCollection() {
  return collection(db, 'packUsageLogs')
}

function toMillis(value) {
  return value?.toMillis?.() || value?.seconds * 1000 || 0
}

function sortNewestFirst(items) {
  return [...items].sort((first, second) => toMillis(second.createdAt) - toMillis(first.createdAt))
}

function withEffectiveStatus(pack) {
  return {
    ...pack,
    effectiveStatus: getEffectiveOperationalStatus(pack),
  }
}

export function listenUserPacks(userId, callback) {
  if (!isFirebaseConfigured || !db || !userId) {
    callback([])
    return () => {}
  }

  const q = query(
    userPacksCollection(),
    where('userId', '==', userId),
  )

  return onSnapshot(q, (snapshot) => {
    callback(sortNewestFirst(snapshot.docs.map((item) => withEffectiveStatus({ id: item.id, ...item.data() }))))
  })
}

export function listenAllUserPacks(callback) {
  if (!isFirebaseConfigured || !db) {
    callback([])
    return () => {}
  }

  const q = query(userPacksCollection())
  return onSnapshot(q, (snapshot) => {
    callback(sortNewestFirst(snapshot.docs.map((item) => withEffectiveStatus({ id: item.id, ...item.data() }))))
  })
}

export async function purchasePack({ packTemplate, user }) {
  const settings = await getSettings()
  const now = new Date()
  const expiresAt = addDays(now, packTemplate.validityDays)

  const payload = {
    approvedAt: null,
    approvedBy: null,
    createdAt: serverTimestamp(),
    disabledAt: null,
    disabledBy: null,
    disabledReason: null,
    expiresAt: Timestamp.fromDate(expiresAt),
    initialCuts: Number(packTemplate.cutsQuantity || 0),
    internalPaymentStatus: 'pending',
    operationalStatus: 'active',
    packName: packTemplate.name,
    packPrice: Number(packTemplate.packPrice || 0),
    packTemplateId: packTemplate.id,
    paymentAlias: settings.alias,
    purchasedAt: serverTimestamp(),
    rejectedAt: null,
    rejectedBy: null,
    rejectedReason: null,
    remainingCuts: Number(packTemplate.cutsQuantity || 0),
    regularPrice: Number(packTemplate.regularPrice || 0),
    savingsAmount: Number(packTemplate.savingsAmount || 0),
    savingsPercentage: Number(packTemplate.savingsPercentage || 0),
    updatedAt: serverTimestamp(),
    userEmail: user.email,
    userId: user.uid,
    userName: user.displayName || user.email,
    validityDays: Number(packTemplate.validityDays || 0),
  }

  const created = await addDoc(userPacksCollection(), payload)

  await addDoc(logsCollection(), {
    action: 'pack_created',
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    newRemainingCuts: payload.remainingCuts,
    previousRemainingCuts: null,
    userId: user.uid,
    userPackId: created.id,
    visitRequestId: null,
  })

  await addDoc(logsCollection(), {
    action: 'payment_marked_by_user',
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    newRemainingCuts: payload.remainingCuts,
    previousRemainingCuts: payload.remainingCuts,
    userId: user.uid,
    userPackId: created.id,
    visitRequestId: null,
  })

  return created.id
}

export async function approvePayment(userPackId, adminUser) {
  await updateDoc(doc(db, 'userPacks', userPackId), {
    approvedAt: serverTimestamp(),
    approvedBy: adminUser.uid,
    internalPaymentStatus: 'approved',
    updatedAt: serverTimestamp(),
  })
  await addAdminLog(userPackId, adminUser, 'payment_approved')
}

export async function rejectPayment(userPackId, adminUser, rejectedReason = '') {
  await updateDoc(doc(db, 'userPacks', userPackId), {
    internalPaymentStatus: 'rejected',
    operationalStatus: 'disabled',
    rejectedAt: serverTimestamp(),
    rejectedBy: adminUser.uid,
    rejectedReason,
    updatedAt: serverTimestamp(),
  })
  await addAdminLog(userPackId, adminUser, 'payment_rejected')
}

export async function disableUserPack(userPackId, adminUser, disabledReason = '') {
  await updateDoc(doc(db, 'userPacks', userPackId), {
    disabledAt: serverTimestamp(),
    disabledBy: adminUser.uid,
    disabledReason,
    operationalStatus: 'disabled',
    updatedAt: serverTimestamp(),
  })
  await addAdminLog(userPackId, adminUser, 'pack_disabled')
}

export async function reactivateUserPack(userPackId) {
  await updateDoc(doc(db, 'userPacks', userPackId), {
    disabledAt: null,
    disabledBy: null,
    disabledReason: null,
    operationalStatus: 'active',
    updatedAt: serverTimestamp(),
  })
}

async function addAdminLog(userPackId, adminUser, action) {
  await addDoc(logsCollection(), {
    action,
    createdAt: serverTimestamp(),
    createdBy: adminUser.uid,
    newRemainingCuts: null,
    previousRemainingCuts: null,
    userId: null,
    userPackId,
    visitRequestId: null,
  })
}

export async function markExpiredIfNeeded(userPackId, userPack, createdBy = 'client') {
  if (getEffectiveOperationalStatus(userPack) !== 'expired') return false

  await runTransaction(db, async (transaction) => {
    const packRef = doc(db, 'userPacks', userPackId)
    const logRef = doc(logsCollection())
    transaction.update(packRef, {
      operationalStatus: 'expired',
      updatedAt: serverTimestamp(),
    })
    transaction.set(logRef, {
      action: 'pack_expired',
      createdAt: serverTimestamp(),
      createdBy,
      newRemainingCuts: userPack.remainingCuts,
      previousRemainingCuts: userPack.remainingCuts,
      userId: userPack.userId,
      userPackId,
      visitRequestId: null,
    })
  })

  return true
}
