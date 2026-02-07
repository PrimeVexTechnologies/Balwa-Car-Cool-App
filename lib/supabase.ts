import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = "https://ofdugxevyhkjvegqiyeg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHVneGV2eWhranZlZ3FpeWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDA2MjAsImV4cCI6MjA4NTMxNjYyMH0.9KDcLmpJSZgx8Nm4a2RAXtDKPniCAckbTqft3ck67Pw";

const isWeb = Platform.OS === "web";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: !isWeb,
    persistSession: !isWeb,
    detectSessionInUrl: isWeb,
  },
});
