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
            WHEN ts.session_status = 'Active'
             AND ts.session_expiration_time <= CURRENT_TIMESTAMP
                THEN 'Expired'
            ELSE ts.session_status
        END AS session_status,
        ts.table_id,
        ts.order_id,
        ts.waiter_user_id
    FROM table_sessions AS ts
    WHERE ts.session_guid = p_session_guid;
$$;
