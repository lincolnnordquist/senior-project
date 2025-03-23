import { NextApiResponse } from "next";
import nookies from "nookies";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest } from "../types/next"; // Import custom type

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const checkAuth = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: Function
) => {
  try {
    const cookies = nookies.get({ req });
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify the user session with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    req.user = user.user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};