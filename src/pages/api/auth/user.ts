import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabase";
import { parse } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.supabaseToken;

  if (!token) {
    return res.status(401).json({ message: "No active session" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: "Unauthorized", error });
  }

  res.status(200).json({ user: data.user });
}