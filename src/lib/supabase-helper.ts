import { supabase } from "@/integrations/supabase/client";

// Helper to bypass type checking until Supabase types are regenerated
export const supabaseClient = supabase as any;
