import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createNewUserAccount } from "@/actions/account";

export async function POST(req: Request) {
  const payload = await req.json();
  const headersList = await headers();

  const svix_id = headersList.get("svix-id")!;
  const svix_timestamp = headersList.get("svix-timestamp")!;
  const svix_signature = headersList.get("svix-signature")!;

  const whk = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event;
  try {
    event = whk.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.log("Webhook Verification Error : ", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const user = event.data;
      await createNewUserAccount(user.id);
      break;
    }

    default: {
      console.log(`Unknown Event type triggered : \n`, event);
      break;
    }
  }

  return new Response("OK");
}
