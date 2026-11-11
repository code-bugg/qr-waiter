ALTER TABLE table_sessions
    ADD COLUMN waiter_auth0_subject VARCHAR(255) NULL;

UPDATE table_sessions AS older
SET session_status = 'Expired'
WHERE older.session_status = 'Active'
  AND EXISTS (
      SELECT 1
      FROM table_sessions AS newer
      WHERE newer.table_id = older.table_id
        AND newer.session_status = 'Active'
        AND newer.table_session_id > older.table_session_id
  );

CREATE UNIQUE INDEX ux_table_sessions_one_active_per_table
    ON table_sessions (table_id)
    WHERE session_status = 'Active';

DROP FUNCTION table_session_get_by_guid(UUID);

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
    waiter_user_id BIGINT,
    waiter_auth0_subject VARCHAR(255)
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
        ts.waiter_user_id,
        ts.waiter_auth0_subject
    FROM table_sessions AS ts
    WHERE ts.session_guid = p_session_guid;
$$;
