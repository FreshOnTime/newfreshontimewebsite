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
import { RefreshCw, Pencil, Plus, Trash2, Shield } from "lucide-react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";

const roleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Permission = {
  _id: string;
  resource: string;
  operation: string;
  description: string;
};

type Role = {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
};

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [currentPermissionSearchTerm, setCurrentPermissionSearchTerm] =
    useState("");

  const { data: roles, mutate } = useSWR("/api/roles", fetcher);
  const { data: permissions } = useSWR("/api/permissions", fetcher);

  const createForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const refreshRoles = async () => {
    toast.info("Refreshing roles...");
    await mutate();
    toast.success("Roles refreshed");
  };

  const handleCreateOpen = () => {
    createForm.reset({
      name: "",
      description: "",
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof roleSchema>) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create role");
      }

      toast.success("Role created successfully");
      createForm.reset();
      setIsCreateDialogOpen(false);
      mutate();
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create role"
      );
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    editForm.reset({
      name: role.name,
      description: role.description,
    });
    setIsEditDialogOpen(true);
  };

  // Add handleRemovePermission function
  const handleRemovePermission = async (permissionId: string) => {
    if (!selectedRole) return;

    try {
      const response = await fetch(
        `/api/roles/${selectedRole._id}/permissions/${permissionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove permission from role");
      }

      // Update the local role data
      const updatedRoles = roles?.data?.map((role: Role) => {
        if (role._id === selectedRole._id) {
          return {
            ...role,
            permissions: role.permissions.filter((p) => p._id !== permissionId),
          };
        }
        return role;
      });

      // Update both the selected role and the roles list
      setSelectedRole({
        ...selectedRole,
        permissions: selectedRole.permissions.filter(
          (p) => p._id !== permissionId
        ),
      });

      // Update the SWR cache without making a network request
      mutate({ ...roles, data: updatedRoles }, false);

      toast.success("Permission removed from role successfully");
    } catch (error) {
      console.error("Error removing permission from role:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove permission from role"
      );
    }
  };

  const handleUpdate = async (data: z.infer<typeof roleSchema>) => {
    if (!editingRole) return;

    try {
      const response = await fetch(`/api/roles/${editingRole._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast.success("Role updated successfully");
      setIsEditDialogOpen(false);
      setEditingRole(null);
      mutate();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update role"
      );
    }
  };

  const handleDelete = async (role: Role) => {
    try {
      const response = await fetch(`/api/roles/${role._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      toast.success("Role deleted successfully");
      mutate();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role"
      );
    }
  };

  const handleAddPermission = async (permissionId: string) => {
    if (!selectedRole) return;

    try {
      const response = await fetch(
        `/api/roles/${selectedRole._id}/permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add permission to role");
      }

      // Find the permission from available permissions
      const addedPermission = permissions?.data?.find(
        (p: Permission) => p._id === permissionId
      );

      // Update the local role data
      const updatedRoles = roles?.data?.map((role: Role) => {
        if (role._id === selectedRole._id) {
          return {
            ...role,
            permissions: [...(role.permissions || []), addedPermission],
          };
        }
        return role;
      });

      // Update both the selected role and the roles list
      setSelectedRole({
        ...selectedRole,
        permissions: [...(selectedRole.permissions || []), addedPermission],
      });

      // Update the SWR cache without making a network request
      mutate({ ...roles, data: updatedRoles }, false);

      toast.success("Permission added to role successfully");
    } catch (error) {
      console.error("Error adding permission to role:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add permission to role"
      );
    }
  };

  const openPermissionDialog = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionDialogOpen(true);
  };

  const filteredRoles =
    roles?.data?.filter((role: Role) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        role.name.toLowerCase().includes(searchLower) ||
        role.description?.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <PageContainer className="h-screen overflow-y-auto relative">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <BreadcrumbGenerator />
        </div>
        <div className="sticky top-0 bg-background z-10 pb-6 pt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Roles</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshRoles}
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
                Add Role
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredRoles.length} roles found
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-md">
          {roles ? (
            filteredRoles.length > 0 ? (
              <div className="divide-y">
                {filteredRoles.map((role: Role) => (
                  <div key={role._id} className="p-4 hover:bg-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">{role.name}</div>
                        {role.description && (
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground mt-2">
                          Permissions: {role.permissions?.length || 0}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPermissionDialog(role)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(role)}
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
                No roles found
              </div>
            )
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Loading roles...
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Add a new role to the system.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                      Brief description of the role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role information below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
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

      {/* Permissions Dialog */}
      <Dialog
        open={isPermissionDialogOpen}
        onOpenChange={setIsPermissionDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Role Permissions</DialogTitle>
            <DialogDescription>
              Add or remove permissions for {selectedRole?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Current Permissions</h4>
              <Input
                placeholder="Search current permissions..."
                value={currentPermissionSearchTerm}
                onChange={(e) => setCurrentPermissionSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-md p-2 space-y-2 max-h-[200px] overflow-y-auto">
                {selectedRole?.permissions
                  ?.filter(
                    (permission) =>
                      permission.resource
                        .toLowerCase()
                        .includes(currentPermissionSearchTerm.toLowerCase()) ||
                      permission.operation
                        .toLowerCase()
                        .includes(currentPermissionSearchTerm.toLowerCase()) ||
                      permission.description
                        .toLowerCase()
                        .includes(currentPermissionSearchTerm.toLowerCase())
                  )
                  .map((permission) => (
                    <div
                      key={permission._id}
                      className="flex items-center justify-between bg-muted p-2 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{permission.resource}</div>
                        <div className="text-sm text-muted-foreground">
                          {permission.operation} - {permission.description}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePermission(permission._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                {!selectedRole?.permissions?.length && (
                  <div className="text-sm text-muted-foreground p-2">
                    No permissions assigned
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Available Permissions</h4>
              <Input
                placeholder="Search permissions..."
                value={permissionSearchTerm}
                onChange={(e) => setPermissionSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-md p-2 space-y-2 max-h-[200px] overflow-y-auto">
                {permissions?.data
                  ?.filter(
                    (p: Permission) =>
                      !selectedRole?.permissions?.find(
                        (rp) => rp._id === p._id
                      ) &&
                      (p.resource
                        .toLowerCase()
                        .includes(permissionSearchTerm.toLowerCase()) ||
                        p.operation
                          .toLowerCase()
                          .includes(permissionSearchTerm.toLowerCase()) ||
                        p.description
                          .toLowerCase()
                          .includes(permissionSearchTerm.toLowerCase()))
                  )
                  .map((permission: Permission) => (
                    <div
                      key={permission._id}
                      className="flex items-center justify-between bg-muted p-2 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{permission.resource}</div>
                        <div className="text-sm text-muted-foreground">
                          {permission.operation} - {permission.description}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddPermission(permission._id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
