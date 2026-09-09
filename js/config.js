/*
  CCP Confession configuration.
  1. Create a Supabase project.
  2. Put your Project URL and anon/public key below.
  3. NEVER put a service_role key in these files.
*/
window.CCP_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};

window.ccpReady = window.CCP_CONFIG.SUPABASE_URL.startsWith("http") &&
                  !window.CCP_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_");

window.ccp = window.ccpReady
  ? window.supabase.createClient(window.CCP_CONFIG.SUPABASE_URL, window.CCP_CONFIG.SUPABASE_ANON_KEY)
  : null;
