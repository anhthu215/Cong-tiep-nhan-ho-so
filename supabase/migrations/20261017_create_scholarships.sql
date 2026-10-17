-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_id uuid not null references public.schools(id) on delete cascade,
  min_gpa numeric(3,1) check (min_gpa between 0 and 10),
  min_ielts numeric(2,1) check (min_ielts between 0 and 9),
  support_type text not null check (support_type in ('percent_tuition', 'full')),
  support_percent numeric(5,2) check (support_percent > 0 and support_percent <= 100),
  created_at timestamptz not null default now(),
  unique (school_id, name),
  -- phải có ít nhất một điều kiện (điểm học tập hoặc IELTS)
  check (min_gpa is not null or min_ielts is not null),
  -- hỗ trợ theo % học phí thì bắt buộc có phần trăm; toàn phần thì không cần
  check ((support_type = 'percent_tuition' and support_percent is not null) or (support_type = 'full' and support_percent is null))
);

create index scholarships_school_id_idx on public.scholarships (school_id);

-- Dữ liệu công khai: ai cũng đọc được (anon + authenticated), nhưng chỉ server
-- (secret key, bỏ qua RLS) mới ghi được.
alter table public.scholarships enable row level security;

revoke all on public.scholarships from anon, authenticated;
grant select on public.scholarships to anon, authenticated;

create policy "Public can read scholarships"
  on public.scholarships for select
  to anon, authenticated
  using (true);

insert into public.scholarships (name, school_id, min_gpa, min_ielts, support_type, support_percent)
select v.name, s.id, v.min_gpa, v.min_ielts, v.support_type, v.support_percent
from (values
  ('Merit Deakin',             'Đại học Deakin',     8.0::numeric, null::numeric, 'percent_tuition', 25::numeric),
  ('Global Excellence',        'Đại học Swinburne',  null,         7.0,           'percent_tuition', 20),
  ('Chancellor''s Scholarship','Đại học Melbourne',  9.0,          null,          'full',            null),
  ('International Excellence', 'Đại học Auckland',   7.5,          null,          'percent_tuition', 15)
) as v(name, school_name, min_gpa, min_ielts, support_type, support_percent)
join public.schools s on s.name = v.school_name;
