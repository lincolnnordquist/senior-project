import { NextApiRequest, NextApiResponse } from "next";
import { checkAuth } from "../../middleware/authMiddleware";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// route to get all users

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await checkAuth(req, res, async () => {
    const user = (req as any).user;
    console.log("User from middleware:", user);

    if (!user?.is_admin) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, is_admin");

    if (error) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({ message: "Error fetching users" });
    }

    return res.status(200).json({ users: data });
  });
}