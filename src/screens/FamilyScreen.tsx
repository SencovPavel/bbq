import { Modal, ModalButtons, GlassInput } from '@shared/ui/Modal'
import { ConfirmModal } from '@shared/ui/ConfirmModal'
import { EmptyState } from '@shared/ui/EmptyState'
import { SegmentedControl } from '@shared/ui/SegmentedControl'
import { Toggle } from '@shared/ui/Toggle'
import { UserAvatar } from '@entities/member/ui/UserAvatar'
import { BackButton, GlassIconButton } from '@shared/ui/GlassIconButton'
import { IconPerson, IconPlus } from '@shared/ui/Icon'
import { useFamilyScreenVM, FAMILY_LABELS } from './useFamilyScreenVM'

// ── LabelSelect ───────────────────────────────────────────────────────────────

function LabelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [...FAMILY_LABELS, ''].map(l => ({ value: l, label: l || 'без метки' }))
  return (
    <div className="mb-1">
      <div
        className="text-[11px] font-extrabold uppercase tracking-wider mb-2"
        style={{ color: 'var(--muted)' }}
      >
        Кто это
      </div>
      <SegmentedControl value={value} onChange={onChange} options={options} label="Кто это" fullWidth={false} />
    </div>
  )
}

// ── FamilyScreen ──────────────────────────────────────────────────────────────

export function FamilyScreen() {
  const {
    members, groups, loading,
    addOpen, setAddOpen, newName, setNewName, newLabel, setNewLabel,
    editMember, setEditMember, editName, setEditName, editLabel, setEditLabel,
    confirmDeleteId, setConfirmDeleteId,
    groupSearch, setGroupSearch, filteredGroups,
    handleAdd, openEdit, handleEdit, handleDelete, toggleGroup,
    goBack,
  } = useFamilyScreenVM()

  return (
    <div className="pb-10">

      {/* Header — как в ProfileScreen */}
      <div className="flex items-center gap-3 pb-6">
        <BackButton onClick={goBack} />
        <h1 className="text-[20px] font-extrabold flex-1 m-0" style={{ letterSpacing: '-0.02em' }}>
          Моя семья
        </h1>
        <GlassIconButton onClick={() => setAddOpen(true)} accent>
          <IconPlus size={16} strokeWidth={1.8} />
        </GlassIconButton>
      </div>

      <div className="lg:px-0 flex flex-col gap-3">

        {loading && (
          <div className="text-center py-10 text-[13px]" style={{ color: 'var(--muted)' }}>
            Загрузка…
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="glass rounded-[18px] p-6">
            <EmptyState
              icon={<IconPerson size={44} strokeWidth={1.4} />}
              title="Пока никого нет"
              body="Добавь членов семьи, которые ходят с тобой на пикники — детей, партнёра, гостей"
              ctaLabel="+ Добавить первого"
              onCta={() => setAddOpen(true)}
            />
          </div>
        )}

        {groups.length > 6 && members.length > 0 && (
          <GlassInput
            value={groupSearch}
            onChange={e => setGroupSearch(e.target.value)}
            placeholder="Поиск группы…"
          />
        )}

        {members.map(member => (
          <div key={member.id} className="glass rounded-[18px] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <UserAvatar name={member.name} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold">{member.name}</div>
                {member.label && (
                  <div className="text-[11.5px] font-semibold mt-px" style={{ color: 'var(--muted)' }}>
                    {member.label}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => openEdit(member)}
                className="text-[12px] font-bold border-none bg-transparent cursor-pointer px-2 py-1 shrink-0"
                style={{ color: 'var(--muted)', fontFamily: 'inherit' }}
              >
                Изменить
              </button>
            </div>

            {groups.length > 0 && (
              <>
                <div className="h-px mx-4" style={{ background: 'var(--gb)' }} />
                <div className="px-4 py-3">
                  <div
                    className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5"
                    style={{ color: 'var(--muted)' }}
                  >
                    Участвует в пикниках
                  </div>
                  {filteredGroups.length === 0 ? (
                    <div className="text-center text-[12px] py-2" style={{ color: 'var(--muted)' }}>
                      Ничего не найдено
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredGroups.map(group => {
                        const enabled = member.groups.some(g => g.group_id === group.id)
                        return (
                          <div key={group.id} className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-semibold">{group.name}</span>
                            <Toggle
                              on={enabled}
                              onToggle={() => toggleGroup(member.id, group.id, enabled)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {!loading && members.length > 0 && (
          <div
            className="text-center text-[11px] mt-0.5 leading-normal"
            style={{ color: 'var(--muted)', opacity: 0.6 }}
          >
            Члены семьи учитываются в явке и расчётах только в включённых группах
          </div>
        )}

      </div>

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
