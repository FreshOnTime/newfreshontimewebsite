"use client";

import { Order } from "@/models/order";

const KEY = "fp_orders_v1";

function read(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function write(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function listOrders(): Order[] {
  return read();
}

export function getOrder(id: string): Order | undefined {
  return read().find((o) => o.id === id);
}

export function addOrder(order: Order) {
  const orders = read();
  orders.unshift(order);
  write(orders);
}
