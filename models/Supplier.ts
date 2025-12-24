export interface SupplierAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Supplier {
    _id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: SupplierAddress;
    paymentTerms: "net-15" | "net-30" | "net-60" | "net-90" | "cod" | "prepaid" | string;
    notes?: string;
    status: "active" | "inactive";
    totalProducts?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
