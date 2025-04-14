import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const supabase = createPagesServerClient({ req, res });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: "Unauthorized", error: authError });
    }

    const { first_name, last_name, email, phone_number, zip_code } = req.body;

    const { error: updateError } = await supabase
      .from("users")
      .update({ first_name, last_name, email, phone_number, zip_code })
      .eq("id", user.id);

    if (updateError) {
      return res.status(500).json({ message: "Failed to update user", error: updateError });
    }

    return res.status(200).json({ message: "User updated successfully" });
  }

  const supabase = createPagesServerClient({ req, res });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ message: "Unauthorized", error: authError });
  }

  const { data: fullUser, error: userError } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, is_admin, phone_number, zip_code")
    .eq("id", user.id)
    .single();

  if (userError || !fullUser) {
    return res.status(404).json({ message: "User not found", error: userError });
  }

  res.status(200).json({ user: fullUser });
}