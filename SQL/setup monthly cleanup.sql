-- Install the Supabase Cron Postgres Module to begin scheduling recurring Jobs
-- This should run once, we could add a check to see if the extension exists
-- but this is a one-time setup script.
create extension pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Create a cleanup function that deletes old data
-- This function will delete all records older than 30 days from the specified table
CREATE OR REPLACE FUNCTION monthly_cleanup()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM coffee_shops
    WHERE COALESCE(updated_at, created_at) < (CURRENT_TIMESTAMP - INTERVAL '30 days');

    GET DIAGNOSTICS deleted_count = ROW_COUNT; -- ROW_COUNT is poor naming, but returns the number of rows affected by the last command
    RAISE NOTICE 'Deleted % records from coffee_shops table', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job that runs the cleanup function on the first day of every month at late night
--  ┌───────────── min (0 - 59)
--  │ ┌────────────── hour (0 - 23)
--  │ │ ┌─────────────── day of month (1 - 31) or last day of the month ($)
--  │ │ │ ┌──────────────── month (1 - 12)
--  │ │ │ │ ┌───────────────── day of week (0 - 6) (0 to 6 are Sunday to
--  │ │ │ │ │                  Saturday, or use names; 7 is also Sunday)
--  │ │ │ │ │
--  │ │ │ │ │
--  * * * * *
SELECT cron.schedule(
    'monthly_coffee_shop_cleanup', -- Job name
    '0 14 1 * *', -- Schedule: UTC 14:00 on the first day of every month
    'SELECT monthly_cleanup()'
);