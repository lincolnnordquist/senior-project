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

    (req as any).user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { checkAuth };