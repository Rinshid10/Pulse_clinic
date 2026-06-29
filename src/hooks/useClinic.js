import { useEffect, useState } from 'react'
import {
  getDoctors, getContent, getLeave, isOnLeaveToday, availableSlotsToday, subscribe,
} from '../services/clinicStore'

/* Customer-side hooks that read the shared store and stay in sync with
   admin changes (same tab via custom event, cross-tab via storage event). */

export function useDoctors({ activeOnly = true } = {}) {
  const [docs, setDocs] = useState(() => getDoctors())
  // refetch on any store change so doctor edits AND leave changes refresh the UI
  useEffect(() => subscribe(() => setDocs(getDoctors())), [])
  return activeOnly ? docs.filter((d) => d.active !== false) : docs
}

export function useContent() {
  const [content, setContent] = useState(() => getContent())
  useEffect(() => subscribe((key) => { if (!key || key === 'pulse-content') setContent(getContent()) }), [])
  return content
}

export { getLeave, isOnLeaveToday, availableSlotsToday }
