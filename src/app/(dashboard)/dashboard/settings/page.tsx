"use client";

import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { deleteUserAccount, updateUserPassword } from "@/actions/account";
import { Skeleton } from "@/components/ui/skeleton";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Check if user has password authentication
  const hasPasswordAuth = user?.passwordEnabled;

  const onSubmitPassword = async (data: PasswordFormValues) => {
    setIsLoadingPassword(true);
    try {
      const result = await updateUserPassword(data.newPassword);

      if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Success", {
          description: "Password updated successfully",
        });
        form.reset();
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update password",
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const onDeleteAccount = async () => {
    setIsLoadingDelete(true);
    try {
      const result = await deleteUserAccount();

      if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Success", {
          description: "Account deleted successfully",
        });
        await signOut();
        router.push("/");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete account",
      });
    } finally {
      setIsLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <div className="font-medium">
                {!isLoaded ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  user?.primaryEmailAddress?.emailAddress
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <div className="font-medium">
                {!isLoaded ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${user?.firstName} ${user?.lastName}`
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        {hasPasswordAuth && (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitPassword)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoadingPassword || !isLoaded}
                  >
                    {isLoadingPassword && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Delete Account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data (Wallets,
              Goals, Budgets, Transactions, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This action cannot be undone. All your data will be permanently
              deleted.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isLoadingDelete || !isLoaded}
                >
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and remove all of
                    your data from our servers. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-x-2">
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={onDeleteAccount}
                      disabled={isLoadingDelete || !isLoaded}
                    >
                      {isLoadingDelete && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Delete Account
                    </Button>
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
