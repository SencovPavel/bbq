import { useState, useEffect, useCallback } from 'react'

import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  setFamilyMemberGroup,
  getUserGroups,
} from '@shared/api/api'
import type { FamilyMemberFull, GroupSummary } from '@shared/types'

import { useSessionStore } from '@stores/sessionStore'
import { useAppStore }     from '@stores/appStore'
import { useToastStore }   from '@stores/toastStore'

export const FAMILY_LABELS = ['ребёнок', 'муж', 'жена', 'партнёр', 'гость']

// ── ViewModel ─────────────────────────────────────────────────────────────────

export function useFamilyScreenVM() {
  const me        = useSessionStore(s => s.me)
  const popScreen = useAppStore(s => s.popScreen)
  const showToast = useToastStore(s => s.show)

  // ── Remote data ────────────────────────────────────────────────────────────
  const [members, setMembers] = useState<FamilyMemberFull[]>([])
  const [groups,  setGroups]  = useState<GroupSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me?.id) { setLoading(false); return }
    Promise.all([getFamilyMembers(), getUserGroups(me.id)])
      .then(([fam, grps]) => { setMembers(fam); setGroups(grps) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [me?.id])

  // ── Add modal ──────────────────────────────────────────────────────────────
  const [addOpen,   setAddOpen]   = useState(false)
  const [newName,   setNewName]   = useState('')
  const [newLabel,  setNewLabel]  = useState(FAMILY_LABELS[0])

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editMember,     setEditMember]     = useState<FamilyMemberFull | null>(null)
  const [editName,       setEditName]       = useState('')
  const [editLabel,      setEditLabel]      = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    try {
      const result = await addFamilyMember({ name, label: newLabel || undefined })
      if (result.error) { showToast(result.error, 'error'); return }
      setMembers(prev => [...prev, result])
      setAddOpen(false)
      setNewName('')
      setNewLabel(FAMILY_LABELS[0])
      showToast(`${name} добавлен в семью`)
    } catch {
      showToast('Ошибка добавления', 'error')
    }
  }

  function openEdit(member: FamilyMemberFull) {
    setEditMember(member)
    setEditName(member.name)
    setEditLabel(member.label ?? '')
  }

  async function handleEdit() {
    if (!editMember) return
    const name = editName.trim()
    if (!name) return
    try {
      const result = await updateFamilyMember(editMember.id, { name, label: editLabel || null })
      if (result.error) { showToast(result.error, 'error'); return }
      setMembers(prev => prev.map(m =>
        m.id === editMember.id ? { ...m, name, label: editLabel || null } : m,
      ))
      setEditMember(null)
      showToast('Сохранено')
    } catch {
      showToast('Ошибка сохранения', 'error')
    }
  }

  async function handleDelete(id: string) {
    await deleteFamilyMember(id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setEditMember(null)
    setConfirmDeleteId(null)
    showToast('Удалено из семьи')
  }

  const toggleGroup = useCallback(async (memberId: string, groupId: string, currentlyEnabled: boolean) => {
    await setFamilyMemberGroup(memberId, { groupId, enabled: !currentlyEnabled })
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m
      const grp = groups.find(g => g.id === groupId)
      const newGroups = currentlyEnabled
        ? m.groups.filter(g => g.group_id !== groupId)
        : [...m.groups, {
            group_id:        groupId,
            group_name:      grp?.name ?? groupId,
            include_in_calc: true,
            cost_pct:        100,
          }]
      return { ...m, groups: newGroups }
    }))
  }, [groups])

  return {
    // data
    me, members, groups, loading,
    // add modal
    addOpen, setAddOpen, newName, setNewName, newLabel, setNewLabel,
    // edit modal
    editMember, setEditMember, editName, setEditName, editLabel, setEditLabel,
    // delete confirm
    confirmDeleteId, setConfirmDeleteId,
    // actions
    handleAdd, openEdit, handleEdit, handleDelete, toggleGroup,
    goBack: () => popScreen('profile'),
  }
}
