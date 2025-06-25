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