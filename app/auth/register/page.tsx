/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { PageContainer } from "@/components/templates/PageContainer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  BriefcaseBusinessIcon,
  Building,
  HomeIcon,
  SchoolIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Define the User type to match AuthContext
interface User {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  role: string;
  _id: string;
}

// Update the form schema first
const formSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(30, "First name cannot exceed 30 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    registrationAddress: z.object({
      streetAddress: z.string().min(1, "Street address is required"),
      streetAddress2: z.string().optional(),
      town: z.string().min(1, "Town is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "Province is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      type: z.enum(["Home", "Business", "School", "Other"]),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.registrationAddress.type === "Home" && !data.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastName"],
        message: "Last name is required when Address Type is Home",
      });
    }
  });

const provinces = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
} as const;

const addressTypes = {
  Home: <HomeIcon />,
  Business: <BriefcaseBusinessIcon />,
  School: <SchoolIcon />,
  Other: <Building />,
} as const;

export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      registrationAddress: {
        streetAddress: "",
        streetAddress2: "",
        town: "",
        city: "",
        state: "Western",
        postalCode: "",
        type: "Home",
      },
    },
  });

  const addressType = form.watch("registrationAddress.type");
  const isOrganization =
    addressType === "Business" ||
    addressType === "School" ||
    addressType === "Other";

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userData = {
        ...data,
        lastName: !isOrganization ? data.lastName || "" : "",
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        email: data.email || "",
        registrationAddress: {
          ...data.registrationAddress,
          recipientName: `${data.firstName} ${data.lastName}`,
          phoneNumber: user.phoneNumber,
          countryCode: "LK",
        },
      };

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        toast.success("Successfully registered");
        form.reset();
        router.push(getRedirectUrl());
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to register";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectUrl = () => {
    const redirectUrl = `/${searchParams.get("redirect") || ""}` || "/";
    if (redirectUrl.includes("auth")) {
      return "/";
    }

    return redirectUrl;
  };

  const handleUserRedirect = useCallback(
    async (user: User) => {
      const redirectUrl = getRedirectUrl();
      try {
        const response = await fetch(`/api/users/exists/${user.userId}`);
        if (response.ok) {
          toast.error("You are already registered");
          router.push(redirectUrl);
        }
      } catch {
        toast.error("Something went wrong");
        router.push(redirectUrl);
      }
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (user) {
      handleUserRedirect(user);
    }
    // Remove automatic redirect to /phone for non-authenticated users
    // This allows users to actually register on this page
  }, [user, handleUserRedirect]);

  return (
    <PageContainer className="space-y-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-6 font-bold text-center">Join Fresh Pick</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className={isOrganization ? "md:col-span-2" : ""}>
                    <FormLabel>
                      {isOrganization ? "Organization Name" : "First Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isOrganization ? "Organization Name" : "John"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isOrganization && (
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Registration Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registrationAddress.streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationAddress.streetAddress2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationAddress.town"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Town</FormLabel>
                      <FormControl>
                        <Input placeholder="Town" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationAddress.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Province" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(provinces).map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!form.watch("registrationAddress.state")}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                form.watch("registrationAddress.state")
                                  ? "Select City"
                                  : "Select Province First"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {form.watch("registrationAddress.state") &&
                              provinces[
                                form.watch(
                                  "registrationAddress.state"
                                ) as keyof typeof provinces
                              ].map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationAddress.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Address Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(addressTypes).map((type) => (
                              <SelectItem key={type} value={type}>
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    {
                                      addressTypes[
                                        type as keyof typeof addressTypes
                                      ]
                                    }
                                    {type}
                                  </div>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
            <div className="space-x-4">
              <p className="text-sm text-center text-gray-600">
                By registering you agree to the{" "}
                <Link
                  href={"privacy-policy"}
                  className="text-gray-800 font-semibold hiver:underline"
                >
                  {" "}
                  privacy policy{" "}
                </Link>
                and{" "}
                <Link
                  href={"customer-agreement"}
                  className="text-gray-800 font-semibold hiver:underline"
                >
                  customer agreement.
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
