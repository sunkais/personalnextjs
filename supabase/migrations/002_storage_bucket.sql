-- 创建 works 存储桶（公开读取）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'works',
  'works',
  true,
  52428800,  -- 50MB
  ARRAY['application/pdf','image/jpeg','image/png','image/gif','image/webp','text/markdown','text/plain']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 所有人可读
CREATE POLICY "works_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'works');

-- 仅创作者可上传（路径为 member_id/xxx）
CREATE POLICY "works_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'works' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM members WHERE auth_user_id = auth.uid()
    )
  );
