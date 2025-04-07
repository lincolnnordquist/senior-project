import { NextApiRequest, NextApiResponse } from "next";
import { checkAuth } from "../../../middleware/authMiddleware";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await checkAuth(req, res, async () => {
    const user = (req as any).user;

    const { data, error } = await supabase
      .from("resort_reviews")
      .select("id, resort_id, rating, review, created_at, updated_at")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user reviews:", error.message);
      return res.status(500).json({ message: "Error fetching user reviews" });
    }

    return res.status(200).json({ reviews: data });
  });
}