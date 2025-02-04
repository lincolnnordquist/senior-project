import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabase";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  res.setHeader(
    "Set-Cookie",
    serialize("supabaseToken", data.session?.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  );

  res.status(200).json({ message: "User logged in!" });
}