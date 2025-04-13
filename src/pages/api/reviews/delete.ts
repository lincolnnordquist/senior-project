import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing review ID" });
  }

  const { error } = await supabase
    .from("resort_reviews")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ message: "Failed to delete review", error });
  }

  return res.status(200).json({ message: "Review successfully deleted" });
}
