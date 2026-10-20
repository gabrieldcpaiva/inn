import type { Database } from "@/lib/db";
import { addDays, todayISO, type ISODate } from "@/lib/dates";
import { hashPassword } from "@/lib/passwords";

type RoomSeed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  capacity: number;
  beds: string;
  sizeSqm: number;
  nightlyRate: number;
  amenities: string[];
  sortOrder: number;
  photos: { file: string; alt: string }[];
};

const rooms: RoomSeed[] = [
  {
    slug: "mulberry",
    name: "The Mulberry Room",
    tagline: "A garden suite with its own door onto the walled garden.",
    description:
      "The largest of the garden rooms, and the only one with a key of its own. A low window seat looks down the mulberry tree and along the border of lavender; in summer you will leave the door open until the moths come in.\n\nThere is a deep roll-top bath in the corner of the room, a superking bed under a linen canopy, and a writing desk that has been in the family since the house was a farm. In the morning, the light comes through the garden rather than the road, which is the whole point of it.",
    capacity: 2,
    beds: "Superking, or twins on request",
    sizeSqm: 28,
    nightlyRate: 185,
    amenities: [
      "Private garden door",
      "Roll-top bath",
      "Walk-in shower",
      "Superking bed",
      "Writing desk",
      "Fresh milk & ground coffee",
      "Bathrobes",
    ],
    sortOrder: 1,
    photos: [
      { file: "mulberry-1.jpg", alt: "The Mulberry Room, with a pale panelled wall and a low window looking onto the garden" },
      { file: "mulberry-2.jpg", alt: "The roll-top bath in the bay window of the Mulberry Room" },
    ],
  },
  {
    slug: "wren",
    name: "The Wren",
    tagline: "A snug double under the old beams, with a seat in the window.",
    description:
      "The smallest room in the house and, we are told, the one people ask for again. It sits over the old kitchen, so the beams are low and the floorboards slope in the way that only a two-hundred-year-old building allows.\n\nThere is an iron double bed, a window seat looking over the orchard, and a wet-room shower tucked behind an oak door. In winter the radiator clicks and the wind gets into the chimney — bring a jumper and a book, and you will be very content.",
    capacity: 2,
    beds: "Iron double",
    sizeSqm: 16,
    nightlyRate: 135,
    amenities: [
      "Iron double bed",
      "Window seat",
      "Wet-room shower",
      "Orchard view",
      "Radio & books",
      "Fresh milk",
      "Dogs welcome",
    ],
    sortOrder: 2,
    photos: [
      { file: "wren-1.jpg", alt: "The Wren, with low beams, an iron bed and a stone fireplace" },
      { file: "wren-2.jpg", alt: "Window light falling across the patchwork quilt in the Wren" },
    ],
  },
  {
    slug: "hollow-oak",
    name: "The Hollow Oak",
    tagline: "For families, with a low-beamed snug for the children.",
    description:
      "Named for the oak in the top field, which is hollow enough to sit inside. The room has a double bed, and a snug behind a curtain with two singles, a chest of board games and a window that looks straight at the fell.\n\nIt is the room we built for our own children, so it is sturdy: a big bath, a deep cupboard for boots and coats, and a door that shuts properly. Four can sleep here without anyone feeling they are on a shelf.",
    capacity: 4,
    beds: "Double + two singles",
    sizeSqm: 24,
    nightlyRate: 165,
    amenities: [
      "Two sleeping areas",
      "Bath & shower",
      "Board games",
      "Fell view",
      "Boot cupboard",
      "Travel cot available",
      "Dogs welcome",
    ],
    sortOrder: 3,
    photos: [
      { file: "hollow-oak-1.jpg", alt: "The Hollow Oak, with a carved wooden bed and whitewashed beams" },
    ],
  },
  {
    slug: "larkspur",
    name: "The Larkspur Room",
    tagline: "A four-poster, a long view, and a decanter of something.",
    description:
      "Our grandest room, at the front of the house, with two tall sash windows and a view that runs over the walled garden to the fells. The four-poster is old and a little creaky; the mattress is new and considerable.\n\nThere is a bath set into the window, deep enough to disappear into, and a table for two by the fire for the evenings you would rather not come down. A decanter of sherry is left out, because it always was.",
    capacity: 2,
    beds: "Four-poster superking",
    sizeSqm: 26,
    nightlyRate: 210,
    amenities: [
      "Four-poster bed",
      "Bath in the window",
      "Sitting nook",
      "Fell view",
      "Sherry decanter",
      "Fresh milk & ground coffee",
      "Bathrobes",
    ],
    sortOrder: 4,
    photos: [
      { file: "larkspur-1.jpg", alt: "The Larkspur Room, with a four-poster bed and sage green walls" },
      { file: "larkspur-2.jpg", alt: "The Larkspur Room's fireplace and deep armchairs" },
      { file: "larkspur-3.jpg", alt: "Morning light through the tall window of the Larkspur Room" },
    ],
  },
  {
    slug: "hayloft",
    name: "The Hayloft",
    tagline: "Up the old stone stairs, under the vaulted roof.",
    description:
      "The hayloft of the original barn, reached by an outside stair that is treacherous only after the second glass. Inside it is one long room under the rafters, with two single beds that make up as a superking if you would rather.\n\nThere is a small balcony over the yard where you can watch the swallows come in, and a walk-in shower behind a sliding door. It is a good room for friends walking the fells, or for anyone who likes to hear the rain on a slate roof.",
    capacity: 2,
    beds: "Twins or superking",
    sizeSqm: 18,
    nightlyRate: 150,
    amenities: [
      "Vaulted beams",
      "Twin or superking",
      "Balcony over the yard",
      "Walk-in shower",
      "Boot rack",
      "Fresh milk",
      "Dogs welcome",
    ],
    sortOrder: 5,
    photos: [
      { file: "hayloft-1.jpg", alt: "The Hayloft, with a pale arched window and a bed made with white linen" },
      { file: "hayloft-2.jpg", alt: "The view from the Hayloft's little balcony over the yard" },
    ],
  },
  {
    slug: "shepherds-hut",
    name: "The Shepherd's Hut",
    tagline: "One room in the orchard, a wood-burner and the whole sky.",
    description:
      "A proper shepherd's hut on wheels, painted the colour of a duck egg, parked at the bottom of the orchard with nothing between you and the fell. Inside there is a double bed, a wood-burner, a kettle and a small table; outside, a shower hut with hot water and a compost loo a few steps away.\n\nThere is no wifi out here and the phone signal is a rumour. There is a torch, a bench facing west, and a great deal of quiet. In September the apples fall on the roof in the night.",
    capacity: 2,
    beds: "Double",
    sizeSqm: 11,
    nightlyRate: 120,
    amenities: [
      "Wood-burner",
      "Orchard setting",
      "Outdoor shower hut",
      "Compost loo",
      "Kettle & tea",
      "No wifi, by design",
      "Dogs welcome",
    ],
    sortOrder: 6,
    photos: [
      { file: "hut-1.jpg", alt: "The Shepherd's Hut in the orchard, painted duck-egg green" },
      { file: "hut-2.jpg", alt: "The hut at dusk, with the orchard hedge behind it" },
    ],
  },
];

