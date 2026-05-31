import { IconCalendar } from '@shared/ui/Icon'
import { EmptyState } from '@shared/ui/EmptyState'

interface NoEventsPromptProps {
  isAdmin: boolean
  onCreate: () => void
}

/**
 * Пустое состояние группы без событий: админ может создать, остальные — ждут организатора.
 */
export function NoEventsPrompt({ isAdmin, onCreate }: NoEventsPromptProps) {
  if (isAdmin) {
    return (
      <EmptyState
        icon={<IconCalendar size={52} strokeWidth={1.4} />}
        title="Нет событий"
        body="Создайте первое событие — к нему привязываются список покупок и расчёты"
        ctaLabel="＋ Создать событие"
        onCta={onCreate}
      />
    )
  }

  return (
    <EmptyState
      icon={<IconCalendar size={52} strokeWidth={1.4} />}
      title="Нет событий"
      body="Попросите организатора группы создать событие, чтобы начать собирать список"
    />
  )
}
