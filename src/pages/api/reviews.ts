import { NextApiResponse } from "next";
import { checkAuth } from "../../middleware/authMiddleware";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest } from "../../types/next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await checkAuth(req, res, async () => {
    const { resort_id, rating, review } = req.body;

    if (!resort_id || (!rating && !review)) {
      return res.status(400).json({ message: "Invalid request. A rating or review is required." });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // insert review/rating into supabase
    const { data, error } = await supabase
      .from("resort_reviews")
      .insert([{ user_id: req.user.id, resort_id, rating, review }]);

    if (error) {
      return res.status(500).json({ message: "Error adding review", error: error.message });
    }

    return res.status(201).json({ message: "Review added successfully", data });
  });
}