-- 四人学习分享网站 - 初始数据库结构

-- 成员表（4位创作者）
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 作品表
CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'link')),
  file_url TEXT,
  embed_url TEXT,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT works_url_check CHECK (
    (type = 'file' AND file_url IS NOT NULL) OR
    (type = 'link' AND embed_url IS NOT NULL)
  )
);

-- 点赞表
CREATE TABLE likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, work_id)
);

-- 收藏表
CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, work_id)
);

-- 评论表（单层，MVP）
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX works_member_id ON works(member_id);
CREATE INDEX works_created_at ON works(created_at DESC);
CREATE INDEX likes_work_id ON likes(work_id);
CREATE INDEX favorites_user_id ON favorites(user_id);
CREATE INDEX comments_work_id ON comments(work_id);

-- RLS 策略
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- members: 所有人可读
CREATE POLICY "members_read" ON members FOR SELECT USING (true);

-- works: 所有人可读
CREATE POLICY "works_read" ON works FOR SELECT USING (true);
-- 仅创作者可写（需通过 auth_user_id 与 member 关联）
CREATE POLICY "works_insert" ON works FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );
CREATE POLICY "works_update" ON works FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );
CREATE POLICY "works_delete" ON works FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- likes: 登录用户可增删自己的
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- favorites: 同上
CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- comments: 所有人可读，登录用户可写
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
