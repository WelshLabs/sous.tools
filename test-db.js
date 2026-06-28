import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://localhost:54321", // assuming default local supabase
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndXhrb3Brd3FtdHpieHBwbHR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjIyMjIyMiwiZXhwIjoyMDMxODIyMjIyfQ.abcdefghijklmnopqrstuvwxyz1234567890" // fake, let's read the real one
);
