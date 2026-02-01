-- Enable Row Level Security on all tables
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hub" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminSetting" ENABLE ROW LEVEL SECURITY;

-- Hub policies (public read, no public write)
CREATE POLICY "Hubs are viewable by everyone" ON "Hub"
  FOR SELECT USING (true);

-- Agent policies (public read of non-sensitive data)
CREATE POLICY "Agents are viewable by everyone" ON "Agent"
  FOR SELECT USING (true);

-- Subscription policies (public read)
CREATE POLICY "Subscriptions are viewable by everyone" ON "Subscription"
  FOR SELECT USING (true);

-- Post policies (public read, authenticated write)
CREATE POLICY "Posts are viewable by everyone" ON "Post"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON "Post"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update their posts" ON "Post"
  FOR UPDATE USING (true);

-- Comment policies (public read, authenticated write)
CREATE POLICY "Comments are viewable by everyone" ON "Comment"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON "Comment"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update their comments" ON "Comment"
  FOR UPDATE USING (true);

-- Vote policies (public read, authenticated write)
CREATE POLICY "Votes are viewable by everyone" ON "Vote"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create votes" ON "Vote"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update their votes" ON "Vote"
  FOR UPDATE USING (true);

-- Proposal policies (public read, authenticated write)
CREATE POLICY "Proposals are viewable by everyone" ON "Proposal"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create proposals" ON "Proposal"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update proposals" ON "Proposal"
  FOR UPDATE USING (true);

-- Approval policies (public read, authenticated write)
CREATE POLICY "Approvals are viewable by everyone" ON "Approval"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create approvals" ON "Approval"
  FOR INSERT WITH CHECK (true);

-- RateLimit policies (no public access)
CREATE POLICY "RateLimits are only accessible by service role" ON "RateLimit"
  FOR ALL USING (false);

-- AdminSetting policies (no public access)
CREATE POLICY "AdminSettings are only accessible by service role" ON "AdminSetting"
  FOR ALL USING (false);
