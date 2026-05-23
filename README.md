# 🔥 Пикник — React Frontend

React + Vite + Tailwind фронтенд для Telegram Mini App.  
Бэкенд (`server.js`, `bot.js`, `agent.js`) остаётся в `picnic-v3` без изменений.

---

## Структура

```
picnic-frontend/
├── src/
│   ├── App.jsx                  ← роутинг и WS логика
│   ├── main.jsx
│   ├── index.css                ← glass переменные и утилиты
│   ├── components/
│   │   ├── Blobs.jsx            ← ambient background
│   │   ├── TopNav.jsx           ← навигация (Telegram-style, сверху)
│   │   ├── GroupBar.jsx         ← название группы + код
│   │   ├── GlassCard.jsx        ← стеклянная карточка
│   │   ├── Modal.jsx            ← bottom sheet модалка
│   │   └── Toast.jsx            ← уведомления
│   ├── screens/
│   │   ├── ListScreen.jsx       ← список покупок
│   │   ├── SummaryScreen.jsx    ← итог + агент
│   │   ├── MyScreen.jsx         ← моя закупка
│   │   ├── MembersScreen.jsx    ← участники
│   │   ├── GroupsScreen.jsx     ← список групп
│   │   └── OnboardingScreen.jsx ← создать / войти
│   ├── hooks/
│   │   └── useWebSocket.js      ← WS с автореконнектом
│   └── lib/
│       ├── api.js               ← HTTP запросы
│       ├── tg.js                ← Telegram WebApp helpers
│       └── session.js           ← sessionStorage + утилиты
├── vite.config.js               ← build → ../picnic-v3/public
├── tailwind.config.js
└── package.json
```

---

## Установка и разработка

```bash
cd picnic-frontend
npm install
npm run dev          # dev сервер на :5173, проксирует API на :3001
```

---

## Сборка и деплой

```bash
npm run build
# Собранные файлы попадают в ../picnic-v3/public/
# Перезапускать pm2 не нужно — статика
```

На сервере:

```bash
# Установи Node зависимости один раз
cd /var/www/picnic-frontend
npm install

# Собери и разверни
npm run build
# или если frontend лежит рядом с бэкендом:
cd /var/www/picnic-v3/frontend
npm run build
```

---

## Дизайн

**Glass morphism** на тёмном фоне:
- Три ambient blob'а создают глубину
- Карточки: `backdrop-filter: blur(20px)` + полупрозрачный фон
- Навигация сверху в стиле Telegram (Wallet, Gifts и т.д.)
- Метки источника позиций: 💬 из чата · 🤖 агент · ✏️ вручную

---

## Совместимость с бэкендом

Фронтенд полностью совместим с `picnic-v3/server.js`.  
WebSocket протокол не менялся. HTTP API не менялся.
