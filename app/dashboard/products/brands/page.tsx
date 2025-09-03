"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/templates/PageContainer";
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
import { toast } from "sonner";
import { RefreshCw, Pencil, Trash2, Plus } from "lucide-react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const brandSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be exactly 3 characters")
    .max(3, "Code must be exactly 3 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Brand = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export default function BrandPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Use SWR for data fetching with caching
  const { data: brands, mutate } = useSWR("/api/products/brands", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const createForm = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  const editForm = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  const refreshBrands = async () => {
    toast.info("Refreshing brands...");
    await mutate();
    toast.success("Brands refreshed");
  };

  const handleCreateOpen = () => {
    createForm.reset({
      code: "",
      name: "",
      description: "",
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof brandSchema>) => {
    try {
      const response = await fetch("/api/products/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log("response", response);
        throw new Error("Failed to create brand");
      }

      toast.success("Brand created successfully");
      createForm.reset();
      setIsCreateDialogOpen(false);

      // Refresh the brands list
      mutate();
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create brand"
      );
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    editForm.reset({
      code: brand.code,
      name: brand.name,
      description: brand.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: z.infer<typeof brandSchema>) => {
    if (!editingBrand) return;

    try {
      const response = await fetch(`/api/products/brands/${editingBrand._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update brand");
      }

      toast.success("Brand updated successfully");
      setIsEditDialogOpen(false);
      setEditingBrand(null);

      // Refresh the brands list
      mutate();
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update brand"
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (brand: Brand) => {
    setDeletingBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBrand) return;

    try {
      const response = await fetch(
        `/api/products/brands/${deletingBrand._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to delete brand");
      }

      toast.success("Brand deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingBrand(null);

      // Refresh the brands list
      mutate();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete brand"
      );
    }
  };

  // Filter brands based on search term
  const filteredBrands =
    brands?.data?.filter((brand: unknown) => {
      const b = brand as { code: string; name: string; description?: string };
      const searchLower = searchTerm.toLowerCase();
      return (
        b.code.toLowerCase().includes(searchLower) ||
        b.name.toLowerCase().includes(searchLower) ||
        (b.description && b.description.toLowerCase().includes(searchLower))
      );
    }) || [];

  return (
    <PageContainer className="h-screen overflow-y-auto relative">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="sticky top-0 bg-background z-10 pb-6 pt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Product Brands</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshBrands}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleCreateOpen}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Brand
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredBrands.length} brands found
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-md">
          {brands ? (
            filteredBrands.length > 0 ? (
              <div className="divide-y">
                {filteredBrands.map((brand: Brand) => (
                  <div key={brand._id} className="p-4 hover:bg-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">{brand.code}</div>

                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold">{brand.name}</span>
                          {": "}
                          {brand.description}
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          Added:{" "}
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last updated:{" "}
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* Delete button disabled but kept for future use */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={true}
                          title="Delete functionality is disabled"
                          onClick={() => {
                            /* handleDelete(brand) */
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No brands found
              </div>
            )
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Loading brands...
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brand</DialogTitle>
            <DialogDescription>
              Add a new product brand to the system.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Code</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={3} />
                    </FormControl>
                    <FormDescription>
                      Enter a unique 3-character code for the brand
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Enter the brand name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Brief description of the brand
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Brand</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update the brand information below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Code</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Kept but not used */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the brand &quot;
              {deletingBrand?.code} - {deletingBrand?.description}&quot;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
