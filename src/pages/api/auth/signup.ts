import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password, first_name, last_name, phone_number, zip_code } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert([
      {
        id: data.user?.id,
        first_name,
        last_name,
        email,
        phone_number,
        zip_code,
        is_admin: false,
      },
    ]);

  if (userError) {
    return res.status(400).json({ message: userError.message });
  }

  res.status(200).json({ message: "User registered successfully!" });
}