import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const checkAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) => {
  try {
    const supabase = createPagesServerClient({ req, res });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userRecord || userError) {
      return res.status(403).json({ message: "Unauthorized: No user record found" });
    }

    (req as any).user = userRecord;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { checkAuth };