type MenuSeed = {
  season: "spring" | "summer" | "autumn" | "winter";
  title: string;
  intro: string;
  published: boolean;
  items: { section: string; name: string; description: string; dietary: string[] }[];
};

const menus: MenuSeed[] = [
  {
    season: "autumn",
    title: "The autumn table",
    intro:
      "Three courses, £62 · two courses, £48. Bread, cultured butter and a little something to begin are on us. The garden is finishing; the orchard is not.",
    published: true,
    items: [
      { section: "Small things", name: "Sourdough & cultured butter", description: "Baked at six, with sea salt from the Cheshire coast.", dietary: ["v"] },
      { section: "Small things", name: "Larkspur pickles & garden radishes", description: "Whatever is still standing in the beds, salted and sharp.", dietary: ["vg", "gf"] },
      { section: "Small things", name: "Smoked Cumbrian ham, damson jam", description: "From the smokehouse at the bottom of the valley.", dietary: ["gf"] },
      { section: "To begin", name: "Roast pumpkin soup", description: "Brown butter, sage, a spoon of crème fraîche.", dietary: ["v", "gf"] },
      { section: "To begin", name: "Cured trout, horseradish cream", description: "Dill oil, rye crispbread, lemon.", dietary: ["gf"] },
      { section: "To begin", name: "Beetroot & Kirkham's cheese tart", description: "Walnuts, watercress, a little honey.", dietary: ["v"] },
      { section: "To begin", name: "Mussels, cider & thyme", description: "A bowl to share, with grilled bread for the liquor.", dietary: [] },
      { section: "Main plates", name: "Fell-raised lamb shoulder", description: "Slow-cooked with quince, buttered greens, roast potatoes.", dietary: ["gf"] },
      { section: "Main plates", name: "Wild mushroom & barley risotto", description: "Aged parmesan, thyme, a handful of parsley.", dietary: ["v"] },
      { section: "Main plates", name: "Roast cod, brown shrimp, leeks", description: "Beurre noisette, capers, new potatoes.", dietary: ["gf"] },
      { section: "Main plates", name: "Celeriac & hazelnut gratin", description: "Winter leaves, mustard dressing, sourdough crumbs.", dietary: ["vg", "gf"] },
      { section: "Puddings", name: "Damson & almond tart", description: "Clotted cream, or custard if you'd rather.", dietary: ["v"] },
      { section: "Puddings", name: "Buttermilk pudding, poached pears", description: "From the tree by the gate; a little too many this year.", dietary: ["v", "gf"] },
      { section: "Puddings", name: "Dark chocolate & stout pot", description: "Salted cream, a shortbread finger.", dietary: ["v", "gf"] },
      { section: "Puddings", name: "Cumbrian cheeses", description: "Oat biscuits, quince, celery.", dietary: ["v"] },
      { section: "A last glass", name: "Hedgerow gin, elderflower tonic", description: "Sloe and damsons from the lane, steeped in the pantry.", dietary: ["vg"] },
      { section: "A last glass", name: "Mulled cider", description: "From the orchard, with cloves and a little honey.", dietary: ["vg", "gf"] },
      { section: "A last glass", name: "Port, by the fire", description: "Because the fire will still be lit.", dietary: ["vg"] },
    ],
  },
  {
    season: "winter",
    title: "The winter table",
    intro:
      "Three courses, £62 · two courses, £48. The fire is lit by four; supper is at seven. Game from the valley, roots from the store, and rather a lot of butter.",
    published: true,
    items: [
      { section: "Small things", name: "Sourdough & cultured butter", description: "Baked at six, with sea salt.", dietary: ["v"] },
      { section: "Small things", name: "Smoked ham, mustard & pickled walnuts", description: "A small plate to start the evening.", dietary: ["gf"] },
      { section: "Small things", name: "Cheddar, chutney, oat biscuits", description: "Kirkham's, at the end of the lane.", dietary: ["v"] },
      { section: "To begin", name: "Celeriac soup, hazelnut oil", description: "Crisp celeriac, chives, warm bread.", dietary: ["vg", "gf"] },
      { section: "To begin", name: "Smoked salmon, horseradish, rye", description: "Cucumber, dill, lemon.", dietary: [] },
      { section: "To begin", name: "Game terrine, quince, toast", description: "Pheasant and rabbit, made on Mondays.", dietary: [] },
      { section: "To begin", name: "Roast beetroot, goat's curd, walnut", description: "Chicory, honey, a little orange.", dietary: ["v", "gf"] },
      { section: "Main plates", name: "Beef & ale pie", description: "Buttered greens, mash, a jug of gravy.", dietary: [] },
      { section: "Main plates", name: "Mutton hotpot", description: "Pickled red cabbage, crusty top, a spoon for the middle.", dietary: ["gf"] },
      { section: "Main plates", name: "Mushroom & chestnut pie", description: "Root vegetables, greens, vegetarian gravy.", dietary: ["v"] },
      { section: "Main plates", name: "Baked cod, leeks, mustard cream", description: "Potatoes, capers, lemon.", dietary: ["gf"] },
      { section: "Puddings", name: "Sticky toffee pudding", description: "Hot cream, and no apology.", dietary: ["v"] },
      { section: "Puddings", name: "Burnt apple crumble, custard", description: "Orchard apples, oats, a little char on top.", dietary: ["v"] },
      { section: "Puddings", name: "Chocolate & chestnut tart", description: "Crème fraîche, sea salt.", dietary: ["v"] },
      { section: "Puddings", name: "Cumbrian cheeses", description: "Oat biscuits, quince, celery.", dietary: ["v"] },
      { section: "A last glass", name: "Mulled cider", description: "From the orchard, with cloves and honey.", dietary: ["vg", "gf"] },
      { section: "A last glass", name: "Hot buttered rum", description: "For coming in from the cold.", dietary: ["v"] },
    ],
  },
  {
    season: "spring",
    title: "The spring table",
    intro:
      "Three courses, £58 · two courses, £45. Wild garlic from the beck, asparagus from the other side of the valley, and eggs from the hen house behind the wall.",
    published: true,
    items: [
      { section: "Small things", name: "Sourdough & cultured butter", description: "Baked at six, with sea salt.", dietary: ["v"] },
      { section: "Small things", name: "New-season radishes, whipped goat's curd", description: "The first sharp thing of the year.", dietary: ["v", "gf"] },
      { section: "Small things", name: "Pickled rhubarb & ham", description: "Sweet-cured, sliced thin.", dietary: ["gf"] },
      { section: "To begin", name: "Wild garlic soup, poached egg", description: "From the beck behind the orchard; bread for dipping.", dietary: ["v", "gf"] },
      { section: "To begin", name: "Asparagus, hollandaise, chervil", description: "When the crop is on, we serve it every night.", dietary: ["v", "gf"] },
      { section: "To begin", name: "Crab on toast", description: "Brown crab, lemon, a little chilli.", dietary: [] },
      { section: "To begin", name: "Spring leaf salad, toasted seeds", description: "Whatever is young enough, with a sharp dressing.", dietary: ["vg", "gf"] },
      { section: "Main plates", name: "Easter lamb, jersey royals, mint", description: "Shoulder, slow-cooked; the first new potatoes.", dietary: ["gf"] },
      { section: "Main plates", name: "Wild garlic & ricotta tart", description: "Watercress, buttered new potatoes.", dietary: ["v"] },
      { section: "Main plates", name: "Roast hake, purple sprouting, almonds", description: "Lemon butter, capers.", dietary: ["gf"] },
      { section: "Main plates", name: "Potato & nettle dumplings", description: "Brown butter, sage, a little parmesan.", dietary: ["v"] },
      { section: "Puddings", name: "Rhubarb & custard tart", description: "The first forced rhubarb, and a great deal of custard.", dietary: ["v"] },
      { section: "Puddings", name: "Lemon posset, shortbread", description: "Sharp, cold, and gone in three minutes.", dietary: ["v"] },
      { section: "Puddings", name: "Cumbrian cheeses", description: "Oat biscuits, quince, celery.", dietary: ["v"] },
      { section: "A last glass", name: "Rhubarb cordial, soda", description: "From the garden, and better than it sounds.", dietary: ["vg", "gf"] },
      { section: "A last glass", name: "Damson gin", description: "Put down last autumn, brought out too early.", dietary: ["vg", "gf"] },
    ],
  },
  {
    season: "summer",
    title: "The summer table",
    intro:
      "Three courses, £58 · two courses, £45. Most of it comes from the garden, the rest from the valley. If the evening is fine, we will lay the tables on the lawn.",
    published: true,
    items: [
      { section: "Small things", name: "Sourdough & cultured butter", description: "Baked at six, with sea salt.", dietary: ["v"] },
      { section: "Small things", name: "Garden radishes, whipped goat's curd", description: "A handful of herbs, a little honey.", dietary: ["v", "gf"] },
      { section: "Small things", name: "Cured ham, pea shoots", description: "From the smokehouse down the valley.", dietary: ["gf"] },
      { section: "To begin", name: "Chilled pea soup, mint oil", description: "Cold and green; bread for dipping.", dietary: ["v", "gf"] },
      { section: "To begin", name: "Cucumber & smoked trout", description: "Dill, crème fraîche, lemon.", dietary: ["gf"] },
      { section: "To begin", name: "Courgette fritters, lemon yoghurt", description: "From the two plants that got out of hand.", dietary: ["v"] },
      { section: "To begin", name: "Potted shrimp on toast", description: "Nutmeg, mace, a lot of butter.", dietary: [] },
      { section: "Main plates", name: "Herb-roasted chicken, girolles", description: "New potatoes, garden beans, a jug of juices.", dietary: ["gf"] },
      { section: "Main plates", name: "Baked aubergine, tomato & basil", description: "Ricotta, pine nuts, sourdough crumbs.", dietary: ["v"] },
      { section: "Main plates", name: "Sea bass, samphire, brown butter", description: "New potatoes, lemon.", dietary: ["gf"] },
      { section: "Main plates", name: "Garden salad plate, soft egg", description: "Leaves, seeds, pickled beetroot, warm bread.", dietary: ["v", "gf"] },
      { section: "Puddings", name: "Gooseberry fool, shortbread", description: "From the bush by the gate.", dietary: ["v"] },
      { section: "Puddings", name: "Strawberries, buttermilk ice", description: "A little black pepper, if you like.", dietary: ["v", "gf"] },
      { section: "Puddings", name: "Elderflower posset, raspberries", description: "Cold, sharp, and the colour of the evening.", dietary: ["v", "gf"] },
      { section: "Puddings", name: "Cumbrian cheeses", description: "Oat biscuits, quince, celery.", dietary: ["v"] },
      { section: "A last glass", name: "Elderflower pressé", description: "Picked from the lane in June.", dietary: ["vg", "gf"] },
      { section: "A last glass", name: "Pimm's from the garden", description: "Cucumber, mint, borage, a great deal of ice.", dietary: ["vg"] },
    ],
  },
];

