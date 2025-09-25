-- Content Distribution Pipeline Database Schema
-- MongoDB Collections represented as SQL-like schema for documentation
-- This file serves as a reference for MongoDB collection structures

-- =====================================================
-- USERS COLLECTION
-- =====================================================

-- Users collection schema
CREATE TABLE users (
    _id OBJECTID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    profile JSONB NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    subscription JSONB NOT NULL DEFAULT '{}',
    usage_stats JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP
);

-- User profile structure (embedded in users.profile)
-- {
--   "name": "John Doe",
--   "avatar": "https://example.com/avatar.jpg",
--   "bio": "Content creator and marketer",
--   "company": "Tech Corp",
--   "website": "https://johndoe.com",
--   "social_links": {
--     "twitter": "@johndoe",
--     "linkedin": "johndoe",
--     "instagram": "johndoe"
--   }
-- }

-- User preferences structure (embedded in users.preferences)
-- {
--   "default_platforms": ["twitter", "linkedin"],
--   "tone_preference": "professional",
--   "language": "en",
--   "timezone": "UTC",
--   "notifications": {
--     "email": true,
--     "push": false
--   }
-- }

-- User subscription structure (embedded in users.subscription)
-- {
--   "plan": "free", -- free, pro, enterprise
--   "status": "active",
--   "credits_remaining": 100,
--   "credits_total": 100,
--   "billing_cycle": "monthly",
--   "next_billing_date": "2024-01-01T00:00:00Z",
--   "stripe_customer_id": "cus_xxxxx"
-- }

-- Indexes for users collection
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_subscription_plan ON users((subscription->>'plan'));

-- =====================================================
-- CONTENT COLLECTION
-- =====================================================

