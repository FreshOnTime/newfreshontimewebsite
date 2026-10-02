
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Search, Save, MoreHorizontal, Edit, Package, Layers, Check } from "lucide-react";

interface SubscriptionContent {
    name: string;
    quantity: string;
    category: string;
}

interface SubscriptionPlan {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    contents: SubscriptionContent[];
    image: string;
    isActive: boolean;
    isFeatured: boolean;
    currentSubscribers: number;
}

interface PlanForm {
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    contents: SubscriptionContent[];
    image: string;
    isActive: boolean;
    isFeatured: boolean;
}

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [search, setSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, control, handleSubmit, setValue, reset, formState: { errors } } = useForm<PlanForm>({
        defaultValues: {
            contents: [{ name: "", quantity: "", category: "" }],
            isActive: true,
            frequency: 'weekly'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contents"
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/subscription-plans");
            const data = await res.json();
            if (data.success) {
                setPlans(data.plans);
            }
        } catch (error) {
            toast.error("Failed to fetch subscription plans");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        reset({
            name: plan.name,
            description: plan.description,
            shortDescription: plan.shortDescription,
            price: plan.price,
            frequency: plan.frequency,
            contents: plan.contents,
            image: plan.image,
            isActive: plan.isActive,
            isFeatured: plan.isFeatured
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await fetch(`/api/subscription-plans/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Plan deleted successfully");
                fetchPlans();
            } else {
                toast.error(data.message || "Failed to delete plan");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const onSubmit = async (data: PlanForm) => {
        setIsSubmitting(true);
        try {
            const url = editingPlan
                ? `/api/subscription-plans/${editingPlan._id}`
                : "/api/subscription-plans";

            const method = editingPlan ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(editingPlan ? "Plan updated successfully" : "Plan created successfully");
                setIsDialogOpen(false);
                fetchPlans();
                reset();
                setEditingPlan(null);
            } else {
                toast.error(result.message || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-normal text-foreground">Subscriptions</h1>
                    <p className="text-muted-foreground mt-2">Manage subscription packages and plans</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingPlan(null);
                        reset({
                            contents: [{ name: "", quantity: "", category: "Fruit" }],
                            isActive: true,
                            frequency: 'weekly',
                            price: 0,
                            image: "/images/subscription-default.jpg"
                        });
                        setIsDialogOpen(true);
                    }}
                    className="bg-primary hover:bg-primary text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                </Button>
            </div>

            {/* List Card */}
            <Card className="border-border shadow-premium">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-brand-green">
                        <Layers className="w-5 h-5 text-brand-green" />
                        Active Plans
                    </CardTitle>
                    <CardDescription>View and manage your subscription offerings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search plans..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 border-border focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-secondary/50">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Subscribers</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[70px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPlans.length > 0 ? (
                                        filteredPlans.map((plan) => (
                                            <TableRow key={plan._id} className="hover:bg-secondary/50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden relative">
                                                            <img
                                                                src={plan.image}
                                                                alt={plan.name}
                                                                className="object-cover w-full h-full"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/images/subscription-default.jpg';
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{plan.name}</div>
                                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{plan.shortDescription}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-brand-green font-semibold">
                                                    Rs. {plan.price.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="capitalize text-muted-foreground">
                                                    {plan.frequency}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-secondary text-brand-green hover:bg-secondary">
                                                        {plan.currentSubscribers} Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={plan.isActive ? "default" : "outline"} className={plan.isActive ? "bg-primary hover:bg-primary" : ""}>
                                                        {plan.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-green">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(plan._id, plan.name)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No subscription plans found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-brand-green">
                            {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
                        </DialogTitle>
                        <DialogDescription>
                            Define the details and contents of your subscription box.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Plan Name</label>
                                <Input
                                    {...register("name", { required: "Name is required" })}
                                    placeholder="e.g., The Family Bureau"
                                    className="focus-visible:ring-primary"
                                />
                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Short Description (Card)</label>
                                <Input
                                    {...register("shortDescription", { required: "Short description is required" })}
                                    placeholder="e.g., Perfect for families of 4-5"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Full Description</label>
                            <Textarea
                                {...register("description", { required: "Description is required" })}
                                placeholder="Detailed description of what makes this box special..."
                                className="focus-visible:ring-primary min-h-[100px]"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Price (LKR)</label>
                                <Input
                                    type="number"
                                    {...register("price", { required: "Price is required", min: 0 })}
                                    placeholder="0.00"
                                    className="focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Frequency</label>
                                <Select
                                    onValueChange={(val) => setValue("frequency", val as any)}
                                    defaultValue={editingPlan?.frequency || 'weekly'}
                                >
                                    <SelectTrigger className="focus:ring-primary">
                                        <SelectValue placeholder="Select Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Image URL</label>
                            <Input
                                {...register("image")}
                                placeholder="https://..."
                                className="focus-visible:ring-primary"
                            />
                        </div>

                        <div className="border border-border rounded-lg p-4 bg-secondary/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-foreground">Box Contents</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: "", quantity: "", category: "Vegetables" })}
                                    className="text-brand-green border-border hover:bg-secondary"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                                        <div className="col-span-5">
                                            <Input
                                                {...register(`contents.${index}.name` as const, { required: true })}
                                                placeholder="Item Name"
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                {...register(`contents.${index}.quantity` as const, { required: true })}
                                                placeholder="Qty"
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                {...register(`contents.${index}.category` as const)}
                                                placeholder="Category"
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="col-span-1 pt-1 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="rounded border-border text-brand-green focus:ring-primary h-4 w-4"
                                    {...register("isActive")}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
                                    Active (Visible on site)
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="rounded border-border text-brand-green focus:ring-primary h-4 w-4"
                                    {...register("isFeatured")}
                                />
                                <label htmlFor="isFeatured" className="text-sm font-medium text-foreground cursor-pointer">
                                    Featured Plan
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary text-white min-w-[120px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingPlan ? "Update Plan" : "Create Plan"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
