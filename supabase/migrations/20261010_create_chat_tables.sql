-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  session_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at, id);

-- Dữ liệu riêng tư: bật RLS và KHÔNG tạo policy cho anon/authenticated,
-- nên trình duyệt (publishable key) không đọc/ghi được gì. Chỉ server dùng
-- secret key (service_role, bỏ qua RLS) mới truy cập được.
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.conversations from anon, authenticated;
revoke all on public.messages from anon, authenticated;
