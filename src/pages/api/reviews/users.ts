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

    if (!user?.is_admin) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const { data, error } = await supabase
      .from("resort_reviews")
      .select("id, rating, review, created_at, resort_id, user_id, users(first_name), ski_resorts(name)")
      .order("resort_id", { ascending: true });

    if (error) {
      console.error("Error fetching user reviews:", error.message);
      return res.status(500).json({ message: "Error fetching user reviews" });
    }

    return res.status(200).json({ reviews: data });
  });
}
