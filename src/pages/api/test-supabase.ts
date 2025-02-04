import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Test database connection
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    return res.status(500).json({ message: "Error connecting to Supabase", error });
  }

  return res.status(200).json({ message: "Supabase is working!", data });
}