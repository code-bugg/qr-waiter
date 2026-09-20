INSERT INTO table_sessions (
    session_guid,
    session_start_time,
    session_expiration_time,
    session_status,
    table_id,
    order_id,
    waiter_user_id
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '2026-09-14 10:00:00+03',
    '2026-09-14 12:00:00+03',
    'Active',
    1,
    NULL,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '2026-09-13 10:00:00+03',
    '2026-09-13 12:00:00+03',
    'Expired',
    2,
    NULL,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '2026-09-12 18:00:00+03',
    '2026-09-12 20:00:00+03',
    'Closed',
    3,
    42,
    7
);