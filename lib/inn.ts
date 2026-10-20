export const inn = {
  name: "Larkspur House",
  strapline: "An inn of six rooms, a kitchen garden and a very old oak.",
  established: 1786,
  address: {
    line1: "Larkspur House",
    line2: "Underley",
    town: "Kirkby Lonsdale",
    county: "Cumbria",
    postcode: "LA6 2QH",
  },
  addressLine: "Underley, Kirkby Lonsdale, Cumbria LA6 2QH",
  phone: "015242 72 314",
  phoneHref: "+441524272314",
  email: "hello@larkspurhouse.co.uk",
  innkeeperEmail: "margaret@larkspurhouse.co.uk",
  innkeepers: "Margaret & Tom Ellery",
  region: "The Lune Valley, Cumbria",
  checkIn: "3pm",
  checkOut: "11am",
  supper: "7pm",
  breakfast: "8–10am",
  currency: "£",
  coordinates: { lat: 54.2, lng: -2.6 },
} as const;

export const navLinks = [
  { href: "/rooms", label: "The rooms" },
  { href: "/menu", label: "At the table" },
  { href: "/grounds", label: "The grounds" },
  { href: "/guestbook", label: "Guestbook" },
  { href: "/find-us", label: "Finding us" },
] as const;

export const innkeeperNav = [
  { href: "/desk", label: "Overview", exact: true },
  { href: "/desk/requests", label: "Requests" },
  { href: "/desk/calendar", label: "Calendar" },
  { href: "/desk/rooms", label: "Rooms" },
  { href: "/desk/menu", label: "Menu" },
  { href: "/desk/guestbook", label: "Guestbook" },
] as const;

export const practicalities = [
  {
    title: "Arriving",
    body: "Check in from 3pm, and please let us know if you'll be later than seven — we'll leave the porch light and a note on the hall table. Check out is by 11am, though you're welcome to leave the car and walk.",
  },
  {
    title: "Supper",
    body: "One sitting at 7pm, five nights a week, in the old dining room. Residents and a handful of villagers. We cook what the garden and the valley give us; tell us about allergies when you write.",
  },
  {
    title: "Dogs & children",
    body: "Well-behaved dogs are welcome in the Wren, the Hollow Oak, the Hayloft and the Shepherd's Hut, at £12 a night. Children are welcome everywhere, and the Hollow Oak has room for four.",
  },
  {
    title: "No payment online",
    body: "Send a request and we'll write back — usually the same day. Nothing is charged to a card, because we never ask for one. We settle up over breakfast, or before you go.",
  },
];
