-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create hubspot_accounts table
CREATE TABLE hubspot_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    portal_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, portal_id)
);

-- Create page_metadata table
CREATE TABLE page_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hubspot_id TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES hubspot_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    template TEXT NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hubspot_id, account_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_hubspot_accounts_updated_at
    BEFORE UPDATE ON hubspot_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_metadata_updated_at
    BEFORE UPDATE ON page_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_hubspot_accounts_user_id ON hubspot_accounts(user_id);
CREATE INDEX idx_page_metadata_account_id ON page_metadata(account_id);
CREATE INDEX idx_page_metadata_hubspot_id ON page_metadata(hubspot_id);

-- Set up Row Level Security (RLS)
ALTER TABLE hubspot_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for hubspot_accounts
CREATE POLICY "Users can view their own HubSpot accounts"
    ON hubspot_accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HubSpot accounts"
    ON hubspot_accounts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HubSpot accounts"
    ON hubspot_accounts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HubSpot accounts"
    ON hubspot_accounts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for page_metadata
CREATE POLICY "Users can view pages from their HubSpot accounts"
    ON page_metadata FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hubspot_accounts
            WHERE hubspot_accounts.id = page_metadata.account_id
            AND hubspot_accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert pages for their HubSpot accounts"
    ON page_metadata FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hubspot_accounts
            WHERE hubspot_accounts.id = account_id
            AND hubspot_accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update pages from their HubSpot accounts"
    ON page_metadata FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hubspot_accounts
            WHERE hubspot_accounts.id = page_metadata.account_id
            AND hubspot_accounts.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hubspot_accounts
            WHERE hubspot_accounts.id = account_id
            AND hubspot_accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete pages from their HubSpot accounts"
    ON page_metadata FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hubspot_accounts
            WHERE hubspot_accounts.id = page_metadata.account_id
            AND hubspot_accounts.user_id = auth.uid()
        )
    );