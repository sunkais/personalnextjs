-- 允许用户更新自己的成员资料（昵称、简介）
CREATE POLICY "members_update" ON members FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
