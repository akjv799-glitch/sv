/*
  # Create Anonymous Forum Database Schema

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `nickname` (text) - Anonymous user's chosen nickname
      - `avatar_seed` (text) - Seed for generating consistent avatar
      - `content` (text) - Post content
      - `created_at` (timestamptz) - Post creation time
      - `expires_at` (timestamptz) - Auto-calculated expiration (24 hours from creation)
    
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key) - Reference to parent post
      - `nickname` (text) - Anonymous commenter's nickname
      - `avatar_seed` (text) - Seed for generating consistent avatar
      - `content` (text) - Comment content
      - `created_at` (timestamptz) - Comment creation time

  2. Security
    - Enable RLS on both tables
    - Allow public read access (anonymous users can view)
    - Allow public insert access (anonymous users can post/comment)
    - Restrict delete to authenticated users only (admin)
    
  3. Important Notes
    - Posts automatically expire after 24 hours
    - Avatar seeds ensure consistent avatars for each post/comment
    - No user authentication required for posting (truly anonymous)
    - Only authenticated admin can delete posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  avatar_seed text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  avatar_seed text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create posts"
  ON posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS posts_expires_at_idx ON posts(expires_at);
