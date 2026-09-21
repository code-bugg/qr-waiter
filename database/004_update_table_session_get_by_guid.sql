INSERT INTO table_sessions (
    session_guid,
    session_start_time,
    session_expiration_time,
    session_status,
    table_id,
    order_id,
    waiter_user_id
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    'Active',
    4,
    NULL,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Active',
    5,
    NULL,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Expired',
    6,
    NULL,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Closed',
    7,
    99,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440008',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Cancelled',
    8,
    NULL,
    NULL
)
ON CONFLICT (session_guid) DO NOTHING;

CREATE OR REPLACE FUNCTION table_session_get_by_guid(
    p_session_guid UUID
)
RETURNS TABLE (
    table_session_id BIGINT,
    session_guid UUID,
    session_start_time TIMESTAMPTZ,
    session_expiration_time TIMESTAMPTZ,
    session_status VARCHAR(20),
    table_id BIGINT,
    order_id BIGINT,
    waiter_user_id BIGINT
)
LANGUAGE SQL
AS $$
    SELECT
        ts.table_session_id,
        ts.session_guid,
        ts.session_start_time,
        ts.session_expiration_time,
        CASE
            WHEN ts.session_status = 'Active' AND ts.session_expiration_time <= CURRENT_TIMESTAMP THEN 'Expired'
            ELSE ts.session_status
        END AS session_status,
        ts.table_id,
        ts.order_id,
        ts.waiter_user_id
    FROM table_sessions AS ts
    WHERE ts.session_guid = p_session_guid;
$$;
