# Мини-анкета

Веб-приложение для сбора ответов пользователей, состоящее из Go-бэкенда и React-фронтенда, упакованное в Docker.

## Архитектура

```
┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   Nginx      │
│  (Frontend)  │◀────│  :3000:80    │
└──────────────┘     └──────┬───────┘
                            │ /api/ → backend:8080
                     ┌──────▼───────┐
                     │   Go Backend │
                     │   :8080      │
                     └──────────────┘
```

- **Backend** (Go) — REST API с двумя эндпоинтами, хранение ответов в памяти
- **Frontend** (React + TypeScript + Vite) — форма анкеты с градиентным дизайном
- **Nginx** — раздача статiky и проксирование API-запросов на бэкенд

## Быстрый старт

### Требования

- [Docker](https://www.docker.com/) и [Docker Compose](https://docs.docker.com/compose/) (v2+)

### Запуск

```bash
docker compose up --build
```

После запуска:

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:3000 |
| Backend API | http://localhost:8080 |

### Остановка

```bash
docker compose down
```

## API

### Получить вопросы

```bash
curl http://localhost:8080/questions
```

**Ответ:**

```json
[
  {"id": 1, "text": "Как вас зовут?"},
  {"id": 2, "text": "Какой ваш любимый язык программирования?"},
  {"id": 3, "text": "Сколько лет вы программируете?"},
  {"id": 4, "text": "Как вы узнали о нашем проекте?"},
  {"id": 5, "text": "Что бы вы хотели улучшить?"}
]
```

### Отправить ответы

```bash
curl -X POST http://localhost:8080/answers \
  -H "Content-Type: application/json" \
  -d '{"answers":{"1":"Алексей","2":"Go","3":"5","4":"GitHub","5":"Мобильную версию"}}'
```

**Ответ:**

```json
{"status": "success"}
```

## Структура проекта

```
.
├── docker-compose.yml      # Оркестрация контейнеров
├── backend/
│   ├── main.go             # Сервер, роуты, хранение в памяти
│   ├── go.mod
│   └── Dockerfile          # Multi-stage build: golang → alpine
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Компонент: загрузка → форма → спасибо
│   │   ├── types.ts        # TypeScript-интерфейсы
│   │   ├── index.css       # Стили: градиент, карточка, анимации
│   │   └── main.tsx        # Точка входа React
│   ├── package.json
│   ├── vite.config.ts      # Dev-proxy на :8080
│   ├── Dockerfile          # Multi-stage build: node → nginx
│   └── nginx.conf          # Reverse-proxy /api → backend
└── README.md
```

## Режим разработки

### Frontend (локально)

```bash
cd frontend
npm install
npm run dev
```

Vite автоматически пробросит `/api/*` на `localhost:8080`. Бэкенд должен быть запущен отдельно:

```bash
cd backend
go run main.go
```

### Backend (локально)

```bash
cd backend
go run main.go
```

Сервер запустится на `http://localhost:8080`.

## Как работает

1. При открытии страницы фронтенд запрашивает `GET /api/questions` (пробрасывается на бэкенд)
2. Вопросы отображаются в виде формы с текстовыми полями
3. При нажатии «Отправить» данные уходят на `POST /api/answers`
4. Бэкенд сохраняет ответы в `map[int]string` и возвращает `200 OK`
5. Фронтенд показывает экран «Спасибо!»

## Конфигурация

### Изменить вопросы

Отредактируйте `backend/main.go`, функция `initQuestions()`:

```go
questions = []Question{
    {ID: 1, Text: "Ваш вопрос 1"},
    {ID: 2, Text: "Ваш вопрос 2"},
    // ...
}
```

### Изменить порт фронтенда

Отредактируйте `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # было "3000:80"
```

### Изменить порт бэкенда

Отредактируйте `docker-compose.yml` и `backend/main.go`:

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "9090:9090"  # было 8080
```

```go
// backend/main.go
port := "9090"  // было "8080"
```

## Сборка без запуска

```bash
docker compose build
```

## Просмотр логов

```bash
docker compose logs -f          # Все сервисы
docker compose logs -f backend  # Только бэкенд
docker compose logs -f frontend # Только фронтенд
```

## Удаление контейнеров и образов

```bash
docker compose down -v --rmi local  # С удалением томов и образов
```
