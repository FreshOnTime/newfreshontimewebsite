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
// Add Trash2 to the imports at the top
import { RefreshCw, Pencil, Plus, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const operations = ["create", "read", "update", "delete"] as const;

const permissionSchema = z.object({
  resource: z
    .string()
    .min(3, "Resource name must be at least 3 characters")
    .toLowerCase(),
  operation: z.enum(operations),
  description: z.string().min(3, "Description must be at least 3 characters"),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Permission = {
  _id: string;
  resource: string;
  operation: (typeof operations)[number];
  description: string;
  createdAt: string;
  isSystem: boolean;
};

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: permissions, mutate } = useSWR("/api/permissions", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const createForm = useForm<z.infer<typeof permissionSchema>>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      resource: "",
      operation: "read",
      description: "",
    },
  });

  const editForm = useForm<z.infer<typeof permissionSchema>>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      resource: "",
      operation: "read",
      description: "",
    },
  });

  const refreshPermissions = async () => {
    toast.info("Refreshing permissions...");
    await mutate();
    toast.success("Permissions refreshed");
  };

  const handleCreateOpen = () => {
    createForm.reset({
      resource: "",
      operation: "read",
      description: "",
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof permissionSchema>) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create permission");
      }

      toast.success("Permission created successfully");
      createForm.reset();
      setIsCreateDialogOpen(false);
      mutate();
    } catch (error) {
      console.error("Error creating permission:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create permission"
      );
    }
  };

  const handleEdit = (permission: Permission) => {
    if (permission.isSystem)
      return toast.error("Cannot edit system permission");

    setEditingPermission(permission);
    editForm.reset({
      resource: permission.resource,
      operation: permission.operation,
      description: permission.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: z.infer<typeof permissionSchema>) => {
    if (!editingPermission) return;

    try {
      const response = await fetch(
        `/api/permissions/${editingPermission._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update permission");
      }

      toast.success("Permission updated successfully");
      setIsEditDialogOpen(false);
      setEditingPermission(null);
      mutate();
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update permission"
      );
    }
  };

  // Add handleDelete function after handleUpdate
  const handleDelete = async (permission: Permission) => {
    if (permission.isSystem)
      return toast.error("Cannot delete system permission");
    try {
      const response = await fetch(`/api/permissions/${permission._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete permission");
      }

      toast.success("Permission deleted successfully");
      mutate();
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete permission"
      );
    }
  };

  const filteredPermissions =
    permissions?.data?.filter((permission: Permission) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        permission.resource.toLowerCase().includes(searchLower) ||
        permission.operation.toLowerCase().includes(searchLower) ||
        permission.description.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <PageContainer className="h-screen overflow-y-auto relative">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="sticky top-0 bg-background z-10 pb-6 pt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Permissions</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPermissions}
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
                Add Permission
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredPermissions.length} permissions found
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-md">
          {permissions ? (
            filteredPermissions.length > 0 ? (
              <div className="divide-y">
                {filteredPermissions.map((permission: Permission) => (
                  <div key={permission._id} className="p-4 hover:bg-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">
                          {permission.resource}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Operation: {permission.operation}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {permission.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Added:{" "}
                          {new Date(permission.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(permission)}
                          disabled={permission.isSystem}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(permission)}
                          disabled={permission.isSystem}
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
                No permissions found
              </div>
            )
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Loading permissions...
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>
              Add a new permission to the system.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the resource name (e.g., products, users)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operations.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      Brief description of the permission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Permission</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update the permission information below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operations.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
    </PageContainer>
  );
}
