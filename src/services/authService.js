import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { auth, db, isFirebaseConfigured } from '../firebase'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

function requireFirebase() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase no esta configurado. Revisa las variables VITE_FIREBASE_*.')
  }
}

export function listenAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export async function getUserProfile(uid) {
  requireFirebase()
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

async function ensureGoogleUserProfile(user) {
  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)
  const displayName = user.displayName || user.email || 'Cliente Q2N'
  const photoURL = user.photoURL || null

  if (snapshot.exists()) {
    await updateDoc(userRef, {
      displayName,
      lastLoginAt: serverTimestamp(),
      photoURL,
      updatedAt: serverTimestamp(),
    })
    return
  }

  await setDoc(userRef, {
    createdAt: serverTimestamp(),
    displayName,
    email: user.email,
    lastLoginAt: serverTimestamp(),
    photoURL,
    role: 'user',
    updatedAt: serverTimestamp(),
  })
}

export async function signInWithGoogle() {
  requireFirebase()
  const credential = await signInWithPopup(auth, googleProvider)
  await ensureGoogleUserProfile(credential.user)
  return credential.user
}

export async function logoutUser() {
  requireFirebase()
  await signOut(auth)
}

export async function updateUserProfile(uid, data) {
  requireFirebase()
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
