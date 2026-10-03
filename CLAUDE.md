# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint     # eslint (flat config, eslint-config-next)
```

There is no test runner configured.

## Project

"DuHoc24" – Vietnamese-language study-abroad document intake portal, a teaching template for a 6-week course (see `README.md` for the week-by-week roadmap: Gemini chatbot → Supabase → document extraction → Make.com → magic-link auth). The current state is **Week 1: static UI only**. All data is hard-coded mock data in `lib/mock-data.ts` (types, `countries`, `schools`, etc.); there is no API, database, or auth yet. UI copy is Vietnamese — keep new copy in Vietnamese.

## Architecture

- Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 (CSS-first config in `app/globals.css`, no tailwind config file). Path alias `@/*` is the repo root.
- Routes: `/` (landing), `/portal` (student document portal), `/admin/{requests,schools,profiles,conversations}` (`/admin` redirects to `/admin/requests`). `app/admin/layout.tsx` provides the shared sidebar shell. `/login` is intentionally absent (students build it in Week 6).
- Components are grouped by feature: `components/landing`, `components/portal`, `components/admin`, plus shared `site-header`, `site-footer`, `status-badge`, `logo`.
- `components/ui/*` is shadcn/ui with style `base-nova`, built on **Base UI** (`@base-ui/react`), not Radix — APIs differ from typical shadcn examples. Add components via the shadcn CLI (`components.json`; extra registry `@tailark-oss`); icons are `lucide-react`; use `cn` from `lib/utils.ts` for class merging.
- Status enums (`DocStatus`, `RequestStatus`, `ServicePackage`) in `lib/mock-data.ts` use Vietnamese snake_case values (e.g. `cho_duyet`, `can_nop_lai`) and are rendered through `components/status-badge.tsx`.
- Landing chat widget (`components/landing/chat-widget.tsx`) is a client component with canned answers; it is the placeholder for the Week 2 Gemini integration.
- Env vars (Supabase, site URL) are listed in `.env.example` but are not needed to run the app yet.

## Quy tắc Git

- Luôn hỏi xác nhận trước khi push lên Github
- Không bao giờ commit file .env hoặc bất kỳ file chứa API key
