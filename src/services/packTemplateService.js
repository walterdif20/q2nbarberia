import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db, isFirebaseConfigured } from '../firebase'
import { calculateSavings } from '../utils/packUtils'

const demoTemplates = [
  {
    id: 'demo-pack-4',
    cutsQuantity: 4,
    description: 'Ideal para mantener el corte al día durante dos meses.',
    isActive: true,
    name: 'Pack 4 cortes',
    packPrice: 40000,
    regularPrice: 48000,
    validityDays: 60,
    ...calculateSavings(48000, 40000),
  },
  {
    id: 'demo-pack-2',
    cutsQuantity: 2,
    description: 'Una opción simple para probar el sistema de packs.',
    isActive: true,
    name: 'Pack 2 cortes',
    packPrice: 22000,
    regularPrice: 24000,
    validityDays: 30,
    ...calculateSavings(24000, 22000),
  },
]

function templatesCollection() {
  return collection(db, 'packTemplates')
}

function toMillis(value) {
  return value?.toMillis?.() || value?.seconds * 1000 || 0
}

function sortNewestFirst(items) {
  return [...items].sort((first, second) => toMillis(second.createdAt) - toMillis(first.createdAt))
}

export function listenActivePackTemplates(callback) {
  if (!isFirebaseConfigured || !db) {
    callback(demoTemplates)
    return () => {}
  }

  const q = query(
    templatesCollection(),
    where('isActive', '==', true),
  )

  return onSnapshot(q, (snapshot) => {
    callback(sortNewestFirst(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
  })
}

export function listenAllPackTemplates(callback) {
  if (!isFirebaseConfigured || !db) {
    callback(demoTemplates)
    return () => {}
  }

  const q = query(templatesCollection())
  return onSnapshot(q, (snapshot) => {
    callback(sortNewestFirst(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))))
  })
}

export async function savePackTemplate(template) {
  const regularPrice = Number(template.regularPrice || 0)
  const packPrice = Number(template.packPrice || 0)
  const savings = calculateSavings(regularPrice, packPrice)
  const payload = {
    cutsQuantity: Number(template.cutsQuantity || 0),
    description: template.description || '',
    isActive: Boolean(template.isActive),
    name: template.name,
    packPrice,
    regularPrice,
    savingsAmount: savings.savingsAmount,
    savingsPercentage: savings.savingsPercentage,
    updatedAt: serverTimestamp(),
    validityDays: Number(template.validityDays || 0),
  }

  if (template.id) {
    await updateDoc(doc(db, 'packTemplates', template.id), payload)
    return template.id
  }

  const created = await addDoc(templatesCollection(), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return created.id
}

export async function setPackTemplateActive(templateId, isActive) {
  await updateDoc(doc(db, 'packTemplates', templateId), {
    isActive,
    updatedAt: serverTimestamp(),
  })
}
