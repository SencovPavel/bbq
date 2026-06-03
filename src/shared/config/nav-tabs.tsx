import type { ComponentType } from 'react'

import {
  NavTabIconList,
  NavTabIconMapPin,
  NavTabIconMy,
  NavTabIconSummary,
} from './nav-tab-icons'

import type { Tab } from '../types'

export interface NavTabConfig {
  id: Tab
  label: string
  Icon: ComponentType<{ active: boolean }>
}

export const NAV_TABS: NavTabConfig[] = [
  { id: 'list', label: 'Список', Icon: NavTabIconList },
  { id: 'my', label: 'Моё', Icon: NavTabIconMy },
  { id: 'summary', label: 'Сводка', Icon: NavTabIconSummary },
  { id: 'members', label: 'Событие', Icon: NavTabIconMapPin },
]

export const NAV_TAB_COUNT = NAV_TABS.length
