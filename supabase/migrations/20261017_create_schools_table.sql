-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  country text not null,
  min_gpa numeric(3,1) not null check (min_gpa between 0 and 10),
  min_ielts numeric(2,1) not null check (min_ielts between 0 and 9),
  created_at timestamptz not null default now()
);

-- Dữ liệu công khai: ai cũng đọc được (anon + authenticated), nhưng không ai
-- ngoài server (secret key, bỏ qua RLS) ghi được.
alter table public.schools enable row level security;

revoke all on public.schools from anon, authenticated;
grant select on public.schools to anon, authenticated;

create policy "Public can read schools"
  on public.schools for select
  to anon, authenticated
  using (true);

insert into public.schools (name, country, min_gpa, min_ielts) values
  ('Đại học Deakin', 'Úc', 7.0, 6.0),
  ('Đại học Swinburne', 'Úc', 7.0, 6.0),
  ('Đại học Melbourne', 'Úc', 8.5, 7.0),
  ('Đại học Auckland', 'New Zealand', 7.5, 6.5);
