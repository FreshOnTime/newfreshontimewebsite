// "use client";

// import { PageContainer } from "@/components/templates/PageContainer";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Edit2, Save, X, Plus, Minus } from "lucide-react";
// import { useState } from "react";
// import { calculateBagTotals } from "@/app/utils/bagCalculations";
// import { formatMeasurement } from "@/app/utils/measurement";
// import { Bag } from "@/app/models/Bag";

// export default function BagView() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [bag, setBag] = useState<Bag>({
//     id: "1",
//     name: "My Home",
//     description: "Weekly groceries for home",
//     items: [
//       {
//         product: {
//           sku: "RICE-001",
//           name: "Basmathi Rice",
//           image: "/rice.jpg",
//           description: "Premium Basmathi Rice",
//           baseMeasurementQuantity: 1,
//           pricePerBaseQuantity: 400,
//           measurementUnit: "kg",
//           isDiscreteItem: false,
//           minOrderQuantity: 0.5,
//           maxOrderQuantity: 5,
//           stepQuantity: 0.5,
//           stockQuantity: 100,
//           isOutOfStock: false,
//           totalSales: 500,
//           discountPercentage: 10,
//         },
//         quantity: 2,
//       },
//     ],
//     tags: ["Home", "Weekly"],
//   });

//   const { total, savings, originalTotal } = calculateBagTotals(bag.items);
//   const serviceFee = total * 0.3;
//   const finalTotal = total + serviceFee;

//   return (
//     <PageContainer>
//       {/* Bag Details Section */}
//       <div className="space-y-4 mb-8">
//         <div className="flex items-start justify-between">
//           {isEditing ? (
//             <div className="space-y-4 flex-1 mr-4">
//               <Input
//                 value={bag.name}
//                 onChange={(e) => setBag({ ...bag, name: e.target.value })}
//                 className="text-2xl font-bold"
//               />
//               <Textarea
//                 value={bag.description}
//                 onChange={(e) =>
//                   setBag({ ...bag, description: e.target.value })
//                 }
//                 placeholder="Add a description..."
//                 className="resize-none"
//               />
//               <div className="flex flex-wrap gap-2">
//                 {bag.tags.map((tag, index) => (
//                   <Badge
//                     key={index}
//                     variant="secondary"
//                     className="flex items-center gap-1"
//                   >
//                     {tag}
//                     <X
//                       className="h-3 w-3 cursor-pointer"
//                       onClick={() => {
//                         const newTags = bag.tags.filter((_, i) => i !== index);
//                         setBag({ ...bag, tags: newTags });
//                       }}
//                     />
//                   </Badge>
//                 ))}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     const tag = prompt("Enter new tag");
//                     if (tag) setBag({ ...bag, tags: [...bag.tags, tag] });
//                   }}
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add Tag
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <h1 className="text-2xl font-bold mb-2">{bag.name}</h1>
//               <p className="text-muted-foreground mb-4">{bag.description}</p>
//               <div className="flex flex-wrap gap-2">
//                 {bag.tags.map((tag, index) => (
//                   <Badge key={index} variant="secondary">
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           )}
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setIsEditing(!isEditing)}
//           >
//             {isEditing ? (
//               <>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save
//               </>
//             ) : (
//               <>
//                 <Edit2 className="h-4 w-4 mr-2" />
//                 Edit
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Items List */}
//       <div className="space-y-4 mb-8">
//         <h2 className="text-lg font-semibold">Items</h2>
//         <div className="divide-y">
//           {bag.items.map((item) => (
//             <div
//               key={item.product.sku}
//               className="py-4 flex items-center gap-4"
//             >
//               <div className="flex-1">
//                 <h3 className="font-medium">{item.product.name}</h3>
//                 <p className="text-sm text-muted-foreground">
//                   {formatMeasurement(
//                     item.quantity,
//                     item.product.measurementUnit
//                   )}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button variant="outline" size="icon">
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <Input
//                   type="number"
//                   value={item.quantity}
//                   className="w-20 text-center"
//                 />
//                 <Button variant="outline" size="icon">
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//               <div className="text-right min-w-[100px]">
//                 <p className="font-medium">
//                   Rs.{" "}
//                   {(item.quantity * item.product.pricePerBaseQuantity).toFixed(
//                     2
//                   )}
//                 </p>
//                 {(item.product.discountPercentage ?? 0) > 0 && (
//                   <p className="text-sm text-green-600">
//                     -{item.product.discountPercentage}%
//                   </p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Summary */}
//   <div className="rounded-lg border p-4 space-y-2">
//     <div className="flex justify-between text-sm">
//       <span>Subtotal</span>
//       <span>Rs. {originalTotal.toFixed(2)}</span>
//     </div>
//     <div className="flex justify-between text-sm text-green-600">
//       <span>Savings</span>
//       <span>-Rs. {savings.toFixed(2)}</span>
//     </div>
//     <div className="flex justify-between text-sm">
//       <span>Service Fee (30%)</span>
//       <span>Rs. {serviceFee.toFixed(2)}</span>
//     </div>
//     <div className="flex justify-between font-bold pt-2 border-t">
//       <span>Total</span>
//       <span>Rs. {finalTotal.toFixed(2)}</span>
//     </div>
//     <Button className="w-full mt-4">Order Now</Button>
//   </div>
//     </PageContainer>
//   );
// }
