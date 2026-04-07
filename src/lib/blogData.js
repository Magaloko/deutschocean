import { db } from './firebase.js'
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore'

export async function getPublishedPosts(limitCount = 50) {
  if (!db) return []
  const q = query(
    collection(db, 'posts'),
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getLatestPosts(limitCount = 3) {
  return getPublishedPosts(limitCount)
}

export async function getAllPosts() {
  if (!db) return []
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getPostBySlug(slug) {
  if (!db) return null
  const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getPostById(id) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'posts', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function createPost(data) {
  if (!db) throw new Error('Firebase not configured')
  const now = serverTimestamp()
  return addDoc(collection(db, 'posts'), {
    ...data,
    published: false,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updatePost(id, data) {
  if (!db) throw new Error('Firebase not configured')
  return updateDoc(doc(db, 'posts', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deletePost(id) {
  if (!db) throw new Error('Firebase not configured')
  return deleteDoc(doc(db, 'posts', id))
}

export async function publishPost(id) {
  if (!db) throw new Error('Firebase not configured')
  return updateDoc(doc(db, 'posts', id), {
    published: true,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function unpublishPost(id) {
  if (!db) throw new Error('Firebase not configured')
  return updateDoc(doc(db, 'posts', id), {
    published: false,
    updatedAt: serverTimestamp(),
  })
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}
