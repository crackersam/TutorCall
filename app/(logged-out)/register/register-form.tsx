"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/schemas/Register-schema";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { registerUser } from "./register.action";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const router = useRouter();
  const { execute, isPending } = useAction(registerUser, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
        router.push("/");
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
  });
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      forename: "",
      surname: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    execute(values);
  }

  return (
    <div className="sm:w-[400px] w-[100%] bg-white dark:bg-black text-foreground rounded-lg border-black dark:border-white border justify-center flex flex-col gap-5 p-4">
      <div className="flex justify-center">
        <h1 className="text-xl underline justify-center">Registration</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="forename"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forename</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="border border-black dark:border-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surname</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="border border-black dark:border-white"
                  />
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
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="border border-black dark:border-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={() => (
              <FormItem>
                <FormLabel>Mobile number</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Enter mobile number"
                    defaultCountry="GB"
                    value={form.getValues("mobile")}
                    onChange={(value) => form.setValue("mobile", value || "")}
                    className="border border-black dark:border-white rounded-md px-1 py-2"
                  />
                </FormControl>
                <FormDescription>
                  This is so we can notify you when a call is scheduled or
                  requested.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border border-black dark:border-white w-full">
                      <SelectValue placeholder="Account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>
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
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    className="border border-black dark:border-white"
                  />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters long.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    className="border border-black dark:border-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={`${!isPending ? "cursor-pointer" : "cursor-default"} `}
            disabled={isPending}
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