CREATE TABLE content (
    _id OBJECTID PRIMARY KEY,
    user_id OBJECTID NOT NULL REFERENCES users(_id),
    original_content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text', -- text, image, video
    platforms TEXT[] NOT NULL, -- ['twitter', 'linkedin', 'instagram', 'newsletter']
    adapted_content JSONB NOT NULL DEFAULT '{}',
    sentiment JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    processing_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Adapted content structure (embedded in content.adapted_content)
-- {
--   "twitter": {
--     "tweets": ["Tweet 1/3: Content here...", "Tweet 2/3: More content..."],
--     "hashtags": ["#marketing", "#content"],
--     "character_count": 280,
--     "thread_count": 3,
--     "engagement_prediction": 0.75
--   },
--   "linkedin": {
--     "post": "Professional post content here...",
--     "hashtags": ["#professional", "#business"],
--     "character_count": 1200,
--     "engagement_prediction": 0.68
--   },
--   "instagram": {
--     "caption": "Visual caption with emojis ✨",
--     "hashtags": ["#visual", "#creative"],
--     "character_count": 500,
--     "engagement_prediction": 0.82
--   },
--   "newsletter": {
--     "subject": "Weekly Newsletter Subject",
--     "content": "Full newsletter content...",
--     "preview": "Preview text...",
--     "estimated_read_time": 5
--   }
-- }

-- Sentiment analysis structure (embedded in content.sentiment)
-- {
--   "score": 0.75, -- -1 to 1
--   "label": "positive", -- positive, neutral, negative
--   "confidence": 0.85,
--   "emotions": {
--     "joy": 0.7,
--     "anger": 0.1,
--     "fear": 0.05,
--     "sadness": 0.1,
--     "surprise": 0.05
--   },
--   "keywords": ["success", "growth", "achievement"],
--   "tone": "professional"
-- }

-- Content metadata structure (embedded in content.metadata)
-- {
--   "word_count": 150,
--   "reading_time": 2,
--   "language": "en",
--   "topics": ["marketing", "social media"],
--   "ai_model_used": "gpt-4",
--   "processing_time_ms": 1500,
--   "version": "1.0"
-- }

-- Indexes for content collection
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_created_at ON content(created_at);
CREATE INDEX idx_content_platforms ON content USING GIN(platforms);
CREATE INDEX idx_content_processing_status ON content(processing_status);
CREATE INDEX idx_content_is_favorite ON content(is_favorite);
CREATE INDEX idx_content_is_archived ON content(is_archived);
CREATE INDEX idx_content_tags ON content USING GIN(tags);
CREATE INDEX idx_content_sentiment_label ON content((sentiment->>'label'));

-- =====================================================
-- ANALYTICS COLLECTION
-- =====================================================

CREATE TABLE analytics (
    _id OBJECTID PRIMARY KEY,
    user_id OBJECTID NOT NULL REFERENCES users(_id),
    content_id OBJECTID REFERENCES content(_id),
    event_type VARCHAR(50) NOT NULL, -- content_created, content_viewed, content_copied, platform_selected
    platform VARCHAR(50), -- twitter, linkedin, instagram, newsletter
    event_data JSONB NOT NULL DEFAULT '{}',
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20), -- desktop, mobile, tablet
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event data structure examples (embedded in analytics.event_data)
-- For content_created:
-- {
--   "platforms_count": 3,
--   "original_length": 150,
--   "processing_time_ms": 1200,
--   "sentiment_score": 0.75
-- }

-- For content_copied:
-- {
--   "platform": "twitter",
--   "content_type": "thread",
--   "character_count": 280
-- }

-- Indexes for analytics collection
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_content_id ON analytics(content_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_session_id ON analytics(session_id);

-- =====================================================
-- PLATFORMS COLLECTION
-- =====================================================

CREATE TABLE platforms (
    _id OBJECTID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- twitter, linkedin, instagram, newsletter
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    templates JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform configuration structure (embedded in platforms.config)
-- {
--   "icon": "twitter-icon.svg",
--   "color": "#1DA1F2",
--   "api_endpoints": {
--     "post": "https://api.twitter.com/2/tweets",
--     "validate": "https://api.twitter.com/2/tweets/validate"
--   },
--   "formatting_rules": {
--     "hashtag_limit": 5,
--     "mention_limit": 10,
--     "thread_numbering": true
--   }
-- }

-- Platform limits structure (embedded in platforms.limits)
-- {
--   "character_limit": 280,
--   "hashtag_limit": 5,
--   "image_limit": 4,
--   "video_limit": 1,
--   "thread_limit": 25
-- }

-- Platform templates structure (embedded in platforms.templates)
-- {
--   "default": "{{content}}",
--   "with_hashtags": "{{content}}\n\n{{hashtags}}",
--   "thread": "{{thread_number}}/{{total_threads}} {{content}}"
-- }

-- Indexes for platforms collection
CREATE INDEX idx_platforms_name ON platforms(name);
CREATE INDEX idx_platforms_is_active ON platforms(is_active);

-- =====================================================
-- TEMPLATES COLLECTION
-- =====================================================

CREATE TABLE templates (
    _id OBJECTID PRIMARY KEY,
    user_id OBJECTID REFERENCES users(_id), -- NULL for system templates
    name VARCHAR(100) NOT NULL,
    description TEXT,
    platform VARCHAR(50) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    category VARCHAR(50), -- business, personal, marketing, etc.
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template variables structure (embedded in templates.variables)
-- [
--   {
--     "name": "company_name",
--     "type": "string",
--     "required": true,
--     "description": "Your company name"
--   },
--   {
--     "name": "cta_text",
--     "type": "string",
--     "required": false,
--     "default": "Learn more",
--     "description": "Call to action text"
--   }
-- ]

-- Indexes for templates collection
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_platform ON templates(platform);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_templates_is_system ON templates(is_system);

-- =====================================================
-- API_KEYS COLLECTION
-- =====================================================

CREATE TABLE api_keys (
    _id OBJECTID PRIMARY KEY,
    user_id OBJECTID NOT NULL REFERENCES users(_id),
    key_name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL, -- hashed API key
    permissions JSONB NOT NULL DEFAULT '[]',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions structure (embedded in api_keys.permissions)
-- [
--   "content:create",
--   "content:read",
--   "analytics:read"
-- ]

-- Indexes for api_keys collection
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(api_key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- =====================================================
-- USAGE_LOGS COLLECTION
-- =====================================================

CREATE TABLE usage_logs (
    _id OBJECTID PRIMARY KEY,
    user_id OBJECTID NOT NULL REFERENCES users(_id),
    action VARCHAR(50) NOT NULL, -- content_generation, sentiment_analysis, api_call
    credits_used INTEGER DEFAULT 1,
    api_key_id OBJECTID REFERENCES api_keys(_id),
    request_data JSONB,
    response_data JSONB,
    processing_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success', -- success, error, timeout
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for usage_logs collection
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_action ON usage_logs(action);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_status ON usage_logs(status);

-- =====================================================
-- NOTIFICATIONS COLLECTION
-- =====================================================

CREATE TABLE notifications (
    _id OBJECTID PRIMARY KEY,
    user_id OBJECTID NOT NULL REFERENCES users(_id),
    type VARCHAR(50) NOT NULL, -- credit_low, processing_complete, system_update
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications collection
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- SYSTEM_SETTINGS COLLECTION
-- =====================================================

CREATE TABLE system_settings (
    _id OBJECTID PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example system settings:
-- {
--   "key": "openai_api_config",
--   "value": {
--     "model": "gpt-4",
--     "max_tokens": 2000,
--     "temperature": 0.7
--   }
-- }

-- Indexes for system_settings collection
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);

-- =====================================================
-- SAMPLE DATA INSERTS
-- =====================================================

-- Insert default platforms
INSERT INTO platforms (name, display_name, description, config, limits, templates) VALUES
('twitter', 'Twitter', 'Microblogging platform for short-form content', 
 '{"icon": "twitter", "color": "#1DA1F2", "formatting_rules": {"hashtag_limit": 5, "thread_numbering": true}}',
 '{"character_limit": 280, "hashtag_limit": 5, "thread_limit": 25}',
 '{"default": "{{content}}", "thread": "{{thread_number}}/{{total_threads}} {{content}}"}'),

('linkedin', 'LinkedIn', 'Professional networking platform', 
 '{"icon": "linkedin", "color": "#0077B5", "formatting_rules": {"professional_tone": true}}',
 '{"character_limit": 3000, "hashtag_limit": 10}',
 '{"default": "{{content}}", "professional": "I wanted to share some thoughts on {{topic}}:\n\n{{content}}\n\nWhat are your thoughts?"}'),

('instagram', 'Instagram', 'Visual content sharing platform', 
 '{"icon": "instagram", "color": "#E4405F", "formatting_rules": {"emoji_friendly": true}}',
 '{"character_limit": 2200, "hashtag_limit": 30}',
 '{"default": "{{content}}", "visual": "{{emoji}} {{content}} {{emoji}}\n\n{{hashtags}}"}'),

('newsletter', 'Newsletter', 'Email newsletter format', 
 '{"icon": "mail", "color": "#6366F1", "formatting_rules": {"email_structure": true}}',
 '{"subject_limit": 100, "preview_limit": 150}',
 '{"default": "Subject: {{subject}}\n\n{{content}}", "formal": "Dear Subscriber,\n\n{{content}}\n\nBest regards,\nThe Team"}');

-- Insert system templates
INSERT INTO templates (name, description, platform, template_content, variables, category, is_system) VALUES
('Product Launch', 'Template for announcing new products', 'twitter', 
 '🚀 Excited to announce {{product_name}}!\n\n{{description}}\n\n{{cta}} {{link}}',
 '[{"name": "product_name", "type": "string", "required": true}, {"name": "description", "type": "string", "required": true}, {"name": "cta", "type": "string", "default": "Learn more:"}, {"name": "link", "type": "string", "required": true}]',
 'business', true),

('Thought Leadership', 'Professional insights template', 'linkedin',
 'I''ve been reflecting on {{topic}} lately.\n\n{{insight}}\n\nKey takeaways:\n{{takeaways}}\n\nWhat''s your experience with this? I''d love to hear your thoughts in the comments.\n\n#ThoughtLeadership {{hashtags}}',
 '[{"name": "topic", "type": "string", "required": true}, {"name": "insight", "type": "string", "required": true}, {"name": "takeaways", "type": "string", "required": true}, {"name": "hashtags", "type": "string", "required": false}]',
 'professional', true);

-- Insert system settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
('openai_config', '{"model": "gpt-4", "max_tokens": 2000, "temperature": 0.7}', 'OpenAI API configuration', false),
('rate_limits', '{"free": 10, "pro": 100, "enterprise": 1000}', 'API rate limits per plan', false),
('supported_languages', '["en", "es", "fr", "de", "it", "pt", "zh", "ja", "ko"]', 'Supported content languages', true),
('platform_status', '{"twitter": true, "linkedin": true, "instagram": true, "newsletter": true}', 'Platform availability status', true);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User content summary view
CREATE VIEW user_content_summary AS
SELECT 
    u._id as user_id,
    u.email,
    COUNT(c._id) as total_content,
    COUNT(CASE WHEN c.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as content_last_30_days,
    COUNT(CASE WHEN c.is_favorite = true THEN 1 END) as favorite_content,
    ARRAY_AGG(DISTINCT unnest(c.platforms)) as used_platforms
FROM users u
LEFT JOIN content c ON u._id = c.user_id
WHERE u.is_active = true
GROUP BY u._id, u.email;

-- Platform usage statistics view
CREATE VIEW platform_usage_stats AS
SELECT 
    platform,
    COUNT(*) as usage_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG((sentiment->>'score')::float) as avg_sentiment_score,
    DATE_TRUNC('day', created_at) as usage_date
FROM content
CROSS JOIN UNNEST(platforms) as platform
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY platform, DATE_TRUNC('day', created_at)
ORDER BY usage_date DESC, usage_count DESC;

-- =====================================================
-- STORED PROCEDURES / FUNCTIONS
-- =====================================================

-- Function to update user credit usage
CREATE OR REPLACE FUNCTION update_user_credits(
    p_user_id OBJECTID,
    p_credits_used INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        usage_stats = jsonb_set(
            usage_stats, 
            '{credits_remaining}', 
            ((usage_stats->>'credits_remaining')::int - p_credits_used)::text::jsonb
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE _id = p_user_id 
    AND (usage_stats->>'credits_remaining')::int >= p_credits_used;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(
    p_user_id OBJECTID,
    p_days INTEGER DEFAULT 30
) RETURNS TABLE (
    total_content INTEGER,
    total_platforms INTEGER,
    avg_sentiment FLOAT,
    most_used_platform TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(c._id)::INTEGER as total_content,
        COUNT(DISTINCT unnest(c.platforms))::INTEGER as total_platforms,
        AVG((c.sentiment->>'score')::float) as avg_sentiment,
        (
            SELECT platform 
            FROM content 
            CROSS JOIN UNNEST(platforms) as platform 
            WHERE user_id = p_user_id 
            AND created_at >= NOW() - (p_days || ' days')::INTERVAL
            GROUP BY platform 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as most_used_platform
    FROM content c
    WHERE c.user_id = p_user_id
    AND c.created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update user stats when content is created
CREATE OR REPLACE FUNCTION update_user_stats_on_content_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user usage stats
    UPDATE users 
    SET 
        usage_stats = jsonb_set(
            jsonb_set(
                usage_stats,
                '{total_content}',
                (COALESCE((usage_stats->>'total_content')::int, 0) + 1)::text::jsonb
            ),
            '{last_content_created}',
            to_jsonb(NEW.created_at)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE _id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_on_content_creation
    AFTER INSERT ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_content_creation();

-- =====================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- =====================================================

-- 1. Compound indexes for common query patterns:
--    - (user_id, created_at) for user content history
--    - (user_id, is_favorite) for favorite content
--    - (platforms, sentiment.label) for platform sentiment analysis

-- 2. Partial indexes for active records:
--    - WHERE is_active = true for users
--    - WHERE processing_status = 'completed' for content

-- 3. Text search indexes:
--    - Full-text search on content.original_content
--    - Search indexes on tags and keywords

-- 4. Time-series optimization:
--    - Partition analytics table by month
--    - Archive old usage_logs data

-- 5. Caching strategy:
--    - Redis cache for user sessions
--    - Cache platform configurations
--    - Cache system settings

-- =====================================================
-- BACKUP AND MAINTENANCE
-- =====================================================

-- Regular maintenance tasks:
-- 1. VACUUM ANALYZE on all tables weekly
-- 2. REINDEX on heavily used indexes monthly  
-- 3. Archive analytics data older than 1 year
-- 4. Clean up expired API keys and notifications
-- 5. Update usage statistics and aggregations

-- Backup strategy:
-- 1. Daily full database backup
-- 2. Point-in-time recovery enabled
-- 3. Cross-region backup replication
-- 4. Test restore procedures monthly