export const occasions = ['Birthdays', 'Date nights', 'Family time'] as const;

export const experiences = [
  {
    slug: 'dinner-for-two', title: 'Dinner for two', kind: 'Dining',
    occasions: ['Date nights', 'Birthdays'], image: '/images/experiences/table.webp',
    alt: 'A long dinner table set with flowers and glassware',
    summary: 'Plan a seated dinner around a birthday, an anniversary or an evening together.',
    details: 'Ask about a table for two, the menu, dietary needs and a preferred sitting. If this is a gift, tell us who will be attending.',
  },
  {
    slug: 'baking-together', title: 'Bake together', kind: 'Hosted workshop',
    occasions: ['Birthdays', 'Family time', 'Date nights'], image: '/images/editorial/hands-at-work.webp',
    alt: 'Hands working dough on a baking surface',
    summary: 'Get hands-on in the kitchen with a baking session for friends or family.',
    details: 'Share the group size, ages and what you would like to make. Ask about a host, class duration, materials and what guests can take home.',
  },
  {
    slug: 'family-lunch', title: 'A family lunch at home', kind: 'Food to share',
    occasions: ['Family time', 'Birthdays'], image: '/images/categories/cooked-food.webp',
    alt: 'Prepared food ready to serve',
    summary: 'Gather everyone around a shared meal at home.',
    details: 'Tell us how many people are coming, any dietary needs and the delivery area. Ask about serving sizes, the menu and pickup or delivery.',
  },
];
