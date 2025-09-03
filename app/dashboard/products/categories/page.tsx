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

const categorySchema = z.object({
  code: z
    .string()
    .min(3, "Code must be exactly 3 characters")
    .max(3, "Code must be exactly 3 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(30, "Description must not exceed 30 characters"),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Category = {
  _id: string;
  code: string;
  description: string;
  createdAt: string;
};

export default function CategoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Use SWR for data fetching with caching
  const { data: categories, mutate } = useSWR(
    "/api/products/categories",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const createForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: "",
      description: "",
    },
  });

  const editForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: "",
      description: "",
    },
  });

  const refreshCategories = async () => {
    toast.info("Refreshing categories...");
    await mutate();
    toast.success("Categories refreshed");
  };

  const handleCreateOpen = () => {
    createForm.reset({
      code: "",
      description: "",
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      const response = await fetch("/api/products/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      toast.success("Category created successfully");
      createForm.reset();
      setIsCreateDialogOpen(false);

      // Refresh the categories list
      mutate();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    editForm.reset({
      code: category.code,
      description: category.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: z.infer<typeof categorySchema>) => {
    if (!editingCategory) return;

    try {
      const response = await fetch(
        `/api/products/categories/${editingCategory._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast.success("Category updated successfully");
      setIsEditDialogOpen(false);
      setEditingCategory(null);

      // Refresh the categories list
      mutate();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      const response = await fetch(
        `/api/products/categories/${deletingCategory._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);

      // Refresh the categories list
      mutate();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  // Filter categories based on search term
  const filteredCategories =
    categories?.data?.filter((category: unknown) => {
      const cat = category as { code: string; description: string };
      return (
        cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  return (
    <PageContainer className="h-screen overflow-y-auto relative">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="sticky top-0 bg-background z-10 pb-6 pt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Product Categories</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCategories}
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
                Add Category
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredCategories.length} categories found
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-md">
          {categories ? (
            filteredCategories.length > 0 ? (
              <div className="divide-y">
                {filteredCategories.map((category: Category) => (
                  <div key={category._id} className="p-4 hover:bg-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">
                          {category.code}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          Added:{" "}
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last updated:{" "}
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
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
                            /* handleDelete(category) */
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
                No categories found
              </div>
            )
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Loading categories...
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new product category to the system.
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
                    <FormLabel>Category Code</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={3} />
                    </FormControl>
                    <FormDescription>
                      Enter a unique 3-character code for the category
                    </FormDescription>
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
                      Brief description of the category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Category</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information below.
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
                    <FormLabel>Category Code</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={3} />
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
              This will permanently delete the category &quot;
              {deletingCategory?.code} - {deletingCategory?.description}&quot;.
              This action cannot be undone.
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
