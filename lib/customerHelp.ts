import { SERVICE_AREAS } from '@/lib/config/site';

export const CUSTOMER_QUESTIONS = [
  { question: 'What can I order from FreshPick?', answer: 'FreshPick lets you browse groceries, ready meals and homemade food, and build recurring grocery baskets. The market shows the products and stock available now.', href: '/products', action: 'Browse the market' },
  { question: 'Where does FreshPick deliver?', answer: `FreshPick serves supported delivery areas in and around Colombo, including ${SERVICE_AREAS.join(', ')}. Contact us to confirm arrangements for your address before ordering.`, href: '/contact', action: 'Confirm your delivery area' },
  { question: 'How can I pay for an order?', answer: 'Website checkout currently supports cash on delivery. Product prices and basket totals are shown in Sri Lankan rupees (LKR). Review your total and delivery charges before placing the order.', href: '/products', action: 'Start shopping' },
  { question: 'When will my order arrive?', answer: 'Delivery arrangements depend on your address, available stock and selected schedule. Contact FreshPick to confirm timing for your order. Recurring baskets let you choose available delivery days during checkout.', href: '/contact', action: 'Ask about delivery' },
  { question: 'How do I get help with an order?', answer: 'Sign in to review your orders, then contact FreshPick with your order number and the issue. For damaged products, replacements or returns, check the refund and replacement policy.', href: '/refund', action: 'Read the refund policy' },
] as const;