type GuestbookSeed = {
  name: string;
  location: string;
  stayMonth: string;
  message: string;
  status: "approved" | "pending";
  daysAgo: number;
};

const guestbook: GuestbookSeed[] = [
  {
    name: "Helen & James",
    location: "Settle",
    stayMonth: "October",
    message:
      "We came for two nights and stayed for four. Maggie noticed it was James's birthday before we had mentioned it and a candle appeared in the pudding. The fire was lit when we came down, the dog was allowed to lie in front of it, and nobody hurried us off in the morning. We are already arguing about which room to book next.",
    status: "approved",
    daysAgo: 6,
  },
  {
    name: "Priya",
    location: "Manchester",
    stayMonth: "September",
    message:
      "I came on my own for a weekend of walking and was looked after exactly as much as I wanted to be. The Wren is small and the beams are low and it is the best sleep I have had in a year. Take the path up the fell behind the orchard; be back by six for supper.",
    status: "approved",
    daysAgo: 17,
  },
  {
    name: "The Rowan family",
    location: "York",
    stayMonth: "August",
    message:
      "Three generations, one long table, and not a single complaint from anyone between the ages of six and eighty-two. The children were put to work picking beans and considered it a treat. Tom's pie has entered family legend.",
    status: "approved",
    daysAgo: 34,
  },
  {
    name: "Tomás & Ines",
    location: "Bristol",
    stayMonth: "July",
    message:
      "The Shepherd's Hut is a genuine hut, not a hotel room pretending. A wood-burner, an outdoor shower, apples falling on the roof at night. We sat outside until the stars came out properly and heard absolutely nothing but owls.",
    status: "approved",
    daysAgo: 52,
  },
  {
    name: "Margaret",
    location: "Edinburgh",
    stayMonth: "June",
    message:
      "The Larkspur Room is worth it for the bath in the window alone. I read an entire book in it while it rained on the fells. Breakfast is unhurried and the porridge comes with cream and whisky, which I have thought about daily since.",
    status: "approved",
    daysAgo: 71,
  },
  {
    name: "Ben & Sal",
    location: "Leeds",
    stayMonth: "May",
    message:
      "We booked two nights on the way to Scotland and it became the whole holiday. The garden in May is something else — the paths, the gate, the smell of it after rain. Somebody please give Maggie's bread a prize.",
    status: "approved",
    daysAgo: 96,
  },
  {
    name: "Yusuf",
    location: "Birmingham",
    stayMonth: "April",
    message:
      "As two vegans on a walking holiday we are used to being a nuisance. Here we were handed a menu with almost half of it marked and told not to worry. The celeriac gratin was the best thing I ate all year.",
    status: "approved",
    daysAgo: 118,
  },
  {
    name: "Nora",
    location: "London",
    stayMonth: "March",
    message:
      "Arrived tired and left feeling like a person again. I liked that there is no television in the sitting room, that the wifi is patchy in the best way, and that the fire is lit by four whether there are guests or not.",
    status: "approved",
    daysAgo: 143,
  },
  {
    name: "Gareth Lloyd",
    location: "Cardiff",
    stayMonth: "October",
    message:
      "We stayed in the Hollo Oak with our two and had a wonderful time. The only thing was the shower took a while to run hot. Would come again.",
    status: "pending",
    daysAgo: 1,
  },
  {
    name: "Suki",
    location: "Newcastle",
    stayMonth: "September",
    message:
      "Lovely old house and a very warm welcome. Please pass on my thanks to the kitchen for the birthday plate.",
    status: "pending",
    daysAgo: 2,
  },
  {
    name: "A. M. Fletcher",
    location: "Kendal",
    stayMonth: "August",
    message:
      "Good lunch, slow service. The garden is pretty. Might try a room next time.",
    status: "pending",
    daysAgo: 4,
  },
];

