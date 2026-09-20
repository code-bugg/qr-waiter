CREATE TABLE table_sessions (
    table_session_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_guid UUID NOT NULL UNIQUE,
    session_start_time TIMESTAMPTZ NOT NULL,
    session_expiration_time TIMESTAMPTZ NOT NULL,
    session_status VARCHAR(20) NOT NULL
        CHECK (session_status IN ('Active', 'Expired', 'Closed', 'Cancelled')),
    table_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    waiter_user_id BIGINT NULL,
    CONSTRAINT chk_table_session_times
        CHECK (session_expiration_time > session_start_time)
);