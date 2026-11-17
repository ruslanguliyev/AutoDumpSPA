# Развёртывание AutoBaz

Весь проект (база, API, сайт) поднимается одной командой через Docker Compose.

## 1. Быстрый запуск (на своём компьютере или сервере)

Нужен только [Docker](https://docs.docker.com/get-docker/) с Docker Compose.

```bash
cp .env.example .env        # затем откройте .env и впишите пароль базы и JWT_SECRET
docker compose up -d --build
```

Сайт откроется на `http://localhost:8080` (порт меняется переменной `WEB_PORT`).
Первый запуск собирает образы и применяет миграции базы автоматически (несколько минут).

Проверка:

```bash
docker compose ps                      # все три сервиса должны быть healthy / running
curl http://localhost:8080/graphql -H "Content-Type: application/json" -d '{"query":"{ hello }"}'
```

### Что запускается

| Сервис     | Что делает                                         | Данные                  |
|------------|----------------------------------------------------|-------------------------|
| `db`       | PostgreSQL 16                                      | том `pgdata`            |
| `backend`  | API (NestJS). При старте применяет миграции        | том `uploads` (фото)    |
| `frontend` | nginx: отдаёт сайт и проксирует `/graphql`, `/uploads`, `/socket.io` на backend | нет |

API наружу напрямую не публикуется: всё идёт через сайт (один адрес, без CORS-проблем).

## 2. Обязательные настройки (`.env`)

| Переменная          | Зачем                                                                                   |
|---------------------|-----------------------------------------------------------------------------------------|
| `POSTGRES_PASSWORD` | Пароль базы. Длинный случайный.                                                         |
| `JWT_SECRET`        | Секрет подписи токенов входа. Длинный случайный (`openssl rand -hex 48`). Смена разлогинит всех. Без него backend не запустится. |
| `WEB_PORT`          | Порт сайта на машине (по умолчанию 8080).                                               |
| `VITE_PUBLIC_APP_URL` | Публичный адрес сайта. Вшивается в сборку фронтенда и задаёт ссылки на вход и действия аккаунта. По умолчанию `https://autobaz.az`. |
| `CORS_ORIGIN`       | Нужен, только если API вызывается с другого адреса, чем сайт.                           |
| `PUBLIC_WEB_URL`    | **Обязательно на сервере.** Публичный адрес сайта, например `https://autobaz.az`. Из него строятся ссылки возврата после оплаты. |
| `PAYMENT_MOCK_SECRET` | **Обязательно на сервере.** Секрет подписи обратных вызовов платёжной заглушки. Длинный случайный (`openssl rand -hex 32`). Без него действует известный всем `dev-mock-secret`. |
| `TRUSTED_PROXY_HOPS` | Сколько прокси стоит перед backend. По умолчанию 1 (nginx в контейнере `frontend`). Если перед ним ещё Caddy или балансировщик, поставьте 2, иначе вместо IP посетителя считается IP прокси. |
| `PROMOTIONS_SCHEDULER` | `off` отключает фоновые часы продвижения (завершение размещений, поднятия). Нужно только если запущено несколько копий backend: тогда оставьте часы на одной, иначе поднятие сработает дважды. |

Файл `.env` с настоящими секретами **нельзя** коммитить (он в `.gitignore`).

## 3. Выход в интернет (домен и HTTPS)

Контейнер `frontend` слушает обычный HTTP. Для публичного сайта поставьте перед ним reverse proxy с HTTPS:

- проще всего [Caddy](https://caddyserver.com/) (сертификат выпускается сам):

  ```
  autobaz.az, www.autobaz.az {
      reverse_proxy localhost:8080
  }
  ```

  В DNS у регистратора домена `autobaz.az` создайте записи `A` (и `AAAA`, если есть IPv6) для `autobaz.az` и `www`
  на адрес сервера. Затем в `.env` задайте `PUBLIC_WEB_URL=https://autobaz.az` и `TRUSTED_PROXY_HOPS=2`
  (перед nginx контейнера стоит ещё Caddy) и перезапустите: `docker compose up -d`.

Смена домена в `VITE_PUBLIC_APP_URL` требует пересобрать образ фронтенда (`docker compose up -d --build`), а не только перезапустить контейнер: адрес вшивается при сборке.

- или nginx + certbot / Traefik / облачный балансировщик.

Если не закрывать HTTPS, пароли и токены будут идти по сети открытым текстом.

## 4. Первый администратор (модерация)

Роль администратора выдаётся только командой на сервере, через API её получить нельзя:

```bash
docker compose exec backend npm run admin:grant -- someone@example.com
# снять роль:
docker compose exec backend npm run admin:grant -- someone@example.com --revoke
```

Аккаунт должен уже существовать (зарегистрируйтесь на сайте). После выдачи роли войдите заново:
в меню кабинета появится раздел «Модерация».

## 5. Запуск без Docker (для разработки)

Нужны Node.js 24 и PostgreSQL, запущенный на `localhost:5432`.

```bash
createdb -U postgres autobaz                      # один раз
cp backend/.env.example backend/.env             # проверьте DATABASE_URL и JWT_SECRET
cd backend && npm ci && npx prisma migrate deploy && npx prisma generate
npm run start:dev                                # API на http://localhost:4000

cd frontend && npm ci && npm run dev             # сайт на http://localhost:5173
```

Проверка API: `curl http://localhost:4000/health`.

Имя базы по умолчанию везде `autobaz` (и в Docker, и в `backend/.env.example`). Если у вас уже есть локальная база
с другим именем, например `avtobaz`, просто оставьте её в своём `backend/.env`: переименовывать ничего не нужно.

Тесты сами создают и чистят отдельную базу и не трогают рабочую:

```bash
cd backend && npx jest
```

## 6. Обновление версии

```bash
git pull
docker compose up -d --build     # пересоберёт образы; миграции применятся при старте backend
```

## 7. Резервные копии (важно)

Данные живут в двух томах: `pgdata` (база) и `uploads` (фото объявлений). Теряются они только если удалить тома
(`docker compose down -v` — **не запускайте**, это стирает всё).

```bash
# дамп базы
docker compose exec -T db pg_dump -U autobaz autobaz > backup-$(date +%F).sql

# восстановление в пустую базу
cat backup-2026-01-01.sql | docker compose exec -T db psql -U autobaz autobaz

# фото
docker run --rm -v autobaz_uploads:/data -v "$PWD":/backup alpine tar czf /backup/uploads-$(date +%F).tgz -C /data .
```

Делайте копии по расписанию (cron) и храните их вне сервера.

## 8. Логи и диагностика

```bash
docker compose logs -f backend        # логи API
docker compose logs -f frontend       # логи nginx
curl http://localhost:8080/graphql ... # см. выше
```

Состояние API и базы: внутри сети доступен `GET /health` (`{"status":"ok","database":"up"}`),
его же использует Docker для healthcheck.

## 9. Что пока не готово для боевого запуска

- **Оплата.** Платёжный провайдер пока заглушка (`MockPaymentProvider`). Реальный эквайер подключается заменой одной реализации.
- **Почта.** Уведомления продавцам об обращениях по email не отправляются (отложено).
- **Хранение фото.** Фото лежат на диске сервера (том `uploads`). Для нескольких серверов или большого объёма
  нужно вынести в S3-подобное хранилище.
- **Ограничение попыток входа** хранится в памяти процесса: при нескольких копиях backend счётчики не общие
  (нужен Redis).
- **Мониторинг и алерты** не настроены (минимум: внешний uptime-монитор на сайт).
- **Автоматические бэкапы** нужно настроить самостоятельно (см. раздел 7).