type RequestSeed = {
  roomSlug: string;
  name: string;
  email: string;
  phone: string;
  checkInOffset: number;
  checkOutOffset: number;
  adults: number;
  children: number;
  message: string;
  status: "pending" | "confirmed" | "declined";
  note?: string;
  createdDaysAgo: number;
};

const requests: RequestSeed[] = [
  {
    roomSlug: "wren",
    name: "Alastair Finch",
    email: "a.finch@example.com",
    phone: "07700 900112",
    checkInOffset: 1,
    checkOutOffset: 4,
    adults: 2,
    children: 0,
    message: "Two of us and a well-behaved collie, walking the Dales Way. Late arrival, around 8pm if that's all right.",
    status: "confirmed",
    note: "Collie very welcome. Porch light on, cold supper left out.",
    createdDaysAgo: 12,
  },
  {
    roomSlug: "larkspur",
    name: "Harrington",
    email: "j.harrington@example.com",
    phone: "07700 900233",
    checkInOffset: 4,
    checkOutOffset: 7,
    adults: 2,
    children: 0,
    message: "Fifth anniversary. We'd love the room with the bath in the window. No dietary requirements.",
    status: "confirmed",
    note: "Bath, view and a decanter ready. Anniversary noted for Thursday.",
    createdDaysAgo: 9,
  },
  {
    roomSlug: "shepherds-hut",
    name: "Daniel & Wei Chen",
    email: "wei.chen@example.com",
    phone: "07700 900341",
    checkInOffset: 9,
    checkOutOffset: 11,
    adults: 2,
    children: 0,
    message: "Hoping the hut is free — we don't mind the cold. We'll be on foot from Kirkby Lonsdale.",
    status: "confirmed",
    note: "Hut held. Extra logs in the box, torch on the hook.",
    createdDaysAgo: 3,
  },
  {
    roomSlug: "mulberry",
    name: "Rachel Okafor",
    email: "r.okafor@example.com",
    phone: "07700 900489",
    checkInOffset: 12,
    checkOutOffset: 16,
    adults: 2,
    children: 0,
    message: "Four nights, celebrating a birthday halfway through. One vegetarian.",
    status: "confirmed",
    note: "Birthday pudding arranged for the Tuesday.",
    createdDaysAgo: 6,
  },
  {
    roomSlug: "hayloft",
    name: "Sofia Marchetti",
    email: "sofia.m@example.com",
    phone: "07700 900555",
    checkInOffset: 18,
    checkOutOffset: 21,
    adults: 2,
    children: 0,
    message: "Twins please, and we'd like to try the supper on at least two nights.",
    status: "confirmed",
    note: "Twins made up. Table booked both nights.",
    createdDaysAgo: 2,
  },
  {
    roomSlug: "hollow-oak",
    name: "Bennett",
    email: "k.bennett@example.com",
    phone: "07700 900612",
    checkInOffset: 25,
    checkOutOffset: 28,
    adults: 2,
    children: 2,
    message: "Family of four, children aged 7 and 10. We'd need the travel cot? No — sorry, they're too big for that now.",
    status: "confirmed",
    note: "Travel cot not needed. Board games left out.",
    createdDaysAgo: 4,
  },
  {
    roomSlug: "larkspur",
    name: "Grace Whitmore",
    email: "grace.whitmore@example.com",
    phone: "07700 900701",
    checkInOffset: 30,
    checkOutOffset: 33,
    adults: 2,
    children: 0,
    message: "A quiet three nights for my mother's 70th — she has wanted to see the fells for years. One of us is gluten-free.",
    status: "pending",
    createdDaysAgo: 1,
  },
  {
    roomSlug: "hollow-oak",
    name: "Peter & Anne Lyle",
    email: "p.lyle@example.com",
    phone: "07700 900788",
    checkInOffset: 8,
    checkOutOffset: 10,
    adults: 2,
    children: 2,
    message: "Hoping to bring the grandchildren for a night in half term. We'd need two singles making up.",
    status: "pending",
    createdDaysAgo: 2,
  },
  {
    roomSlug: "wren",
    name: "Marcus Hill",
    email: "marcus.hill@example.com",
    phone: "07700 900811",
    checkInOffset: 14,
    checkOutOffset: 16,
    adults: 1,
    children: 0,
    message: "On my own for two nights, writing. Any room with a desk would do.",
    status: "pending",
    createdDaysAgo: 1,
  },
  {
    roomSlug: "shepherds-hut",
    name: "Chris Doyle",
    email: "c.doyle@example.com",
    phone: "07700 900822",
    checkInOffset: 6,
    checkOutOffset: 8,
    adults: 2,
    children: 0,
    message: "First time in the Lakes. Two adults, one small tent for the dog? Only joking — the dog sleeps inside.",
    status: "pending",
    createdDaysAgo: 5,
  },
  {
    roomSlug: "mulberry",
    name: "J. Patel",
    email: "j.patel@example.com",
    phone: "07700 900900",
    checkInOffset: -14,
    checkOutOffset: -11,
    adults: 2,
    children: 0,
    message: "Late booking for three nights.",
    status: "declined",
    note: "So sorry — the room was already taken that week. Do write again for the spring.",
    createdDaysAgo: 30,
  },
  {
    roomSlug: "mulberry",
    name: "Elena Sokolova",
    email: "elena.s@example.com",
    phone: "07700 900933",
    checkInOffset: -10,
    checkOutOffset: -7,
    adults: 2,
    children: 0,
    message: "Three nights in the garden room.",
    status: "confirmed",
    note: "Lovely guests; left a note in the guestbook.",
    createdDaysAgo: 40,
  },
];

