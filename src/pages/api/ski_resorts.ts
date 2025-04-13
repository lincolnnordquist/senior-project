import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // route to get all ski resorts with their average rating
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

    return res.status(200).json(resortsWithAvgRating);
  }

  if (req.method === "POST") {
    const {
      name,
      latitude,
      longitude,
      state,
      website,
      address,
      photoURL,
    } = req.body;

    const { data, error } = await supabase
      .from("ski_resorts")
      .insert([
        {
          name,
          latitude,
          longitude,
          state,
          website,
          address,
          photoURL,
        },
      ])
      .single();

    if (error) {
      return res.status(500).json({ message: "Error adding ski resort", error });
    }

    return res.status(201).json({ message: "Resort added successfully", resort: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing resort ID" });
    }

    const { error } = await supabase
      .from("ski_resorts")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ message: "Error deleting resort", error });
    }

    return res.status(200).json({ message: "Resort deleted successfully" });
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}