export type WorkType = 'file' | 'link';

export interface Member {
  id: string;
  auth_user_id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Work {
  id: string;
  member_id: string;
  title: string;
  type: WorkType;
  file_url: string | null;
  embed_url: string | null;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  members?: Member;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}

export interface Comment {
  id: string;
  work_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
