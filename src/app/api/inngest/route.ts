import { serve } from "inngest/next";
import { inngest } from "@/lib/services/inngest/client";
import {
  newUserAccountSetup,
  deleteUserAccount,
} from "@/lib/services/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [newUserAccountSetup, deleteUserAccount],
});
