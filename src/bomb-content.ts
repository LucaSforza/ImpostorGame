/** Stable topic categories used by Bomba. Content is local so a round never needs a network request. */
export const BOMB_CATEGORY_IDS = [
  "tech",
  "food",
  "animals",
  "places",
  "sports",
  "movies",
  "music",
  "nature",
  "home",
  "travel",
  "professions",
  "hobbies",
] as const;

export type BombCategoryId = typeof BOMB_CATEGORY_IDS[number];

export type BombCategoryLabel = {
  readonly it: string;
  readonly en: string;
};

export type BombCategory = {
  readonly id: BombCategoryId;
  readonly label: BombCategoryLabel;
};

export const BOMB_CATEGORY_LABELS: Readonly<Record<BombCategoryId, BombCategoryLabel>> = {
  tech: { it: "Tecnologia e videogiochi", en: "Tech and games" },
  food: { it: "Cibo e bevande", en: "Food and drinks" },
  animals: { it: "Animali", en: "Animals" },
  places: { it: "Luoghi", en: "Places" },
  sports: { it: "Sport", en: "Sports" },
  movies: { it: "Film e serie", en: "Movies and shows" },
  music: { it: "Musica", en: "Music" },
  nature: { it: "Natura", en: "Nature" },
  home: { it: "Casa e oggetti", en: "Home and objects" },
  travel: { it: "Viaggi", en: "Travel" },
  professions: { it: "Mestieri", en: "Professions" },
  hobbies: { it: "Hobby", en: "Hobbies" },
};

export const BOMB_CATEGORIES: readonly BombCategory[] = BOMB_CATEGORY_IDS.map((id) => ({
  id,
  label: BOMB_CATEGORY_LABELS[id],
}));

export type BombPrompt = {
  readonly id: string;
  readonly category: BombCategoryId;
  readonly topic: string;
  readonly topicEn: string;
  readonly examples: readonly string[];
  readonly examplesEn: readonly string[];
};

