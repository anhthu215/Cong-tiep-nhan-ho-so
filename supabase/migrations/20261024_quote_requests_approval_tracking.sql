-- Đã áp dụng lên project Supabase; lưu lại để tái tạo database.
-- approved_at: thời điểm admin bấm Duyệt.
-- approval_notified_at: thời điểm gửi thành công thông báo duyệt sang Make (rỗng nghĩa là cần gửi lại).
alter table public.quote_requests
  add column approved_at timestamptz,
  add column approval_notified_at timestamptz;
