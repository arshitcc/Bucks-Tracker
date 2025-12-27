"use client";

import { motion } from "motion/react";
import { useSignUp } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { OtpForm, otpSchema, SignupForm, signupSchema } from "@/schemas/auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { GoogleIcon } from "@/components/icons/socials";
import { EyeIcon, EyeOffIcon, WalletIcon } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const verificationForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const handleSignUp = async (values: SignupForm) => {
    if (!isLoaded) return;
    setError("");
    try {
      const [firstName, ...lastNameParts] = values.fullName.split(" ");
      const lastName = lastNameParts.join(" ");

      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName,
        lastName,
      });

      // Send the email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const clerkError = err.errors?.[0];

      // account already exists → redirect to sign-in
      if (clerkError?.code === "form_identifier_exists") {
        router.push("/sign-in");
        return;
      }
      setError(clerkError?.message || "An error occurred during sign up");
    }
  };

  const handleVerification = async (values: OtpForm) => {
    if (!isLoaded) return;
    setError("");
    try {
      const signup = await signUp.attemptEmailAddressVerification({
        code: values.code,
      });

      if (signup.status !== "complete") {
        setError("Invalid verification code");
      }

      if (signup.status === "complete") {
        await setActive({ session: signup.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred during sign up");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setError("");
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/verify",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError("Google sign in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[320px] sm:w-sm md:w-md lg:w-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="space-y-2">
              <Link
                href={"/"}
                className="flex flex-col justify-center items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <WalletIcon className="h-6 w-6 text-primary-foreground" />
                </div>
              </Link>
              <p className="text-2xl font-bold">
                {pendingVerification ? (
                  "Verify your email"
                ) : (
                  <>
                    Join <span className="text-primary">Bucks Tracker</span>
                  </>
                )}
              </p>
            </CardTitle>
            <CardDescription>
              {pendingVerification
                ? "Enter your verification code"
                : "Enter your details below to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingVerification ? (
              <Form {...verificationForm}>
                <form
                  onSubmit={verificationForm.handleSubmit(handleVerification)}
                  className="space-y-4"
                >
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-4 items-center">
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <InputOTPSlot key={i} index={i} />
                              ))}
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <InputOTPSlot key={i + 3} index={i + 3} />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <p className="bg-red-50 p-2 rounded-xl text-sm font-medium text-destructive text-center">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full">
                    Verify
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleGoogleSignIn}
                >
                  <GoogleIcon />
                  Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSignUp)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Johnny Singh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example@domain.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl className="relative">
                            <div className="flex items-center">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter a strong password"
                                {...field}
                              />
                              {showPassword ? (
                                <EyeIcon
                                  className="absolute size-4 right-3 top-2.5 cursor-pointer"
                                  onClick={() => setShowPassword(false)}
                                />
                              ) : (
                                <EyeOffIcon
                                  className="absolute size-4 right-3 top-2.5 cursor-pointer"
                                  onClick={() => setShowPassword(true)}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <p className="bg-red-50 p-2 rounded-xl text-sm font-medium text-destructive text-center">
                        {error}
                      </p>
                    )}
                    <Button type="submit" className="w-full">
                      Sign Up
                    </Button>
                    <div id="clerk-captcha" />
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/sign-in"
              className="ml-1 font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default SignupPage;
