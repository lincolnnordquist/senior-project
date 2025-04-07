import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const supabase = createPagesServerClient({ req, res });
  const resort_id = req.query.resort_id as string;

  if (!resort_id) {
    return res.status(400).json({ message: "Missing resort ID" });
  }

  const { data, error } = await supabase
    .from("resort_reviews")
    .select("id, user_id, rating, review, resort_id, created_at, users(first_name)")
    .eq("resort_id", resort_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching resort reviews:", error);
    return res.status(500).json({ message: "Error fetching resort reviews" });
  }

  return res.status(200).json({ reviews: data });
}
