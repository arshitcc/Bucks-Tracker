import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { createNewAccount } from "@/actions/account";
import { createDefaultWallets } from "@/actions/wallets";
import { createFreeSubscription } from "@/actions/subscription";

export const newUserAccountSetup = inngest.createFunction(
  { id: "new-clerk-user-account-setup" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const newUser = await step.run("create-user-account", async () => {
      const userData = {
        clerkUserID: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        avatar: image_url,
      };
      const newUser = await createNewAccount(userData);
      return newUser.data;
    });

    if (newUser) {
      await step.run("create-default-wallets", async () => {
        await createDefaultWallets(newUser.id);
      });

      await step.run("create-free-subscription", async () => {
        await createFreeSubscription(newUser.id);
      });
    }
  },
);

export const deleteUserAccount = inngest.createFunction(
  { id: "delete-user-account" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;
    
    await step.run("mark-user-delete", async () => {
      await db.user.update({
        where: { clerkUserID : id },
        data: { deletedAt: new Date() },
      });
    });

    await step.sleep("wait-30-days", "30d");

    await step.run("delete-user-account", async () => {
      const user = await db.user.findUnique({
        where: { clerkUserID : id },
      });
      if (user?.deletedAt) {
        await db.user.delete({ where: { clerkUserID: id } });
      }
    })
  },
);