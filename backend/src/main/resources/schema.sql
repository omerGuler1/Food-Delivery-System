-- Message tablosu
CREATE TABLE IF NOT EXISTS message (
    message_id SERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    sender_type VARCHAR(20) CHECK (sender_type IN ('CUSTOMER', 'ADMIN', 'RESTAURANT', 'COURIER')),
    receiver_type VARCHAR(20) CHECK (receiver_type IN ('CUSTOMER', 'ADMIN', 'RESTAURANT', 'COURIER')),
    message_content TEXT NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('REQUEST', 'SUGGESTION', 'COMPLAINT', 'WARNING')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
); 