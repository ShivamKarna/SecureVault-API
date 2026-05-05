![License](https://img.shields.io/badge/License-MIT-green?style=flat)

# SecureVault API

Backend for SecureVault, a password manager that stores encrypted credentials. Built on Cloudflare's edge infrastructure.

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better_Auth-000000?style=flat&logoColor=white)
![D1](https://img.shields.io/badge/Cloudflare-D1-F38020?style=flat&logo=cloudflare&logoColor=white)

## Live API + Docs

Production endpoints for the API root and its OpenAPI docs.

- Root API: https://securevault.shivamkarn.workers.dev
- Swagger UI: https://securevault.shivamkarn.workers.dev/docs
- OpenAPI JSON: https://securevault.shivamkarn.workers.dev/docs/json

## Stack

- **Hono** — routing and middleware
- **Better Auth** — session-based authentication with email/password and OAuth (Google, GitHub)
- **Cloudflare D1** — SQLite database at the edge
- **Cloudflare KV** — rate limiting
- **Drizzle ORM** — type-safe queries with zod validation of schemas
- **Web Crypto API** — AES-256-GCM encryption for stored passwords

## What it does

- Stores vault entries (platform, username, password) with server-side AES-256-GCM encryption
- Manages user sessions with Better Auth — no JWTs
- Rate limits all API routes using Cloudflare KV
- Tracks active sessions with device and IP info
- Supports Google and GitHub OAuth login

## Architecture

```
Request
  └── Hono Router
        ├── CORS Middleware
        ├── Rate Limit Middleware (KV)
        ├── /api/auth/**     →  Better Auth Handler
        ├── /api/vault/**    →  Auth Middleware  →  Vault Controller  →  D1
        └── /api/sessions/** →  Auth Middleware  →  Session Controller  →  D1
```

## API

| Method | Route                    | Auth | Description                              |
| ------ | ------------------------ | ---- | ---------------------------------------- |
| POST   | /api/auth/sign-up/email  | No   | Register with email/password             |
| POST   | /api/auth/sign-in/email  | No   | Login with email/password                |
| POST   | /api/auth/sign-in/social | No   | OAuth login (Google, GitHub)             |
| GET    | /api/vault               | Yes  | Get all vault entries (paginated)        |
| POST   | /api/vault               | Yes  | Create vault entry                       |
| GET    | /api/vault/:id           | Yes  | Get single entry with decrypted password |
| PATCH  | /api/vault/:id           | Yes  | Update vault entry                       |
| DELETE | /api/vault/:id           | Yes  | Delete vault entry                       |
| GET    | /api/sessions            | Yes  | Get all active sessions with device info |
| DELETE | /api/sessions/:id        | Yes  | Revoke a session                         |

## Security

- Passwords are encrypted with **AES-256-GCM** before being stored — the encryption key never leaves the server
- Sessions are validated on every request against D1 — no stateless tokens
- Rate limiting applied to all `/api/*` routes via Cloudflare KV
- CORS locked to trusted origins only

## Deployed at

`https://securevault.shivamkarn.workers.dev`
