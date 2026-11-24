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
  },
];
export type FieldNote = typeof fieldNotes[number];
export const notePath = (note: FieldNote) => `/stories/${note.slug}`;
