[Official Supabase Documentation](https://supabase.com/docs/reference/javascript/initializing)

Simply put initializing requires following steps:

1. **Install the Supabase JavaScript library**:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Import and initialize the Supabase client**:
   ```javascript
    import { createClient } from '@supabase/supabase-js';
    const supabaseUrl = ???????
    const supabaseKey = ???????
    const supabase = createClient(supabaseUrl, supabaseKey);


How to use the Supabase client:

supabase variable created from createClient() is supabase client object that you can use to interact with your Supabase project.

supabase.from('table_name')
    .select()          // Read data
    .insert()          // Insert new data
    .update()          // Update existing data
    .upsert()          // Insert or update
    .delete()          // Delete data

also it can use .rpc() to call remote procedures (functions) defined in your Supabase database.
how .rpc() works:
```javascript
    const { data, error } = await supabase
        .rpc('function_name', { param1: value1, param2: value2 });
    if (error) {
        console.error('Error calling function:', error);
    } else {
        console.log('Function result:', data);
    }
```