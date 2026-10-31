// Team backend (Supabase). Both values are public by design: the database only allows the checked
// functions in supabase/schema.sql. The same URL must also be listed in connect-src in index.html.
// Leave empty to run FitTrack without team features.
window.FITTRACK_CONFIG = {
  supabaseUrl: '',
  supabaseKey: '',
};
