import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id in request body" });
  }

  const { error } = await supabase
    .from("users")
    .update({ is_admin: true })
    .eq("id", user_id);

  if (error) {
    return res.status(500).json({ message: "Failed to promote user", error });
  }

  return res.status(200).json({ message: "User successfully promoted to admin" });
}