export const BOMB_PROMPTS: readonly BombPrompt[] = [
  // Tech companies
  { id: "tech-01", category: "tech", topic: "Aziende tech", topicEn: "Tech companies", examples: ["Red Hat", "Apple", "Microsoft"], examplesEn: ["Red Hat", "Apple", "Microsoft"] },
  { id: "tech-02", category: "tech", topic: "App di messaggistica", topicEn: "Messaging apps", examples: ["WhatsApp", "Signal", "Telegram"], examplesEn: ["WhatsApp", "Signal", "Telegram"] },
  { id: "tech-03", category: "tech", topic: "Social network", topicEn: "Social networks", examples: ["Instagram", "TikTok", "LinkedIn"], examplesEn: ["Instagram", "TikTok", "LinkedIn"] },
  { id: "tech-04", category: "tech", topic: "Accessori per computer", topicEn: "Computer accessories", examples: ["Mouse", "Tastiera", "Cuffie"], examplesEn: ["Mouse", "Keyboard", "Headphones"] },
  { id: "tech-05", category: "tech", topic: "Cose che fai con lo smartphone", topicEn: "Things you do on a smartphone", examples: ["Scattare foto", "Chiamare amici", "Cercare indicazioni"], examplesEn: ["Taking photos", "Calling friends", "Looking up directions"] },
  { id: "tech-06", category: "tech", topic: "Videogiochi famosi", topicEn: "Famous video games", examples: ["Minecraft", "Tetris", "Fortnite"], examplesEn: ["Minecraft", "Tetris", "Fortnite"] },
  { id: "tech-07", category: "tech", topic: "Gadget elettronici", topicEn: "Electronic gadgets", examples: ["Smartphone", "Tablet", "Smartwatch"], examplesEn: ["Smartphone", "Tablet", "Smartwatch"] },

  // Food and drinks
  { id: "food-01", category: "food", topic: "Frutti", topicEn: "Fruits", examples: ["Mela", "Banana", "Pesca"], examplesEn: ["Apple", "Banana", "Peach"] },
  { id: "food-02", category: "food", topic: "Verdure", topicEn: "Vegetables", examples: ["Carota", "Zucchina", "Pomodoro"], examplesEn: ["Carrot", "Zucchini", "Tomato"] },
  { id: "food-03", category: "food", topic: "Piatti italiani", topicEn: "Italian dishes", examples: ["Pizza", "Risotto", "Lasagna"], examplesEn: ["Pizza", "Risotto", "Lasagna"] },
  { id: "food-04", category: "food", topic: "Dolci", topicEn: "Desserts", examples: ["Tiramisù", "Gelato", "Croissant"], examplesEn: ["Tiramisu", "Gelato", "Croissant"] },
  { id: "food-05", category: "food", topic: "Bevande analcoliche", topicEn: "Non-alcoholic drinks", examples: ["Tè", "Limonata", "Cioccolata calda"], examplesEn: ["Tea", "Lemonade", "Hot chocolate"] },
  { id: "food-06", category: "food", topic: "Ingredienti da pizza", topicEn: "Pizza toppings", examples: ["Mozzarella", "Olive", "Funghi"], examplesEn: ["Mozzarella", "Olives", "Mushrooms"] },
  { id: "food-07", category: "food", topic: "Cibi da colazione", topicEn: "Breakfast foods", examples: ["Cereali", "Yogurt", "Pane tostato"], examplesEn: ["Cereal", "Yogurt", "Toast"] },

  // Animals
  { id: "animals-01", category: "animals", topic: "Animali domestici", topicEn: "Pets", examples: ["Cane", "Gatto", "Coniglio"], examplesEn: ["Dog", "Cat", "Rabbit"] },
  { id: "animals-02", category: "animals", topic: "Animali della fattoria", topicEn: "Farm animals", examples: ["Mucca", "Gallina", "Maiale"], examplesEn: ["Cow", "Hen", "Pig"] },
  { id: "animals-03", category: "animals", topic: "Animali della savana", topicEn: "Savanna animals", examples: ["Leone", "Giraffa", "Zebra"], examplesEn: ["Lion", "Giraffe", "Zebra"] },
  { id: "animals-04", category: "animals", topic: "Animali marini", topicEn: "Sea animals", examples: ["Delfino", "Balena", "Polpo"], examplesEn: ["Dolphin", "Whale", "Octopus"] },
  { id: "animals-05", category: "animals", topic: "Uccelli", topicEn: "Birds", examples: ["Aquila", "Pinguino", "Gufo"], examplesEn: ["Eagle", "Penguin", "Owl"] },
  { id: "animals-06", category: "animals", topic: "Insetti", topicEn: "Insects", examples: ["Ape", "Farfalla", "Coccinella"], examplesEn: ["Bee", "Butterfly", "Ladybug"] },
  { id: "animals-07", category: "animals", topic: "Animali del bosco", topicEn: "Forest animals", examples: ["Volpe", "Cervo", "Scoiattolo"], examplesEn: ["Fox", "Deer", "Squirrel"] },

  // Places
  { id: "places-01", category: "places", topic: "Città italiane", topicEn: "Italian cities", examples: ["Roma", "Milano", "Napoli"], examplesEn: ["Rome", "Milan", "Naples"] },
  { id: "places-02", category: "places", topic: "Capitali europee", topicEn: "European capitals", examples: ["Parigi", "Londra", "Berlino"], examplesEn: ["Paris", "London", "Berlin"] },
  { id: "places-03", category: "places", topic: "Paesi del mondo", topicEn: "Countries of the world", examples: ["Canada", "Giappone", "Brasile"], examplesEn: ["Canada", "Japan", "Brazil"] },
  { id: "places-04", category: "places", topic: "Luoghi in una città", topicEn: "Places in a city", examples: ["Biblioteca", "Piazza", "Stazione"], examplesEn: ["Library", "Square", "Station"] },
  { id: "places-05", category: "places", topic: "Edifici famosi", topicEn: "Famous buildings", examples: ["Colosseo", "Taj Mahal", "Big Ben"], examplesEn: ["Colosseum", "Taj Mahal", "Big Ben"] },
  { id: "places-06", category: "places", topic: "Paesaggi da vacanza", topicEn: "Holiday landscapes", examples: ["Spiaggia", "Montagna", "Lago"], examplesEn: ["Beach", "Mountain", "Lake"] },
  { id: "places-07", category: "places", topic: "Luoghi dove studiare", topicEn: "Places to study", examples: ["Aula", "Università", "Biblioteca"], examplesEn: ["Classroom", "University", "Library"] },

  // Sports
  { id: "sports-01", category: "sports", topic: "Sport con la palla", topicEn: "Ball sports", examples: ["Calcio", "Tennis", "Basket"], examplesEn: ["Football", "Tennis", "Basketball"] },
  { id: "sports-02", category: "sports", topic: "Sport olimpici", topicEn: "Olympic sports", examples: ["Nuoto", "Atletica", "Scherma"], examplesEn: ["Swimming", "Athletics", "Fencing"] },
  { id: "sports-03", category: "sports", topic: "Sport d'acqua", topicEn: "Water sports", examples: ["Surf", "Canottaggio", "Pallanuoto"], examplesEn: ["Surfing", "Rowing", "Water polo"] },
  { id: "sports-04", category: "sports", topic: "Sport invernali", topicEn: "Winter sports", examples: ["Sci", "Snowboard", "Pattinaggio"], examplesEn: ["Skiing", "Snowboarding", "Skating"] },
  { id: "sports-05", category: "sports", topic: "Attrezzatura sportiva", topicEn: "Sports equipment", examples: ["Racchetta", "Casco", "Pallone"], examplesEn: ["Racket", "Helmet", "Ball"] },
  { id: "sports-06", category: "sports", topic: "Cose nella borsa da palestra", topicEn: "Things in a gym bag", examples: ["Borraccia", "Asciugamano", "Scarpe"], examplesEn: ["Water bottle", "Towel", "Trainers"] },
  { id: "sports-07", category: "sports", topic: "Sport da palestra", topicEn: "Gym activities", examples: ["Yoga", "Pilates", "Spinning"], examplesEn: ["Yoga", "Pilates", "Spinning"] },

  // Movies and shows
  { id: "movies-01", category: "movies", topic: "Generi cinematografici", topicEn: "Movie genres", examples: ["Commedia", "Avventura", "Fantascienza"], examplesEn: ["Comedy", "Adventure", "Science fiction"] },
  { id: "movies-02", category: "movies", topic: "Film di animazione", topicEn: "Animated movies", examples: ["Toy Story", "Shrek", "Coco"], examplesEn: ["Toy Story", "Shrek", "Coco"] },
  { id: "movies-03", category: "movies", topic: "Personaggi di film", topicEn: "Movie characters", examples: ["Harry Potter", "Wonder Woman", "Indiana Jones"], examplesEn: ["Harry Potter", "Wonder Woman", "Indiana Jones"] },
  { id: "movies-04", category: "movies", topic: "Oggetti da cinema", topicEn: "Cinema objects", examples: ["Popcorn", "Biglietto", "Proiettore"], examplesEn: ["Popcorn", "Ticket", "Projector"] },
  { id: "movies-05", category: "movies", topic: "Serie TV famose", topicEn: "Famous TV shows", examples: ["Friends", "The Office", "Mercoledì"], examplesEn: ["Friends", "The Office", "Wednesday"] },
  { id: "movies-06", category: "movies", topic: "Professioni del cinema", topicEn: "Movie professions", examples: ["Regista", "Attore", "Sceneggiatore"], examplesEn: ["Director", "Actor", "Screenwriter"] },
  { id: "movies-07", category: "movies", topic: "Mondi immaginari", topicEn: "Fictional worlds", examples: ["Hogwarts", "Terra di Mezzo", "Narnia"], examplesEn: ["Hogwarts", "Middle-earth", "Narnia"] },

  // Music
  { id: "music-01", category: "music", topic: "Strumenti musicali", topicEn: "Musical instruments", examples: ["Chitarra", "Pianoforte", "Batteria"], examplesEn: ["Guitar", "Piano", "Drums"] },
  { id: "music-02", category: "music", topic: "Generi musicali", topicEn: "Music genres", examples: ["Pop", "Rock", "Jazz"], examplesEn: ["Pop", "Rock", "Jazz"] },
  { id: "music-03", category: "music", topic: "Cose da concerto", topicEn: "Concert things", examples: ["Palco", "Microfono", "Biglietto"], examplesEn: ["Stage", "Microphone", "Ticket"] },
  { id: "music-04", category: "music", topic: "Ruoli in una band", topicEn: "Band roles", examples: ["Cantante", "Bassista", "Batterista"], examplesEn: ["Singer", "Bassist", "Drummer"] },
  { id: "music-05", category: "music", topic: "Occasioni per mettere musica", topicEn: "Occasions for playing music", examples: ["Festa", "Viaggio", "Allenamento"], examplesEn: ["Party", "Road trip", "Workout"] },
  { id: "music-06", category: "music", topic: "Termini musicali", topicEn: "Music terms", examples: ["Ritmo", "Melodia", "Ritornello"], examplesEn: ["Rhythm", "Melody", "Chorus"] },
  { id: "music-07", category: "music", topic: "Suoni della natura", topicEn: "Sounds of nature", examples: ["Pioggia", "Tuono", "Onde"], examplesEn: ["Rain", "Thunder", "Waves"] },

  // Nature
  { id: "nature-01", category: "nature", topic: "Fiori", topicEn: "Flowers", examples: ["Rosa", "Girasole", "Tulipano"], examplesEn: ["Rose", "Sunflower", "Tulip"] },
  { id: "nature-02", category: "nature", topic: "Alberi", topicEn: "Trees", examples: ["Quercia", "Pino", "Olivo"], examplesEn: ["Oak", "Pine", "Olive tree"] },
  { id: "nature-03", category: "nature", topic: "Fenomeni atmosferici", topicEn: "Weather phenomena", examples: ["Arcobaleno", "Neve", "Nebbia"], examplesEn: ["Rainbow", "Snow", "Fog"] },
  { id: "nature-04", category: "nature", topic: "Cose che trovi nel bosco", topicEn: "Things you find in a forest", examples: ["Muschio", "Pigne", "Funghi"], examplesEn: ["Moss", "Pine cones", "Mushrooms"] },
  { id: "nature-05", category: "nature", topic: "Paesaggi naturali", topicEn: "Natural landscapes", examples: ["Cascata", "Deserto", "Ghiacciaio"], examplesEn: ["Waterfall", "Desert", "Glacier"] },
  { id: "nature-06", category: "nature", topic: "Colori della natura", topicEn: "Colors in nature", examples: ["Verde", "Azzurro", "Marrone"], examplesEn: ["Green", "Blue", "Brown"] },
  { id: "nature-07", category: "nature", topic: "Cose da giardino", topicEn: "Garden things", examples: ["Seme", "Annaffiatoio", "Terriccio"], examplesEn: ["Seed", "Watering can", "Potting soil"] },

  // Home and objects
  { id: "home-01", category: "home", topic: "Oggetti in cucina", topicEn: "Kitchen objects", examples: ["Pentola", "Coltello", "Frullatore"], examplesEn: ["Pot", "Knife", "Blender"] },
  { id: "home-02", category: "home", topic: "Mobili", topicEn: "Furniture", examples: ["Sedia", "Divano", "Libreria"], examplesEn: ["Chair", "Sofa", "Bookcase"] },
  { id: "home-03", category: "home", topic: "Cose da scrivania", topicEn: "Desk items", examples: ["Penna", "Quaderno", "Lampada"], examplesEn: ["Pen", "Notebook", "Lamp"] },
  { id: "home-04", category: "home", topic: "Elettrodomestici", topicEn: "Appliances", examples: ["Frigorifero", "Forno", "Aspirapolvere"], examplesEn: ["Fridge", "Oven", "Vacuum cleaner"] },
  { id: "home-05", category: "home", topic: "Cose morbide", topicEn: "Soft things", examples: ["Cuscino", "Coperta", "Tappeto"], examplesEn: ["Pillow", "Blanket", "Rug"] },
  { id: "home-06", category: "home", topic: "Cose nel bagno", topicEn: "Bathroom items", examples: ["Asciugamano", "Sapone", "Spazzolino"], examplesEn: ["Towel", "Soap", "Toothbrush"] },
  { id: "home-07", category: "home", topic: "Materiali", topicEn: "Materials", examples: ["Legno", "Vetro", "Metallo"], examplesEn: ["Wood", "Glass", "Metal"] },

  // Travel
  { id: "travel-01", category: "travel", topic: "Mezzi di trasporto", topicEn: "Means of transport", examples: ["Treno", "Aereo", "Bicicletta"], examplesEn: ["Train", "Plane", "Bicycle"] },
  { id: "travel-02", category: "travel", topic: "Cose in valigia", topicEn: "Things in a suitcase", examples: ["Maglietta", "Scarpe", "Caricabatterie"], examplesEn: ["T-shirt", "Shoes", "Charger"] },
  { id: "travel-03", category: "travel", topic: "Accessori da viaggio", topicEn: "Travel accessories", examples: ["Passaporto", "Mappa", "Zaino"], examplesEn: ["Passport", "Map", "Backpack"] },
  { id: "travel-04", category: "travel", topic: "Vacanze al mare", topicEn: "Seaside holidays", examples: ["Costume", "Crema solare", "Ombrellone"], examplesEn: ["Swimsuit", "Sunscreen", "Beach umbrella"] },
  { id: "travel-05", category: "travel", topic: "Vacanze in montagna", topicEn: "Mountain holidays", examples: ["Scarponi", "Sciarpa", "Borraccia"], examplesEn: ["Hiking boots", "Scarf", "Water bottle"] },
  { id: "travel-06", category: "travel", topic: "Alloggi", topicEn: "Accommodation", examples: ["Hotel", "Campeggio", "Ostello"], examplesEn: ["Hotel", "Campsite", "Hostel"] },
  { id: "travel-07", category: "travel", topic: "Ricordi di viaggio", topicEn: "Travel souvenirs", examples: ["Cartolina", "Magnete", "Fotografia"], examplesEn: ["Postcard", "Magnet", "Photograph"] },

  // Professions
  { id: "professions-01", category: "professions", topic: "Mestieri creativi", topicEn: "Creative professions", examples: ["Designer", "Fotografo", "Illustratore"], examplesEn: ["Designer", "Photographer", "Illustrator"] },
  { id: "professions-02", category: "professions", topic: "Mestieri all'aperto", topicEn: "Outdoor professions", examples: ["Giardiniere", "Guida", "Archeologo"], examplesEn: ["Gardener", "Guide", "Archaeologist"] },
  { id: "professions-03", category: "professions", topic: "Mestieri che aiutano", topicEn: "Helping professions", examples: ["Medico", "Insegnante", "Infermiere"], examplesEn: ["Doctor", "Teacher", "Nurse"] },
  { id: "professions-04", category: "professions", topic: "Mestieri in uniforme", topicEn: "Uniformed professions", examples: ["Pilota", "Vigile del fuoco", "Chef"], examplesEn: ["Pilot", "Firefighter", "Chef"] },
  { id: "professions-05", category: "professions", topic: "Mestieri con animali", topicEn: "Animal-related professions", examples: ["Veterinario", "Addestratore", "Zoologo"], examplesEn: ["Veterinarian", "Trainer", "Zoologist"] },
  { id: "professions-06", category: "professions", topic: "Mestieri digitali", topicEn: "Digital professions", examples: ["Programmatore", "Streamer", "Analista"], examplesEn: ["Programmer", "Streamer", "Analyst"] },
  { id: "professions-07", category: "professions", topic: "Mestieri con le mani", topicEn: "Hands-on professions", examples: ["Falegname", "Ceramista", "Sarto"], examplesEn: ["Carpenter", "Potter", "Tailor"] },

  // Hobbies
  { id: "hobbies-01", category: "hobbies", topic: "Hobby creativi", topicEn: "Creative hobbies", examples: ["Disegnare", "Dipingere", "Scrivere"], examplesEn: ["Drawing", "Painting", "Writing"] },
  { id: "hobbies-02", category: "hobbies", topic: "Giochi da tavolo", topicEn: "Board games", examples: ["Scacchi", "Monopoly", "Cluedo"], examplesEn: ["Chess", "Monopoly", "Cluedo"] },
  { id: "hobbies-03", category: "hobbies", topic: "Attività rilassanti", topicEn: "Relaxing activities", examples: ["Leggere", "Meditare", "Ascoltare musica"], examplesEn: ["Reading", "Meditating", "Listening to music"] },
  { id: "hobbies-04", category: "hobbies", topic: "Attività del weekend", topicEn: "Weekend activities", examples: ["Passeggiare", "Cucinare", "Guardare film"], examplesEn: ["Walking", "Cooking", "Watching movies"] },
  { id: "hobbies-05", category: "hobbies", topic: "Collezioni", topicEn: "Collections", examples: ["Francobolli", "Monete", "Fumetti"], examplesEn: ["Stamps", "Coins", "Comics"] },
  { id: "hobbies-06", category: "hobbies", topic: "Attività all'aria aperta", topicEn: "Outdoor activities", examples: ["Escursionismo", "Ciclismo", "Picnic"], examplesEn: ["Hiking", "Cycling", "Picnicking"] },
  { id: "hobbies-07", category: "hobbies", topic: "Attività con amici", topicEn: "Activities with friends", examples: ["Karaoke", "Quiz", "Fotografie"], examplesEn: ["Karaoke", "Quiz", "Photos"] },
] as const;

// Lower-case aliases keep the data convenient to consume while the upper-case
// names above make the catalog contract obvious to callers.
export const bombCategories = BOMB_CATEGORIES;
export const bombPrompts = BOMB_PROMPTS;
export const bombCategoryLabels = BOMB_CATEGORY_LABELS;
