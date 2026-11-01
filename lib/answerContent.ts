/** Answers must match the visible page and operational policies. No invented guarantees. */
export interface AnswerItem {
  question: string;
  answer: string;
}

export const BUSINESS_FAQS: readonly AnswerItem[] = [
  {
    question: "Who can apply to become a FreshPick supplier?",
    answer: "FreshPick welcomes applications from growers, farms, local food makers, producers, established brands, distributors and importers. Applications are reviewed for product fit, quality, consistency and practical supply requirements. Start by sharing what you produce or supply, where you operate and the quantities you can reliably offer. An application does not guarantee approval.",
  },
  {
    question: "Is FreshPick an open marketplace?",
    answer: "FreshPick uses a curated supplier model rather than automatically publishing every submitted product. The team reviews applications before onboarding, including product information, quality and operational fit. This helps customers understand what they are buying while giving growers and makers a clear process for introducing their food to the market.",
  },
  {
    question: "Can restaurants, hotels and offices partner with FreshPick?",
    answer: "Restaurants, cafés, hotels, offices and other businesses can enquire about food sourcing or supply partnerships. Share the ingredients or products you need, expected quantities, delivery location and how regularly you would order. FreshPick can then discuss whether current availability and operational arrangements can support your request.",
  },
];

export const PRODUCER_FAQS: readonly AnswerItem[] = [
  {
    question: "Can small home growers apply to sell through FreshPick?",
    answer: "Yes. FreshPick accepts applications from home growers and small producers as well as established food suppliers. Tell the team what you grow, your location, harvest season and quantities you could provide. Applications are reviewed individually, and being a small producer does not automatically mean a product will be listed.",
  },
  {
    question: "What product details should a food supplier prepare?",
    answer: "Provide clear product names, pack sizes, prices and photographs, alongside expected availability and quantities. For prepared or packaged foods, include ingredients, allergens, storage instructions and shelf-life information where applicable. FreshPick reviews these details as part of onboarding and may request additional information before a listing becomes available.",
  },
  {
    question: "How does supplier onboarding work?",
    answer: "Start with the supplier application, explaining your business or growing activity and the products you offer. The FreshPick team reviews the information and discusses pricing, availability, packaging and supply arrangements when relevant. Once an arrangement is agreed, suppliers can prepare catalogue information and use the supplier tools available to their account.",
  },
];

export const ABOUT_FAQS: readonly AnswerItem[] = [
  {
    question: "What is FreshPick?",
    answer: "FreshPick is a Sri Lankan online food market focused on everyday shopping for Colombo households. Customers can browse fresh produce, pantry staples, bakery products and available prepared or homemade food. The website shows current catalogue items and prices and also provides a route for local growers, makers and businesses to enquire about supplying products.",
  },
  {
    question: "How can I shop for groceries with FreshPick?",
    answer: "Browse the product catalogue or start with a category, choose the items and quantities you want, then review your bag before checkout. Product availability and prices can change, so use the live catalogue as your reference. Delivery options and charges are confirmed during ordering, and customer support can help with service-area questions.",
  },
];

export const DIASPORA_FAQS: readonly AnswerItem[] = [
  {
    question: "Can I arrange a grocery order for family in Colombo?",
    answer: "You can browse FreshPick and prepare an order for someone in a supported Colombo delivery area. Use their accurate delivery address and contact information at checkout, then review available payment and delivery arrangements before submitting an order. Contact FreshPick first if you are unsure whether a particular location or arrangement is supported.",
  },
  {
    question: "Are products or delivery dates guaranteed when ordering for someone else?",
    answer: "No fixed gift box, product or delivery time is guaranteed by this page. FreshPick uses the live product catalogue, and availability can vary. The checkout flow and customer support team provide the relevant details for the recipient's address, selected items and schedule. Review those details before arranging an order on another person's behalf.",
  },
];
