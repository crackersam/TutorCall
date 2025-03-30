"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { profileSchema } from "@/schemas/Profile-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { updateProfile } from "./profile.action";
import { Textarea } from "@/components/ui/textarea";

const ProfileForm = ({
  id,
  forename,
  surname,
  email,
  emailVerified,
  image,
  password,
  mobile,
  mobileVerified,
  role,
  biography,
  subject,
  createdAt,
  updatedAt,
}: {
  id: string;
  forename: string;
  surname: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  mobile: string;
  mobileVerified?: Date;
  role: "INSTRUCTOR" | "STUDENT";
  subject?: string;
  biography?: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  const [avatar, setAvatar] = React.useState<string | undefined>(image);
  const { execute, isPending } = useAction(updateProfile, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
  });
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      id,
      forename,
      surname,
      email,
      mobile,
      avatar: image ?? "",
      newPassword: "",
      confirmNewPassword: "",
      currentPassword: "",
      subject: subject ?? "",
      role: role as "INSTRUCTOR" | "STUDENT",
      biography: biography ?? "",
    },
  });
  const accountType = form.watch("role");

  function onSubmit(values: z.infer<typeof profileSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    execute(values);
  }

  return (
    <>
      <div className=" bg-white dark:bg-black text-foreground rounded-lg justify-center flex gap-5 p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex gap-3 flex-wrap justify-center lg:justify-start max-w-[700px]"
          >
            <FormField
              control={form.control}
              name="forename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forename</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-black dark:border-white w-64 sm:w-80"
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
                      className="border border-black dark:border-white w-64 sm:w-80"
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
                      className="border border-black dark:border-white w-64 sm:w-80"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-black dark:border-white w-64 sm:w-80"
                    />
                  </FormControl>
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
                      <SelectTrigger className="border border-black dark:border-white w-64 sm:w-80">
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
            {accountType === "INSTRUCTOR" && (
              <>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border border-black dark:border-white w-64 sm:w-80"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about your teaching style and experience."
                          className="flex resize-none w-64 h-36 border border-black dark:border-white sm:w-80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <hr className="flex w-full border border-black dark:border-white" />
            <div className="basis-full flex flex-wrap items-center lg:flex-nowrap justify-center   lg:justify-start gap-3">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="border border-black dark:border-white w-64 sm:w-80"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="border border-black dark:border-white w-64 sm:w-80"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full justify-center lg:justify-start">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="border border-black dark:border-white w-64 sm:w-80"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="hidden" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="hidden" value={id} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="basis-full justify-center flex gap-3 lg:justify-start">
              <Button
                type="submit"
                className={`${
                  !isPending ? "cursor-pointer" : "cursor-default"
                } `}
                disabled={isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className={` flex-none relative`}>
        {form.getValues("avatar") ? (
          <Image
            src={avatar!}
            width={200}
            height={200}
            className="rounded-full border border-black"
            alt="Profile Image"
            priority
          />
        ) : (
          <div className="w-[200px] h-[200px] bg-gray-200 border border-black rounded-full" />
        )}
        <UploadButton
          endpoint="imageUploader"
          className="ring-0"
          appearance={{
            button({ ready, isUploading }) {
              return {
                fontSize: "0.8rem",
                padding: "0.5rem 1rem",
                width: "100%",
                height: "100%",

                backgroundColor: "black",
                ...(ready && { color: "#ecfdf5" }),
                ...(isUploading && { color: "#d1d5db" }),
              };
            },

            container: {
              marginTop: "1rem",
            },
            allowedContent: {
              color: "#a1a1aa",
            },
          }}
          content={{
            button: "Upload Image",
          }}
          onClientUploadComplete={(res) => {
            // Do something with the response
            form.setValue("avatar", res[0].ufsUrl);
            setAvatar(res[0].ufsUrl);
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
        />
      </div>
    </>
  );
};

export default ProfileForm;
