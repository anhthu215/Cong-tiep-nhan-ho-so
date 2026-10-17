-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.scholarship_suggestions (
  profile_id uuid primary key references public.student_profiles(id) on delete cascade,
  input_hash text not null,
  suggestion text not null,
  schools_looked_up text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Dữ liệu riêng tư (gợi ý dựa trên hồ sơ học viên): bật RLS, KHÔNG tạo policy,
-- thu hồi quyền của anon/authenticated. Chỉ server (secret key) truy cập được.
alter table public.scholarship_suggestions enable row level security;
revoke all on public.scholarship_suggestions from anon, authenticated;
