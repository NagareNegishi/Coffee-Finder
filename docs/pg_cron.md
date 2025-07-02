We want to set up monthly scheduled cleanup tasks in PostgreSQL.
While we could call the function from javascript, if we set it up in PostgreSQL, we don't have to worry about the scheduling logic in the application code.
For the scheduling, we will use **Cron**, a time-based job scheduler in Unix-like operating systems.
PostgreSQL has an extension called **pg_cron** that allows us to run scheduled jobs

## References to pg_cron
[pg_cron](https://github.com/citusdata/pg_cron)

## How to install pg_cron
[Install Supabase Cron](https://supabase.com/docs/guides/cron/install?queryGroups=database-method&database-method=sql)

In short, we need 3 steps:

1. Install the Supabase Cron Postgres Module to begin scheduling recurring Jobs.

    create extension pg_cron with schema pg_catalog;

    grant usage on schema cron to postgres;
    grant all privileges on all tables in schema cron to postgres;

2. Create a function that will perform the cleanup task.

    ```sql
    create or replace function do_something() returns void as $$
    begin
        -- Your cleanup logic here
        'Doing something...';
    end;
    $$ language plpgsql;
    ```

3. Create a cron job to run the cleanup function every month.

    -- Cron Job name cannot be edited
    select cron.schedule('permanent-cron-job-name', '30 seconds', 'CALL do_something()');


Note, how `COALESCE` works:

`COALESCE` returns the first non-null value in the list of arguments.
our coffee_shops table has `created_at` and `updated_at` columns,
`updated_at` can be null if the record has never been updated, but `created_at` will always have a value.
So, `COALESCE(updated_at, created_at)` will return `updated_at` if it is not null, otherwise it will return `created_at`.

## What time we should run the cleanup job?

We set the location in New Zealand,
The midnight of New Zealand is UTC +12 or UTC +13 depending on daylight saving time.
While the midnight is intuitively a good time to run the cleanup job, other applications may also run their monthly cleanup jobs at the same time.
So, we will run the cleanup job at 2 AM New Zealand time, which is UTC +14.