const blocks: { roomSlug: string; startOffset: number; endOffset: number; reason: string }[] = [
  { roomSlug: "larkspur", startOffset: 20, endOffset: 23, reason: "Chimney & flue work" },
  { roomSlug: "hollow-oak", startOffset: 5, endOffset: 6, reason: "Deep clean" },
  { roomSlug: "wren", startOffset: 24, endOffset: 26, reason: "Family wedding — we're away" },
  { roomSlug: "shepherds-hut", startOffset: 15, endOffset: 18, reason: "Laying the orchard hedge" },
];

function reference(daysAgo: number, index: number, today: ISODate): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seed = `${today}-${index}-${daysAgo}-larkspur-house`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0x5bd1e995);
    hash ^= hash >>> 15;
    out += alphabet[(hash >>> 0) % alphabet.length];
  }
  return `LH-${out}`;
}

export async function seedDatabase(
  db: Database,
  { reset = false }: { reset?: boolean } = {},
): Promise<void> {
  if (reset) {
    await db.exec(
      "truncate table menu_items, menus, room_photos, rooms, stay_requests, blocked_dates, guestbook_entries, innkeepers restart identity cascade",
    );
  }

  const today = todayISO();

  for (const room of rooms) {
    const inserted = await db.query<{ id: number }>(
      `insert into rooms (slug, name, tagline, description, capacity, beds, size_sqm, nightly_rate, amenities, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (slug) do nothing
       returning id`,
      [
        room.slug,
        room.name,
        room.tagline,
        room.description,
        room.capacity,
        room.beds,
        room.sizeSqm,
        room.nightlyRate,
        room.amenities,
        room.sortOrder,
      ],
    );
    const roomId = inserted[0]?.id;
    if (!roomId) continue;
    for (const [index, photo] of room.photos.entries()) {
      await db.query(
        `insert into room_photos (room_id, storage_key, alt, sort_order)
         values ($1,$2,$3,$4) on conflict (storage_key) do nothing`,
        [roomId, `seed/rooms/${photo.file}`, photo.alt, index],
      );
    }
  }

  for (const menu of menus) {
    const inserted = await db.query<{ id: number }>(
      `insert into menus (season, title, intro, is_published) values ($1,$2,$3,$4)
       on conflict (season) do nothing returning id`,
      [menu.season, menu.title, menu.intro, menu.published],
    );
    const menuId = inserted[0]?.id;
    if (!menuId) continue;
    for (const [index, item] of menu.items.entries()) {
      await db.query(
        `insert into menu_items (menu_id, section, name, description, dietary, sort_order)
         values ($1,$2,$3,$4,$5,$6)`,
        [menuId, item.section, item.name, item.description, item.dietary, index],
      );
    }
  }

  for (const entry of guestbook) {
    await db.query(
      `insert into guestbook_entries (guest_name, location, stay_month, message, status, created_at, approved_at)
       values ($1,$2,$3,$4,$5, now() - ($6 || ' days')::interval, $7)`,
      [
        entry.name,
        entry.location,
        entry.stayMonth,
        entry.message,
        entry.status,
        String(entry.daysAgo),
        entry.status === "approved" ? new Date(Date.now() - entry.daysAgo * 86_400_000).toISOString() : null,
      ],
    );
  }

  const roomIds = new Map<string, number>();
  const roomRows = await db.query<{ id: number; slug: string }>("select id, slug from rooms");
  for (const row of roomRows) roomIds.set(row.slug, row.id);

  for (const [index, request] of requests.entries()) {
    const roomId = roomIds.get(request.roomSlug);
    if (!roomId) continue;
    const checkIn = addDays(today, request.checkInOffset);
    const checkOut = addDays(today, request.checkOutOffset);
    await db.query(
      `insert into stay_requests
         (reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, adults, children,
          message, status, innkeeper_note, decided_at, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now() - ($14 || ' days')::interval, now())
       on conflict (reference) do nothing`,
      [
        reference(request.createdDaysAgo, index, today),
        roomId,
        request.name,
        request.email,
        request.phone,
        checkIn,
        checkOut,
        request.adults,
        request.children,
        request.message,
        request.status,
        request.note ?? null,
        request.status === "pending" ? null : new Date(Date.now() - request.createdDaysAgo * 43_200_000).toISOString(),
        String(request.createdDaysAgo),
      ],
    );
  }

  for (const block of blocks) {
    const roomId = roomIds.get(block.roomSlug);
    if (!roomId) continue;
    await db.query(
      `insert into blocked_dates (room_id, start_date, end_date, reason) values ($1,$2,$3,$4)`,
      [roomId, addDays(today, block.startOffset), addDays(today, block.endOffset), block.reason],
    );
  }

  const email = process.env.INNKEEPER_EMAIL ?? "margaret@larkspurhouse.co.uk";
  const password = process.env.INNKEEPER_PASSWORD ?? "larkspur";
  const name = process.env.INNKEEPER_NAME ?? "Margaret Ellery";
  const existing = await db.query<{ id: number }>(
    "select id from innkeepers where email = $1",
    [email.toLowerCase()],
  );
  if (!existing[0]) {
    await db.query(
      "insert into innkeepers (email, name, password_hash) values ($1,$2,$3)",
      [email.toLowerCase(), name, hashPassword(password)],
    );
  }
}

export const guestbookSeed = guestbook;
