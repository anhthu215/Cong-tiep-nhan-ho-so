-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  email text not null check (char_length(email) between 5 and 200),
  phone text check (phone is null or char_length(phone) between 6 and 30),
  country text not null check (char_length(country) between 1 and 80),
  degree_level text not null check (degree_level in ('thpt', 'dai_hoc', 'thac_si')),
  service_package text not null check (service_package in ('co_ban', 'toan_dien')),
  price_vnd integer not null check (price_vnd > 0),
  status text not null default 'cho_duyet' check (status in ('cho_duyet', 'da_duyet', 'tu_choi')),
  created_at timestamptz not null default now()
);

create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index quote_requests_status_idx on public.quote_requests (status);
create index quote_requests_email_created_idx on public.quote_requests (lower(email), created_at desc);

-- Dữ liệu khách hàng: bật RLS, KHÔNG tạo policy, thu hồi quyền của anon/authenticated.
-- Chỉ server (secret key, bỏ qua RLS) mới đọc/ghi được.
alter table public.quote_requests enable row level security;
revoke all on public.quote_requests from anon, authenticated;
