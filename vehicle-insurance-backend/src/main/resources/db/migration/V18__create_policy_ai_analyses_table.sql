CREATE TABLE policy_ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    policy_number_extracted VARCHAR(255),
    insurer_extracted VARCHAR(255),
    policyholder_name_extracted VARCHAR(255),
    start_date_extracted VARCHAR(50),
    end_date_extracted VARCHAR(50),
    premium_extracted VARCHAR(100),
    payment_interval_extracted VARCHAR(50),
    idv_extracted VARCHAR(100),
    deductible_extracted VARCHAR(100),
    confidence DOUBLE PRECISION,
    raw_structured_result TEXT,
    conflicts TEXT,
    model_provider VARCHAR(100),
    analyzed_at TIMESTAMP WITH TIME ZONE,
    source_document_url VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_ai_analyses_policy_id ON policy_ai_analyses(policy_id);
