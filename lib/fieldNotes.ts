export const fieldNotes = [
  {
    slug: 'the-bread-window', title: 'The bread window', category: 'Baking',
    excerpt: 'Buying from a small bakery starts with a question about the oven.',
    image: '/images/editorial/hands-at-work.webp', alt: 'A baker kneading dough beside a mixing bowl',
    kind: 'Bakery',
    sections: [
      ['Before the oven opens', 'A small bakery works to a rhythm. A tray of buns might leave the oven just as someone starts shaping the next batch. Asking “When are you baking?” can get you further than asking for a menu. It gives the baker room to tell you what they can make that day.'],
      ['Choose for the table', 'Think about when you want to eat. For breakfast, ask which bread will still have a good crust the following morning. For afternoon tea, ask how many pieces come in a batch and whether the filling is sweet or savoury. A photograph shows the finish. These details tell you whether it suits your table.'],
      ['Make the handover easy', 'Message the baker with the item, quantity and day you have in mind. Ask for the total and a pickup window. If you are collecting for someone else, pass on the maker’s instructions for carrying and storing the bake.'],
    ],
  },
  {
    slug: 'a-place-for-pepper', title: 'A place for pepper', category: 'Pantry notes',
    excerpt: 'A mortar, a handful of peppercorns and a small experiment at the stove.',
    image: '/images/editorial/pepper-mortar.webp', alt: 'Peppercorns and a mortar on a kitchen worktop',
    kind: 'Pantry',
    sections: [
      ['Start with the same spoonful', 'Set aside two spoonfuls of cooked dhal before you finish seasoning the pot. Crush a few peppercorns coarsely for one and grind a little more finely for the other. Taste them side by side. The coarse pieces give you distinct bites. The finer grind settles into the spoonful.'],
      ['Ask what is in the jar', 'A pantry maker may sell whole pepper, ground pepper or a blend intended for a particular dish. Ask how they like to use it and which other ingredients are in the mix. The answer is often a better starting point for dinner than the name on the jar.'],
      ['Keep a kitchen note', 'Write the maker’s name and your favourite use on the label. When you come back for another jar, you can ask for the same grind or tell them exactly what you would like to try next.'],
    ],
  },
  {
    slug: 'a-basket-of-greens', title: 'A basket of greens', category: 'Growers’ notebook',
    excerpt: 'A flexible shopping list for the days when a grower has something unexpected.',
    image: '/images/editorial/kitchen-basket.webp', alt: 'Fresh leaves and vegetables in a woven basket',
    kind: 'Produce',
    sections: [
      ['Ask about this picking', 'Start the conversation with what the grower has picked or plans to pick. A small harvest can vary from one week to another. Leave a line on your shopping list for something you have never cooked before.'],
      ['Buy for a meal', 'Tell the grower how many people you are cooking for. Ask about bunch size, how they prepare the stems and which leaves they would cook first. You can then plan the rest of the meal around what you are actually bringing home.'],
      ['Bring the conversation back', 'Save the grower’s page and make a note of what worked. A message about the mallung you made, or a question about a new leaf, gives you a natural place to start when the next picking comes around.'],
    ],
  },{"slug":"a-table-for-two","title":"A table for two: what to check before you go","category":"Dining guide","excerpt":"A practical way to choose a restaurant, from the menu to the final bill.","image":"/images/editorial/restaurant-kitchen.webp","alt":"A restaurant kitchen at work","kind":"Prepared food","destination":"/eat-drink","sections":[["Start with the occasion","For a quick lunch, check the menu and whether the kitchen serves throughout the afternoon. For a celebration, ask the venue about seating, reservations and any minimum spend. A photograph of a dining room cannot tell you how loud it will be or how much time you will have at the table."],["Read the menu as a bill","Choose a realistic combination of food and drinks for each person. Ask whether prices include taxes and service charges, and whether water or extras are billed separately. If sharing dishes, calculate from the actual quantities instead of multiplying every item by the number of diners."],["Confirm before leaving","Check current opening hours and the venue's own contact channel. Ask about parking, accessibility or dietary requirements if those matter. If an allergy is involved, speak directly with the kitchen about ingredients and cross-contact. A directory label is not a guarantee."]]},
  {"slug":"the-price-on-the-jar","title":"The price on the jar","category":"Buying guide","excerpt":"Compare different pack sizes without mistaking the cheapest sticker for the best value.","image":"/images/editorial/market-crates.webp","alt":"Produce arranged in market crates","kind":"Pantry","destination":"/food-tools","sections":[["Put both products on the same scale","Divide the price by the net weight in grams and multiply by 100. For example, Rs. 900 for 150g is Rs. 600 per 100g, while Rs. 1,200 for 250g is Rs. 480 per 100g. The larger pack is less expensive per gram in this illustration."],["Compare like with like","A jar of pure nut butter is not necessarily equivalent to a sweetened spread. Read the ingredient list, net quantity and storage guidance. Price per 100g helps you compare cost but cannot establish flavour, ingredient quality or nutritional suitability."],["Buy what you will finish","A cheaper unit price can become poor value if you cannot use the product before it expires. Ask a small maker about storage, availability and the smallest pack they offer. Include collection or delivery fees when comparing the total spend."]]},
  {"slug":"a-gift-worth-opening","title":"A food gift worth opening","category":"Gifting guide","excerpt":"A buyer's checklist for thoughtful hampers, celebration food and corporate gifts.","image":"/images/editorial/recipe-ingredients.webp","alt":"Ingredients for a food gift arranged on a worktop","kind":"Other","destination":"/gifting","sections":[["Start with the person","Consider whether the recipient prefers tea, coffee, baked goods, savoury snacks or pantry ingredients. Confirm dietary needs directly with the supplier instead of assuming a gift is suitable based on its name. For gifts travelling long distances, ask about shelf life and storage."],["Ask for a complete quotation","Request the item list, quantities, packaging, personalization charges, minimum order and delivery or pickup arrangements. Corporate buyers should also ask whether a sample is available, how substitutions are handled and when the final quantity must be confirmed."],["Plan the handover","Set a delivery deadline with the supplier and clarify who handles failed delivery or damaged items. For a large order, agree deposit and cancellation terms before committing. Keep the supplier's confirmation and the recipient details secure."]]}
];
export type FieldNote = typeof fieldNotes[number];
export const notePath = (note: FieldNote) => `/stories/${note.slug}`;
