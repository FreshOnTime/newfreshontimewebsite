"use client";

import { PageContainer } from "@/components/templates/PageContainer";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useState } from "react";
import { WandSparkles } from "lucide-react";
import useSWR from "swr";

const measurementTypes = ["g", "kg", "ml", "l", "unit", "lb"] as const;

// Update the product schema to match the backend changes
const productSchema = z.object({
  // Removed SKU field
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  // Added brand and category fields
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  image: z.any().optional(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters"),
  ingredients: z
    .string()
    .max(500, "Ingredients must not exceed 500 characters")
    .optional(),
  nutritionFacts: z
    .string()
    .max(500, "Nutrition facts must not exceed 500 characters")
    .optional(),
  searchContent: z
    .string()
    .min(3, "Search content must be at least 3 characters")
    .max(500, "Search content must not exceed 500 characters"),
  baseMeasurementQuantity: z.number().min(1),
  pricePerBaseQuantity: z.number().min(0),
  measurementUnit: z.enum(["g", "kg", "ml", "l", "ea", "lb"]),
  isSoldAsUnit: z.boolean(),
  minOrderQuantity: z.number().min(0),
  maxOrderQuantity: z.number().min(0),
  stepQuantity: z.number().min(0),
  stockQuantity: z.number().min(0),
  isOutOfStock: z.boolean(),
  totalSales: z.number().default(0),
  isFeatured: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  measurementType: z.enum(measurementTypes),
  lowStockThreshold: z.number().min(0),
  unitOptions: z
    .array(
      z.object({
        label: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.enum(["g", "kg", "ml", "l", "ea", "lb"]),
        price: z.number().min(0),
      })
    )
    .optional(),
});

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AddProduct() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch brands and categories
  const { data: brands } = useSWR("/api/products/brands", fetcher);
  const { data: categories } = useSWR("/api/products/categories", fetcher);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      description: "",
      ingredients: "",
      nutritionFacts: "",
      searchContent: "",
      image: undefined,
      baseMeasurementQuantity: 0,
      pricePerBaseQuantity: 0,
      measurementUnit: "g",
      measurementType: "g",
      isSoldAsUnit: false,
      minOrderQuantity: 1,
      maxOrderQuantity: 100,
      stepQuantity: 1,
      stockQuantity: 0,
      isOutOfStock: false,
      totalSales: 0,
      isFeatured: false,
      discountPercentage: 0,
      lowStockThreshold: 0,
  unitOptions: [],
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "unitOptions",
  });

  const addDefaultOption = () => {
    append({
      label: `${form.watch("baseMeasurementQuantity") || 1}${form.watch("measurementUnit")}`,
      quantity: form.watch("baseMeasurementQuantity") || 1,
      unit: form.watch("measurementUnit"),
      price: form.watch("pricePerBaseQuantity") || 0,
    });
  };

  const pricePerBaseQuantityWithDiscount = form.watch("discountPercentage")
    ? form.watch("pricePerBaseQuantity") -
      (form.watch("pricePerBaseQuantity") *
        (form.watch("discountPercentage") || 0)) /
        100
    : form.watch("pricePerBaseQuantity");

  const pricePerMeasurement =
    form.watch("baseMeasurementQuantity") > 0
      ? pricePerBaseQuantityWithDiscount / form.watch("baseMeasurementQuantity")
      : 0;

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    setIsLoading(true);
    const userId = user?.userId;

    // Custom validation for image in the browser
    if (
      typeof window !== "undefined" &&
      data.image &&
      !(data.image instanceof File)
    ) {
      toast.error("Image must be a valid file");
      setIsLoading(false);
      return;
    }

    try {
      let productData = { ...data, createdBy: userId, updatedBy: userId };
      if (data.image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append("image", data.image);

        const imageUploadResponse = await fetch("/api/upload/images/products", {
          method: "POST",
          credentials: 'include',
          body: imageFormData,
        });

        if (!imageUploadResponse.ok) {
          const errorData = await imageUploadResponse.json();
          throw new Error(errorData.message || "Failed to upload image");
        }

        const imageResponse = await imageUploadResponse.json();
        productData = {
          ...data,
          image: imageResponse.data,
          createdBy: userId,
          updatedBy: userId,
        };
      }

      const response = await fetch("/api/products/add", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      toast.success("Product added successfully");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceWithAI = async () => {
    try {
      const response = await fetch("/api/products/enhance-details", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.watch("name") || "N/A",
          description: form.watch("description") || "N/A",
          ingredients: form.watch("ingredients") || "N/A",
          nutritionFacts: form.watch("nutritionFacts") || "N/A",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("errorData: ", errorData);
        throw new Error(
          errorData.message || "Failed to enhance fields with AI"
        );
      }

      const responseData = await response.json();
      form.setValue("name", responseData.data.name || "");
      form.setValue("description", responseData.data.description || "");
      form.setValue("ingredients", responseData.data.ingredients || "");
      form.setValue("nutritionFacts", responseData.data.nutritionFacts || "");
      form.setValue("searchContent", responseData.data.searchContent || "");
      toast.success("Fields enhanced with AI");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to enhance fields with AI"
      );
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">Add Product</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <section className="grid grid-cols-12 gap-6">
              <h3 className="col-span-12 text-lg font-semibold">Basic Info</h3>
              {/* Removed SKU field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Added brand field */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands?.data?.map(
                          (brand: {
                            _id: string;
                            code: string;
                            name: string;
                          }) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.code} - {brand.name}
                            </SelectItem>
                          )
                        ) || (
                          <SelectItem value="loading" disabled>
                            Loading brands...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Added category field */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.data?.map(
                          (category: {
                            _id: string;
                            code: string;
                            description: string;
                          }) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.code} - {category.description}
                            </SelectItem>
                          )
                        ) || (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="searchContent"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Search Content</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Keywords to help customers find this product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        onChange={field.onChange}
                        value={field.value}
                        aspectRatio={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Details */}
            <section className="grid grid-cols-12 gap-6">
              <h3 className="col-span-12 text-lg font-semibold">Details</h3>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border rounded-md p-4 bg-gray-50 col-span-12">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Description Preview
                </h3>
                <Markdown
                  rehypePlugins={[rehypeSanitize]}
                  className="text-gray-600 prose"
                >
                  {form.watch("description") ||
                    "Enter a description to see the preview"}
                </Markdown>
              </div>
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border rounded-md p-4 bg-gray-50 col-span-12">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Ingredients Preview
                </h3>
                <Markdown
                  rehypePlugins={[rehypeSanitize]}
                  className="text-gray-600 prose"
                >
                  {form.watch("ingredients") ||
                    "Enter ingredients to see the preview"}
                </Markdown>
              </div>
              <FormField
                control={form.control}
                name="nutritionFacts"
                render={({ field }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Nutrition Facts</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border rounded-md p-4 bg-gray-50 col-span-12">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Nutrition Facts Preview
                </h3>
                <Markdown
                  rehypePlugins={[rehypeSanitize]}
                  className="text-gray-600 prose"
                >
                  {form.watch("nutritionFacts") ||
                    "Enter nutrition facts to see the preview"}
                </Markdown>
              </div>
              <div className="col-span-12">
                <Button
                  type="button"
                  variant="outline"
                  onClick={enhanceWithAI}
                  className="w-full bg-purple-500 text-white hover:bg-purple-700"
                  disabled={
                    isLoading ||
                    form.watch("name") === "" ||
                    form.watch("description") === ""
                  }
                >
                  <WandSparkles className=" h-5 w-5" />
                  Enhance with AI
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to auto-enhance Name, Description, Ingredients, and
                  Nutrition Facts.
                </p>
              </div>
            </section>

            {/* Pricing & Measurement */}
            <section className="grid grid-cols-12 gap-6">
              <h3 className="col-span-12 text-lg font-semibold">
                Pricing & Measurement
              </h3>
              <FormField
                control={form.control}
                name="isSoldAsUnit"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Sell as Discrete Unit?</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">
                            No (Loose by Weight/Volume)
                          </SelectItem>
                          <SelectItem value="true">
                            Yes (Discrete Unit)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Choose &quot;No&quot; for loose items sold by
                      weight/volume (e.g., 500g rice). Choose &quot;Yes&quot;
                      for items sold as units (e.g., a 5kg rice sack or pack of
                      5 spoons).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseMeasurementQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-3">
                    <FormLabel>
                      {form.watch("isSoldAsUnit")
                        ? "Estimated Quantity"
                        : "Base Quantity"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("isSoldAsUnit")
                        ? "Optional estimate (e.g., 5kg for a sack)."
                        : "Quantity for pricing (e.g., 500g of rice)."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="measurementUnit"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-3">
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                        <SelectItem value="l">Liters (l)</SelectItem>
                        <SelectItem value="ea">Each (ea)</SelectItem>
                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerBaseQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>
                      Price per{" "}
                      {form.watch("isSoldAsUnit") ? "Unit" : "Base Quantity"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Discount Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border rounded-md p-4 bg-gray-50 col-span-12">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Price Label Preview
                </h3>
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-gray-900">
                    LKR {pricePerBaseQuantityWithDiscount.toFixed(2)}
                    <span className="text-lg text-gray-600">
                      /
                      {form.watch("isSoldAsUnit")
                        ? "unit"
                        : `${form.watch("baseMeasurementQuantity")}${form.watch(
                            "measurementUnit"
                          )}`}
                    </span>
                    {(form.watch("discountPercentage") || 0) > 0 && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        LKR {form.watch("pricePerBaseQuantity").toFixed(2)}
                      </span>
                    )}
                  </p>
                  {form.watch("isSoldAsUnit") &&
                    form.watch("baseMeasurementQuantity") > 0 && (
                      <p className="text-sm text-gray-600">
                        (Est. {form.watch("baseMeasurementQuantity")}
                        {form.watch("measurementUnit")})
                      </p>
                    )}
                  {!form.watch("isSoldAsUnit") &&
                    form.watch("baseMeasurementQuantity") > 0 && (
                      <p className="text-sm text-gray-600">
                        LKR {pricePerMeasurement.toFixed(2)}/
                        {form.watch("measurementUnit")}
                      </p>
                    )}
                </div>
              </div>

              {/* Unit Options (Pack Sizes) */}
              <div className="col-span-12">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Pack Sizes / Unit Options (optional)</h3>
                  <Button type="button" variant="outline" onClick={addDefaultOption}>
                    Add Option
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Add predefined sizes like 500g, 1kg, 5kg with their own prices. Leave empty for loose/weight-based items.
                </p>
                <div className="space-y-3">
                  {fields.length === 0 && (
                    <div className="text-sm text-gray-500">No unit options added.</div>
                  )}
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-3 items-end border rounded-md p-3">
                      <FormField
                        control={form.control}
                        name={`unitOptions.${index}.label` as const}
                        render={({ field }) => (
                          <FormItem className="col-span-12 md:col-span-3">
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 1kg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`unitOptions.${index}.quantity` as const}
                        render={({ field }) => (
                          <FormItem className="col-span-6 md:col-span-3">
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`unitOptions.${index}.unit` as const}
                        render={({ field }) => (
                          <FormItem className="col-span-6 md:col-span-2">
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="l">l</SelectItem>
                                <SelectItem value="ea">ea</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`unitOptions.${index}.price` as const}
                        render={({ field }) => (
                          <FormItem className="col-span-8 md:col-span-3">
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-4 md:col-span-1 flex justify-end">
                        <Button type="button" variant="destructive" onClick={()=>remove(index)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Inventory & Sales */}
            <section className="grid grid-cols-12 gap-6">
              <h3 className="col-span-12 text-lg font-semibold">
                Inventory & Sales
              </h3>
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isOutOfStock"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Out of Stock</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Featured Product</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minOrderQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Minimum Order Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxOrderQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Maximum Order Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Step Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || isLoading}
            >
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
