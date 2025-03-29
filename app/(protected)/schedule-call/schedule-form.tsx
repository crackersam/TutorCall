"use client";
import React, { ChangeEventHandler, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ScheduleCallSchema } from "@/schemas/Schedule-call-schema";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { scheduleCall } from "./schedule.action";
import { useSearchParams } from "next/navigation";

const ScheduleForm = ({ session }: { session: Session }) => {
  const searchParams = useSearchParams();

  const studentId = searchParams.get("studentId");
  const { execute, isPending } = useAction(scheduleCall, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
    onError: (error) => {
      toast.error("Invalid credentials");
    },
  });
  const [selected, setSelected] = useState<Date>();
  const [timeValue, setTimeValue] = useState<string>("00:00");

  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!selected) {
      setTimeValue(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(selected, minutes), hours);
    setSelected(newSelectedDate);
    setTimeValue(time);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (!timeValue || !date) {
      setSelected(date);
      return;
    }
    const [hours, minutes] = timeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setSelected(newDate);
    form.setValue("date", newDate);
  };

  const form = useForm<z.infer<typeof ScheduleCallSchema>>({
    resolver: zodResolver(ScheduleCallSchema),
    defaultValues: {
      studentId: studentId ?? "",
      tutorId: session.user.id,
      date: undefined,
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof ScheduleCallSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    execute(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tutorId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} hidden value={session.user.id} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input hidden {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of call</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "border border-black dark:border-white w-64 sm:w-80",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        selected ? (
                          format(field.value, "dd/MM/yyyy HH:mm")
                        ) : (
                          "Pick a date"
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <label className="flex justify-evenly p-4">
                    Set the time:
                    <input
                      type="time"
                      value={timeValue}
                      onChange={handleTimeChange}
                      className="border border-black dark:border-white"
                    />
                  </label>
                  <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={handleDaySelect}
                    disabled={(date) => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate()); // Add 1 day to the current date
                      return date < tomorrow; // Disable dates before tomorrow
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description of the call"
                  className="resize-none border border-black dark:border-white"
                  {...field}
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
  );
};

export default ScheduleForm;
