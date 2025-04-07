import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const supabase = createPagesServerClient({ req, res });
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  return res.status(200).json({ message: "User logged in!", user: data.user });
}