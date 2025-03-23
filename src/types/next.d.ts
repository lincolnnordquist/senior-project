import { User } from "@supabase/supabase-js";
import { NextApiRequest } from "next";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}