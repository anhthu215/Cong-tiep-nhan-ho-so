-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.leads (
  conversation_id uuid primary key references public.conversations(id) on delete cascade,
  name text,
  email text,
  phone text,
  country text,
  education_level text,
  major text,
  availability text,
  wants_consultation boolean,
  note text,
  quality text not null check (quality in ('good', 'ok', 'spam')),
  extracted_at timestamptz not null default now()
);

-- Dữ liệu riêng tư: bật RLS, không tạo policy cho anon/authenticated,
-- chỉ server (secret key, bỏ qua RLS) mới đọc/ghi được.
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;

create index leads_quality_idx on public.leads (quality);
