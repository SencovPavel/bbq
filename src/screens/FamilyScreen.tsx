import { GlassCard }                          from '@shared/ui/GlassCard'
import { Modal, ModalButtons, GlassInput }     from '@shared/ui/Modal'
import { ConfirmModal }                        from '@shared/ui/ConfirmModal'
import { EmptyState }                          from '@shared/ui/EmptyState'
import { UserAvatar }                          from '@entities/member/ui/UserAvatar'
import { useFamilyScreenVM, FAMILY_LABELS }    from './useFamilyScreenVM'

// ── LabelSelect ───────────────────────────────────────────────────────────────

function LabelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [...FAMILY_LABELS, '']
  return (
    <div className="mb-1">
      <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2"
        style={{ color: 'var(--muted)' }}>
        Кто это
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(l => {
          const active = l === '' ? !FAMILY_LABELS.includes(value) && value === '' : value === l
          return (
            <button
              key={l || '__none__'}
              type="button"
              onClick={() => onChange(l)}
              className="px-3 py-1 rounded-pill text-[12px] font-bold border transition-all"
              style={{
                background:   active ? 'var(--surface-fire-12)' : 'var(--surface-white-8)',
                borderColor:  active ? 'var(--accent)' : 'var(--gb)',
                color:        active ? 'var(--accent)' : 'var(--muted)',
                fontFamily:   'inherit',
                cursor:       'pointer',
              }}
            >
              {l || 'без метки'}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative border-none cursor-pointer transition-colors duration-200 shrink-0"
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? 'var(--accent)' : 'var(--surface-white-10)',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-[3px] rounded-full transition-all duration-200"
        style={{
          width: 16, height: 16,
          background: '#fff',
          left: on ? 'calc(100% - 19px)' : 3,
        }}
      />
    </button>
  )
}

// ── FamilyScreen ──────────────────────────────────────────────────────────────

export function FamilyScreen() {
  const vm = useFamilyScreenVM()
  const {
    members, groups, loading,
    addOpen, setAddOpen, newName, setNewName, newLabel, setNewLabel,
    editMember, setEditMember, editName, setEditName, editLabel, setEditLabel,
    confirmDeleteId, setConfirmDeleteId,
    handleAdd, openEdit, handleEdit, handleDelete, toggleGroup,
    goBack,
  } = vm

  return (
    <div className="px-3.5 pt-4 pb-10 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 text-[13px] font-bold border-none bg-transparent cursor-pointer"
          style={{ color: 'var(--muted)', fontFamily: 'inherit' }}
        >
          ← Назад
        </button>
        <h1 className="text-[20px] font-black flex-1 m-0">Моя семья</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="px-3 py-1.5 rounded-pill text-[12px] font-extrabold border-none cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}
        >
          + Добавить
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-[13px]" style={{ color: 'var(--muted)' }}>
          Загрузка…
        </div>
      )}

      {!loading && members.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: 48 }}>👨‍👩‍👧</span>}
          title="Пока никого нет"
          body="Добавь членов семьи, которые ходят с тобой на пикники — детей, партнёра, гостей"
          ctaLabel="+ Добавить первого"
          onCta={() => setAddOpen(true)}
        />
      )}

      {members.map(member => (
        <GlassCard key={member.id} className="mb-3">
          {/* Member row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <UserAvatar name={member.name} size={40} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-extrabold">{member.name}</div>
              {member.label && (
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{member.label}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => openEdit(member)}
              className="text-[12px] font-bold border-none bg-transparent cursor-pointer px-2 py-1"
              style={{ color: 'var(--muted)', fontFamily: 'inherit' }}
            >
              Изменить
            </button>
          </div>

          {/* Group toggles */}
          {groups.length > 0 && (
            <div className="px-4 pb-3 border-t" style={{ borderColor: 'var(--surface-white-10)' }}>
              <div
                className="text-[10px] font-extrabold uppercase tracking-wider mt-3 mb-2"
                style={{ color: 'var(--muted)' }}
              >
                Участвует в пикниках
              </div>
              <div className="flex flex-col gap-2">
                {groups.map(group => {
                  const enabled = member.groups.some(g => g.group_id === group.id)
                  return (
                    <div key={group.id} className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold">{group.name}</span>
                      <Toggle on={enabled} onToggle={() => toggleGroup(member.id, group.id, enabled)} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </GlassCard>
      ))}

      {/* Add member modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Добавить в семью">
        <GlassInput
          label="Имя"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Например: Соня"
          autoFocus
        />
        <LabelSelect value={newLabel} onChange={setNewLabel} />
        <ModalButtons
          onCancel={() => setAddOpen(false)}
          onConfirm={handleAdd}
          confirmText="Добавить"
        />
      </Modal>

      {/* Edit member modal */}
      <Modal open={!!editMember} onClose={() => setEditMember(null)} title="Изменить">
        <GlassInput
          label="Имя"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          autoFocus
        />
        <LabelSelect value={editLabel} onChange={setEditLabel} />
        <ModalButtons
          onCancel={() => setEditMember(null)}
          onConfirm={handleEdit}
          confirmText="Сохранить"
        />
        <div className="text-center mt-1">
          <button
            type="button"
            onClick={() => editMember && setConfirmDeleteId(editMember.id)}
            className="text-[12px] font-bold border-none bg-transparent cursor-pointer py-1"
            style={{ color: 'var(--red)', fontFamily: 'inherit' }}
          >
            Удалить из семьи
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!confirmDeleteId}
        message={
          confirmDeleteId
            ? `Удалить «${members.find(m => m.id === confirmDeleteId)?.name}» из семьи?`
            : ''
        }
        confirmText="Удалить"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
