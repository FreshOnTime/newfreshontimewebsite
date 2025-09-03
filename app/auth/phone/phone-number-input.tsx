"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/min";
import { toast } from "sonner";

const formSchema = z
  .object({
    phoneNumber: z.string(),
    countryCode: z.enum(["LK"]),
  })
  .refine(
    (data) => {
      try {
        return isValidPhoneNumber(data.phoneNumber, data.countryCode);
      } catch {
        return false;
      }
    },
    {
      message: "Please enter a valid phone number",
      path: ["phoneNumber"],
    }
  );

interface PhoneNumberInputProps {
  onSubmit: (phoneNumber: string) => void;
  disabled?: boolean;
}

export function PhoneNumberInput({
  onSubmit,
  disabled = false,
}: PhoneNumberInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      countryCode: "LK",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const parseNumber = parsePhoneNumber(
        values.phoneNumber,
        values.countryCode
      ).number;

      onSubmit(parseNumber);
    } catch {
      toast.error("An error occured", {
        description: "An error occured while parsing the phone number",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 max-w-sm mx-auto"
      >
        <div className="space-y-2">
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger showArrow={false}>
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LK">
                          <div className="flex items-center gap-2">
                            <Image
                              src="/country-flags/sri_lanka.svg"
                              alt="LK"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Phone Number"
                      {...field}
                      type="tel"
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormDescription>
            We&apos;ll send a verification code to this number
          </FormDescription>
        </div>

        <Button
          disabled={disabled}
          type="submit"
          className="w-full rounded-full"
        >
          Send Verification Code
        </Button>
      </form>
    </Form>
  );
}
