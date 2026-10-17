-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  session_token_hash text not null unique,
  upload_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.student_documents (
  profile_id uuid not null references public.student_profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('transcript', 'ielts', 'id_document')),
  status text not null check (status in ('hop_le', 'can_nop_lai')),
  rejection_reason text,
  file_name text,
  full_name text,
  date_of_birth date,
  gpa numeric(4,2) check (gpa >= 0),
  gpa_scale numeric(4,1) check (gpa_scale > 0),
  ielts_listening numeric(2,1) check (ielts_listening between 0 and 9),
  ielts_reading numeric(2,1) check (ielts_reading between 0 and 9),
  ielts_writing numeric(2,1) check (ielts_writing between 0 and 9),
  ielts_speaking numeric(2,1) check (ielts_speaking between 0 and 9),
  ielts_overall numeric(2,1) check (ielts_overall between 0 and 9),
  ielts_exam_date date,
  id_number text,
  uploaded_at timestamptz not null default now(),
  primary key (profile_id, doc_type)
);

-- Dữ liệu riêng tư (CMND/hộ chiếu, ngày sinh...): bật RLS, KHÔNG tạo policy,
-- thu hồi quyền của anon/authenticated. Chỉ server (secret key) truy cập được.
alter table public.student_profiles enable row level security;
alter table public.student_documents enable row level security;

revoke all on public.student_profiles from anon, authenticated;
revoke all on public.student_documents from anon, authenticated;
