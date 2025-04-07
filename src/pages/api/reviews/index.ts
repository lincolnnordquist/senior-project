import { NextApiRequest, NextApiResponse } from "next";
import { checkAuth } from "../../../middleware/authMiddleware";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await checkAuth(req, res, async () => {
    const user = (req as any).user;
    const { resort_id, rating, review } = req.body;

    if (!resort_id) {
      return res.status(400).json({ message: "Missing resort_id in request body." });
    }

    if (!rating && !review) {
      return res.status(400).json({ message: "Either rating or review must be provided." });
    }

    // check if review already exists here
    const { data: existingReview, error: fetchError } = await supabase
      .from("resort_reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("resort_id", resort_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing review:", fetchError.message);
      return res.status(500).json({ message: "Error checking for existing review." });
    }

    if (existingReview) {
      // update instead
      const { error: updateError } = await supabase
        .from("resort_reviews")
        .update({
          rating: rating || null,
          review: review || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id);

      if (updateError) {
        console.error("Error updating existing review:", updateError.message);
        return res.status(500).json({ message: "Error updating existing review." });
      }

      return res.status(200).json({ message: "Review updated successfully." });
    }

    // create new review here
    const { error: insertError } = await supabase
      .from("resort_reviews")
      .insert({
        user_id: user.id,
        resort_id,
        rating: rating || null,
        review: review || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error creating review:", insertError.message);
      return res.status(500).json({ message: "Error creating review." });
    }

    return res.status(201).json({ message: "Review created successfully." });
  });
}