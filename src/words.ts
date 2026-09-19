export type WordEntry = {
  word: string;
  hint: string;
  wordEn: string;
  hintEn: string;
  category: CategoryId;
};

export const categories = [
  "food",
  "places",
  "objects",
  "animals",
  "sport",
  "cinema",
] as const;

export type CategoryId = "all" | typeof categories[number];

const legacyCategoryIds: Record<string, CategoryId> = {
  all: "all",
  Cibo: "food",
  Luoghi: "places",
  Oggetti: "objects",
  Animali: "animals",
  Sport: "sport",
  Cinema: "cinema",
  food: "food",
  places: "places",
  objects: "objects",
  animals: "animals",
  sport: "sport",
  cinema: "cinema",
};

export function normalizeCategory(value: unknown): CategoryId {
  return typeof value === "string" ? legacyCategoryIds[value] ?? "all" : "all";
}

export function isCategoryId(value: unknown): value is CategoryId {
  return value === "all" || (typeof value === "string" && categories.includes(value as typeof categories[number]));
}

export const words: WordEntry[] = [
  // Cibo
  { word: "pizza", hint: "forno", wordEn: "pizza", hintEn: "oven", category: "food" },
  { word: "pasta", hint: "sugo", wordEn: "pasta", hintEn: "sauce", category: "food" },
  { word: "risotto", hint: "padella", wordEn: "risotto", hintEn: "pan", category: "food" },
  { word: "lasagna", hint: "pranzo", wordEn: "lasagna", hintEn: "lunch", category: "food" },
  { word: "gelato", hint: "estate", wordEn: "gelato", hintEn: "summer", category: "food" },
  { word: "tiramisù", hint: "dessert", wordEn: "tiramisu", hintEn: "dessert", category: "food" },
  { word: "panino", hint: "pausa", wordEn: "sandwich", hintEn: "break", category: "food" },
  { word: "insalata", hint: "verdure", wordEn: "salad", hintEn: "vegetables", category: "food" },
  { word: "minestra", hint: "inverno", wordEn: "soup", hintEn: "winter", category: "food" },
  { word: "polenta", hint: "montagna", wordEn: "polenta", hintEn: "mountain", category: "food" },
  { word: "mozzarella", hint: "latticini", wordEn: "mozzarella", hintEn: "dairy", category: "food" },
  { word: "parmigiano", hint: "grattugia", wordEn: "parmesan", hintEn: "grater", category: "food" },
  { word: "prosciutto", hint: "affettato", wordEn: "prosciutto", hintEn: "sliced", category: "food" },
  { word: "salsiccia", hint: "griglia", wordEn: "sausage", hintEn: "grill", category: "food" },
  { word: "frittata", hint: "colazione", wordEn: "omelet", hintEn: "breakfast", category: "food" },
  { word: "biscotto", hint: "merenda", wordEn: "cookie", hintEn: "snack", category: "food" },
  { word: "cioccolato", hint: "dolce", wordEn: "chocolate", hintEn: "sweet", category: "food" },
  { word: "fragola", hint: "giardino", wordEn: "strawberry", hintEn: "garden", category: "food" },
  { word: "arancia", hint: "agrumi", wordEn: "orange", hintEn: "citrus", category: "food" },
  { word: "limone", hint: "cucina", wordEn: "lemon", hintEn: "kitchen", category: "food" },

  // Luoghi
  { word: "scuola", hint: "lezioni", wordEn: "school", hintEn: "lessons", category: "places" },
  { word: "ospedale", hint: "medico", wordEn: "hospital", hintEn: "doctor", category: "places" },
  { word: "stazione", hint: "treno", wordEn: "station", hintEn: "train", category: "places" },
  { word: "aeroporto", hint: "viaggio", wordEn: "airport", hintEn: "travel", category: "places" },
  { word: "biblioteca", hint: "silenzio", wordEn: "library", hintEn: "quiet", category: "places" },
  { word: "museo", hint: "arte", wordEn: "museum", hintEn: "art", category: "places" },
  { word: "teatro", hint: "spettacolo", wordEn: "theater", hintEn: "show", category: "places" },
  { word: "ristorante", hint: "menu", wordEn: "restaurant", hintEn: "menu", category: "places" },
  { word: "supermercato", hint: "spesa", wordEn: "supermarket", hintEn: "groceries", category: "places" },
  { word: "parco", hint: "panchina", wordEn: "park", hintEn: "bench", category: "places" },
  { word: "spiaggia", hint: "ombrellone", wordEn: "beach", hintEn: "umbrella", category: "places" },
  { word: "montagna", hint: "sentiero", wordEn: "mountain", hintEn: "trail", category: "places" },
  { word: "castello", hint: "re", wordEn: "castle", hintEn: "king", category: "places" },
  { word: "chiesa", hint: "campana", wordEn: "church", hintEn: "bell", category: "places" },
  { word: "mercato", hint: "bancarella", wordEn: "market", hintEn: "stall", category: "places" },
  { word: "palestra", hint: "allenamento", wordEn: "gym", hintEn: "workout", category: "places" },
  { word: "ufficio", hint: "lavoro", wordEn: "office", hintEn: "work", category: "places" },
  { word: "farmacia", hint: "ricetta", wordEn: "pharmacy", hintEn: "prescription", category: "places" },
  { word: "albergo", hint: "camera", wordEn: "hotel", hintEn: "room", category: "places" },
  { word: "stadio", hint: "tifosi", wordEn: "stadium", hintEn: "fans", category: "places" },

  // Oggetti
  { word: "sedia", hint: "stanza", wordEn: "chair", hintEn: "room", category: "objects" },
  { word: "tavolo", hint: "pranzo", wordEn: "table", hintEn: "lunch", category: "objects" },
  { word: "ombrello", hint: "pioggia", wordEn: "umbrella", hintEn: "rain", category: "objects" },
  { word: "zaino", hint: "scuola", wordEn: "backpack", hintEn: "school", category: "objects" },
  { word: "orologio", hint: "tempo", wordEn: "clock", hintEn: "time", category: "objects" },
  { word: "telefono", hint: "chiamata", wordEn: "phone", hintEn: "call", category: "objects" },
  { word: "computer", hint: "schermo", wordEn: "computer", hintEn: "screen", category: "objects" },
  { word: "lampada", hint: "luce", wordEn: "lamp", hintEn: "light", category: "objects" },
  { word: "specchio", hint: "riflesso", wordEn: "mirror", hintEn: "reflection", category: "objects" },
  { word: "valigia", hint: "vacanza", wordEn: "suitcase", hintEn: "vacation", category: "objects" },
  { word: "chiave", hint: "serratura", wordEn: "key", hintEn: "lock", category: "objects" },
  { word: "bicchiere", hint: "acqua", wordEn: "glass", hintEn: "water", category: "objects" },
  { word: "forchetta", hint: "cucina", wordEn: "fork", hintEn: "kitchen", category: "objects" },
  { word: "coltello", hint: "taglio", wordEn: "knife", hintEn: "cutting", category: "objects" },
  { word: "martello", hint: "chiodo", wordEn: "hammer", hintEn: "nail", category: "objects" },
  { word: "cuscino", hint: "letto", wordEn: "pillow", hintEn: "bed", category: "objects" },
  { word: "coperta", hint: "inverno", wordEn: "blanket", hintEn: "winter", category: "objects" },
  { word: "candela", hint: "fiamma", wordEn: "candle", hintEn: "flame", category: "objects" },
  { word: "penna", hint: "scrittura", wordEn: "pen", hintEn: "writing", category: "objects" },
  { word: "bicicletta", hint: "pedale", wordEn: "bicycle", hintEn: "pedal", category: "objects" },

  // Animali
  { word: "cane", hint: "guinzaglio", wordEn: "dog", hintEn: "leash", category: "animals" },
  { word: "gatto", hint: "finestra", wordEn: "cat", hintEn: "window", category: "animals" },
  { word: "cavallo", hint: "sella", wordEn: "horse", hintEn: "saddle", category: "animals" },
  { word: "mucca", hint: "fattoria", wordEn: "cow", hintEn: "farm", category: "animals" },
  { word: "pecora", hint: "lana", wordEn: "sheep", hintEn: "wool", category: "animals" },
  { word: "capra", hint: "campanaccio", wordEn: "goat", hintEn: "bell", category: "animals" },
  { word: "maiale", hint: "fango", wordEn: "pig", hintEn: "mud", category: "animals" },
  { word: "gallina", hint: "uovo", wordEn: "hen", hintEn: "egg", category: "animals" },
  { word: "coniglio", hint: "carota", wordEn: "rabbit", hintEn: "carrot", category: "animals" },
  { word: "leone", hint: "savana", wordEn: "lion", hintEn: "savanna", category: "animals" },
  { word: "tigre", hint: "strisce", wordEn: "tiger", hintEn: "stripes", category: "animals" },
  { word: "elefante", hint: "zoo", wordEn: "elephant", hintEn: "zoo", category: "animals" },
  { word: "giraffa", hint: "collo", wordEn: "giraffe", hintEn: "neck", category: "animals" },
  { word: "scimmia", hint: "giungla", wordEn: "monkey", hintEn: "jungle", category: "animals" },
  { word: "delfino", hint: "mare", wordEn: "dolphin", hintEn: "sea", category: "animals" },
  { word: "balena", hint: "oceano", wordEn: "whale", hintEn: "ocean", category: "animals" },
  { word: "pinguino", hint: "ghiaccio", wordEn: "penguin", hintEn: "ice", category: "animals" },
  { word: "aquila", hint: "cielo", wordEn: "eagle", hintEn: "sky", category: "animals" },
  { word: "tartaruga", hint: "guscio", wordEn: "turtle", hintEn: "shell", category: "animals" },
  { word: "farfalla", hint: "fiore", wordEn: "butterfly", hintEn: "flower", category: "animals" },

  // Sport
  { word: "calcio", hint: "stadio", wordEn: "soccer", hintEn: "stadium", category: "sport" },
  { word: "basket", hint: "canestro", wordEn: "basketball", hintEn: "hoop", category: "sport" },
  { word: "tennis", hint: "racchetta", wordEn: "tennis", hintEn: "racket", category: "sport" },
  { word: "pallavolo", hint: "rete", wordEn: "volleyball", hintEn: "net", category: "sport" },
  { word: "nuoto", hint: "piscina", wordEn: "swimming", hintEn: "pool", category: "sport" },
  { word: "ciclismo", hint: "pedalata", wordEn: "cycling", hintEn: "pedaling", category: "sport" },
  { word: "atletica", hint: "pista", wordEn: "athletics", hintEn: "track", category: "sport" },
  { word: "ginnastica", hint: "equilibrio", wordEn: "gymnastics", hintEn: "balance", category: "sport" },
  { word: "scherma", hint: "maschera", wordEn: "fencing", hintEn: "mask", category: "sport" },
  { word: "judo", hint: "kimono", wordEn: "judo", hintEn: "kimono", category: "sport" },
  { word: "karate", hint: "cintura", wordEn: "karate", hintEn: "belt", category: "sport" },
  { word: "sci", hint: "neve", wordEn: "skiing", hintEn: "snow", category: "sport" },
  { word: "snowboard", hint: "montagna", wordEn: "snowboarding", hintEn: "mountain", category: "sport" },
  { word: "pattinaggio", hint: "ghiaccio", wordEn: "skating", hintEn: "ice", category: "sport" },
  { word: "rugby", hint: "ovale", wordEn: "rugby", hintEn: "oval", category: "sport" },
  { word: "golf", hint: "buca", wordEn: "golf", hintEn: "hole", category: "sport" },
  { word: "pallanuoto", hint: "acqua", wordEn: "water polo", hintEn: "water", category: "sport" },
  { word: "arrampicata", hint: "parete", wordEn: "climbing", hintEn: "wall", category: "sport" },
  { word: "canottaggio", hint: "remi", wordEn: "rowing", hintEn: "oars", category: "sport" },
  { word: "equitazione", hint: "cavallo", wordEn: "horse riding", hintEn: "horse", category: "sport" },

  // Cinema
  { word: "attore", hint: "palco", wordEn: "actor", hintEn: "stage", category: "cinema" },
  { word: "regista", hint: "telecamera", wordEn: "director", hintEn: "camera", category: "cinema" },
  { word: "scena", hint: "inquadratura", wordEn: "scene", hintEn: "framing", category: "cinema" },
  { word: "trama", hint: "mistero", wordEn: "plot", hintEn: "mystery", category: "cinema" },
  { word: "pellicola", hint: "archivio", wordEn: "film", hintEn: "archive", category: "cinema" },
  { word: "biglietto", hint: "spettatore", wordEn: "ticket", hintEn: "audience member", category: "cinema" },
  { word: "popcorn", hint: "snack", wordEn: "popcorn", hintEn: "snack", category: "cinema" },
  { word: "proiettore", hint: "schermo", wordEn: "projector", hintEn: "screen", category: "cinema" },
  { word: "copione", hint: "dialogo", wordEn: "script", hintEn: "dialogue", category: "cinema" },
  { word: "set", hint: "ciak", wordEn: "set", hintEn: "clapperboard", category: "cinema" },
  { word: "costume", hint: "personaggio", wordEn: "costume", hintEn: "character", category: "cinema" },
  { word: "colonna sonora", hint: "musica", wordEn: "soundtrack", hintEn: "music", category: "cinema" },
  { word: "premio", hint: "festival", wordEn: "award", hintEn: "festival", category: "cinema" },
  { word: "detective", hint: "indagine", wordEn: "detective", hintEn: "investigation", category: "cinema" },
  { word: "astronauta", hint: "spazio", wordEn: "astronaut", hintEn: "space", category: "cinema" },
  { word: "vampiro", hint: "notte", wordEn: "vampire", hintEn: "night", category: "cinema" },
  { word: "robot", hint: "futuro", wordEn: "robot", hintEn: "future", category: "cinema" },
  { word: "pirata", hint: "tesoro", wordEn: "pirate", hintEn: "treasure", category: "cinema" },
  { word: "principessa", hint: "castello", wordEn: "princess", hintEn: "castle", category: "cinema" },
  { word: "supereroe", hint: "maschera", wordEn: "superhero", hintEn: "mask", category: "cinema" },
];
