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
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { callRequestSchema } from "@/schemas/Call-request-schema";
import { callRequest } from "./call-request.action";

const CallRequestForm = ({
  tutorId,
  studentId,
}: {
  tutorId: string;
  studentId: string;
}) => {
  const { execute, isPending } = useAction(callRequest, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
    onError: () => {
      toast.error("Invalid credentials");
    },
  });
  const [selected1, setSelected1] = useState<Date>();
  const [timeValue1, setTimeValue1] = useState<string>("00:00");
  const [selected2, setSelected2] = useState<Date>();
  const [timeValue2, setTimeValue2] = useState<string>("00:00");
  const [selected3, setSelected3] = useState<Date>();
  const [timeValue3, setTimeValue3] = useState<string>("00:00");

  const handleDaySelect1 = (date: Date | undefined) => {
    if (!timeValue1 || !date) {
      setSelected1(date);
      return;
    }
    const [hours, minutes] = timeValue1
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setSelected1(newDate);
    form.setValue("date1", newDate);
  };
  const handleTimeChange1: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!selected1) {
      setTimeValue1(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(selected1, minutes), hours);
    setSelected1(newSelectedDate);
    setTimeValue1(time);
  };
  const handleDaySelect2 = (date: Date | undefined) => {
    if (!timeValue2 || !date) {
      setSelected2(date);
      return;
    }
    const [hours, minutes] = timeValue2
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setSelected2(newDate);
    form.setValue("date2", newDate);
  };

  const handleTimeChange2: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!selected2) {
      setTimeValue2(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(selected2, minutes), hours);
    setSelected2(newSelectedDate);
    setTimeValue2(time);
  };

  const handleDaySelect3 = (date: Date | undefined) => {
    if (!timeValue3 || !date) {
      setSelected3(date);
      return;
    }
    const [hours, minutes] = timeValue3
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setSelected3(newDate);
    form.setValue("date3", newDate);
  };

  const handleTimeChange3: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!selected3) {
      setTimeValue3(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(selected3, minutes), hours);
    setSelected3(newSelectedDate);
    setTimeValue3(time);
  };

  const form = useForm<z.infer<typeof callRequestSchema>>({
    resolver: zodResolver(callRequestSchema),
    defaultValues: {
      studentId: studentId ?? "",
      tutorId: tutorId ?? "",
      date1: undefined,
      date2: undefined,
      date3: undefined,
      details: "",
    },
  });

  function onSubmit(values: z.infer<typeof callRequestSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    execute(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 w-full items-center mt-[-3rem]"
      >
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} hidden />
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
          name="date1"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prospective date of call (1)</FormLabel>
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
                        selected1 ? (
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
                      value={timeValue1}
                      onChange={handleTimeChange1}
                      className="border border-black dark:border-white"
                    />
                  </label>
                  <Calendar
                    mode="single"
                    selected={selected1}
                    onSelect={handleDaySelect1}
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
          name="date2"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prospective date of call (2)</FormLabel>
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
                        selected1 ? (
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
                      value={timeValue2}
                      onChange={handleTimeChange2}
                      className="border border-black dark:border-white"
                    />
                  </label>
                  <Calendar
                    mode="single"
                    selected={selected2}
                    onSelect={handleDaySelect2}
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
          name="date3"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prospective date of call (3)</FormLabel>
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
                        selected1 ? (
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
                      value={timeValue3}
                      onChange={handleTimeChange3}
                      className="border border-black dark:border-white"
                    />
                  </label>
                  <Calendar
                    mode="single"
                    selected={selected3}
                    onSelect={handleDaySelect3}
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
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Details of the call"
                  className="resize-none w-64 sm:w-80 border border-black dark:border-white"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={`w-64 sm:w-80 ${
            !isPending ? "cursor-pointer" : "cursor-default"
          } `}
          disabled={isPending}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default CallRequestForm;
