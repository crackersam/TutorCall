"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { MobileVerificationSchema } from "@/schemas/Mobile-verification-schema";
import { useAction } from "next-safe-action/hooks";
import { verifyMobile } from "./verify-mobile.action";
import { useRouter } from "next/navigation";

export function VerifyMobileForm() {
  const router = useRouter();
  const { execute, isPending } = useAction(verifyMobile, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
        router.push("/");
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
    onError: () => {
      toast.error("Invalid credentials");
    },
  });

  const form = useForm<z.infer<typeof MobileVerificationSchema>>({
    resolver: zodResolver(MobileVerificationSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof MobileVerificationSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    execute(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-2/3 m-auto space-y-6 flex  flex-col justify-center"
      >
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="w-full basis-full">
              <FormLabel className="mx-auto">One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} type="text" {...field}>
                  <InputOTPGroup className="mx-auto">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription className="text-center">
                Please enter the one-time password sent to your phone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mx-auto" type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
