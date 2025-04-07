import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { data, error } = await supabase
    .from("ski_resorts")
    .select("*, resort_reviews!left(resort_id,rating)")
    .returns<any[]>();

  if (error) {
    return res.status(500).json({ message: "Error fetching ski resorts", error });
  }

  const resortsWithAvgRating = data.map((resort) => {
    const ratings = resort.resort_reviews?.map((r: any) => r.rating) || [];
    const avgRating = ratings.length
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
      : 0;
    return {
      ...resort,
      average_rating: avgRating,
    };
  });

  res.status(200).json(resortsWithAvgRating);
}