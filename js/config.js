/*
  CCP Confession configuration.
  Supabase connection settings.
*/

window.CCP_CONFIG = {
  SUPABASE_URL: "https://rhqnexewgoomsyjfhbmn.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_LU1siU4EygayZPfhk3n3ig_FOtovKCY"
};

window.ccpReady =
  window.CCP_CONFIG.SUPABASE_URL.startsWith("http") &&
  !window.CCP_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_");

window.ccp = window.ccpReady
  ? window.supabase.createClient(
      window.CCP_CONFIG.SUPABASE_URL,
      window.CCP_CONFIG.SUPABASE_ANON_KEY
    )
  : null;