import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { data, error } = await supabase.from("ski_resorts").select("*");

  if (error) {
    return res.status(500).json({ message: "Error fetching ski resorts", error });
  }

  res.status(200).json(data);
}