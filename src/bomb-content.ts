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
  "spicy_18",
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
  spicy_18: { it: "Hot 18+", en: "Hot 18+" },
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

const STANDARD_BOMB_PROMPTS: readonly BombPrompt[] = [
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

const HOT_18_TOPICS: readonly (readonly [string, string])[] = [
  ["Sex toys", "Sex toys"],
  ["Sex toys femminili", "Women's sex toys"],
  ["Sex toys maschili", "Men's sex toys"],
  ["Accessori BDSM", "BDSM accessories"],
  ["BDSM", "BDSM"],
  ["Tipi di bondage", "Types of bondage"],
  ["Ruoli BDSM", "BDSM roles"],
  ["Giochi BDSM", "BDSM games"],
  ["Giochi di dominazione", "Domination games"],
  ["Giochi di sottomissione", "Submission games"],
  ["Feticismi", "Fetishes"],
  ["Fetishwear", "Fetishwear"],
  ["Materiali fetish", "Fetish materials"],
  ["Lingerie", "Lingerie"],
  ["Tipi di lingerie", "Types of lingerie"],
  ["Indumenti sexy", "Sexy clothing"],
  ["Accessori sexy", "Sexy accessories"],
  ["Scarpe sexy", "Sexy shoes"],
  ["Costumi sexy", "Sexy costumes"],
  ["Maschere sexy", "Sexy masks"],
  ["Posizioni sessuali", "Sexual positions"],
  ["Categorie porno", "Porn categories"],
  ["Generi erotici", "Erotic genres"],
  ["Generi pornografici", "Pornographic genres"],
  ["Categorie di contenuti NSFW", "NSFW content categories"],
  ["Tipi di video hot", "Types of spicy videos"],
  ["Tipi di nudes", "Types of nudes"],
  ["Sexting", "Sexting"],
  ["Messaggi hot", "Spicy messages"],
  ["Foto provocanti", "Provocative photos"],
  ["Video provocanti", "Provocative videos"],
  ["Dirty talk", "Dirty talk"],
  ["Slang sessuale", "Sexual slang"],
  ["Parolacce sessuali", "Sexual swear words"],
  ["Termini sessuali", "Sexual terms"],
  ["Parti del corpo erotiche", "Erotic body parts"],
  ["Zone erogene", "Erogenous zones"],
  ["Termini legati all'orgasmo", "Orgasm-related terms"],
  ["Termini legati all'eccitazione", "Arousal-related terms"],
  ["Sensazioni erotiche", "Erotic sensations"],
  ["Fantasie erotiche", "Erotic fantasies"],
  ["Fantasie proibite", "Forbidden fantasies"],
  ["Situazioni erotiche", "Erotic situations"],
  ["Situazioni trasgressive", "Transgressive situations"],
  ["Giochi erotici", "Erotic games"],
  ["Giochi di coppia", "Couples' games"],
  ["Giochi di ruolo", "Role-playing games"],
  ["Personaggi del roleplay", "Role-play characters"],
  ["Ruoli erotici", "Erotic roles"],
  ["Professioni erotiche", "Erotic professions"],
  ["Scenari di roleplay", "Role-play scenarios"],
  ["Ambientazioni erotiche", "Erotic settings"],
  ["Ambientazioni BDSM", "BDSM settings"],
  ["Luoghi per fare sesso", "Places to have sex"],
  ["Luoghi trasgressivi", "Adventurous places"],
  ["Luoghi da appuntamento hot", "Spicy date spots"],
  ["Luoghi di un sex shop", "Places in a sex shop"],
  ["Cose da sexy shop", "Sex-shop items"],
  ["Prodotti per adulti", "Adult products"],
  ["Oggetti da camera da letto", "Bedroom items"],
  ["Accessori per il bondage", "Bondage accessories"],
  ["Oggetti per il BDSM", "BDSM items"],
  ["Regole BDSM", "BDSM rules"],
  ["Termini BDSM", "BDSM terms"],
  ["Slang BDSM", "BDSM slang"],
  ["Tipi di dominazione", "Types of domination"],
  ["Tipi di sottomissione", "Types of submission"],
  ["Dinamiche BDSM", "BDSM dynamics"],
  ["Feticismi comuni", "Common fetishes"],
  ["Feticismi insoliti", "Unusual fetishes"],
  ["Stili fetish", "Fetish styles"],
  ["Tipi di latex", "Types of latex"],
  ["Tipi di leather", "Types of leather"],
  ["Tipi di giochi erotici", "Types of erotic games"],
  ["Tipi di spogliarello", "Types of striptease"],
  ["Tipi di lap dance", "Types of lap dance"],
  ["Stili di burlesque", "Burlesque styles"],
  ["Strip club", "Strip clubs"],
  ["Privé", "Private rooms"],
  ["Club per adulti", "Adult clubs"],
  ["Situazioni da una notte", "One-night situations"],
  ["One-night stand", "One-night stands"],
  ["Scappatelle", "Affairs"],
  ["Tradimenti", "Cheating"],
  ["Amanti", "Lovers"],
  ["Hookup", "Hookups"],
  ["Tipi di appuntamento hot", "Types of spicy dates"],
  ["Modi per rimorchiare", "Ways to flirt"],
  ["App di dating", "Dating apps"],
  ["Slang da dating", "Dating slang"],
  ["Segreti erotici", "Erotic secrets"],
  ["Scandali sessuali", "Sex scandals"],
  ["Situazioni compromettenti", "Compromising situations"],
  ["Cose proibite", "Forbidden things"],
  ["Trasgressioni", "Transgressions"],
  ["Peccati erotici", "Erotic sins"],
  ["Temi erotici", "Erotic themes"],
  ["Temi BDSM", "BDSM themes"],
  ["Temi fetish", "Fetish themes"],
  ["Temi porno", "Porn themes"],
  ["Tipi di pornografia", "Types of pornography"],
  ["Categorie di film per adulti", "Adult-film categories"],
  ["Ruoli nei film per adulti", "Roles in adult films"],
  ["Ambientazioni dei film per adulti", "Adult-film settings"],
  ["Personaggi sexy", "Sexy characters"],
  ["Costumi da roleplay", "Role-play costumes"],
  ["Travestimenti sexy", "Sexy disguises"],
  ["Uniformi sexy", "Sexy uniforms"],
  ["Accessori da roleplay", "Role-play accessories"],
  ["Maschere fetish", "Fetish masks"],
  ["Collari e accessori", "Collars and accessories"],
  ["Manette e restrizioni", "Handcuffs and restraints"],
  ["Accessori per la dominazione", "Domination accessories"],
  ["Accessori per la sottomissione", "Submission accessories"],
  ["Oggetti per giochi di coppia", "Couples' game items"],
  ["Prodotti per massaggi erotici", "Erotic massage products"],
  ["Prodotti da bagno erotici", "Erotic bath products"],
  ["Prodotti da camera da letto", "Bedroom products"],
  ["Idee per una serata hot", "Ideas for a spicy night"],
  ["Idee per un appuntamento trasgressivo", "Ideas for an adventurous date"],
  ["Ambientazioni da motel", "Motel settings"],
  ["Ambientazioni da hotel", "Hotel settings"],
  ["Ambientazioni da privé", "Private-room settings"],
  ["Ambientazioni da strip club", "Strip-club settings"],
  ["Cose associate a una notte brava", "Things associated with a wild night"],
  ["Cose associate al sexting", "Things associated with sexting"],
  ["Cose associate ai nudes", "Things associated with nudes"],
  ["Cose associate al dirty talk", "Things associated with dirty talk"],
  ["Cose associate al BDSM", "Things associated with BDSM"],
  ["Cose associate al fetish", "Things associated with fetishes"],
  ["Cose che trovi in una camera BDSM", "Things found in a BDSM room"],
  ["Cose che trovi in un privé", "Things found in a private room"],
  ["Cose che trovi in uno strip club", "Things found in a strip club"],
  ["Cose che trovi in un sex shop", "Things found in a sex shop"],
  ["Cose che trovi in una stanza d'hotel", "Things found in a hotel room"],
  ["Cose che trovi in una valigia hot", "Things in a spicy suitcase"],
  ["Regali erotici", "Erotic gifts"],
  ["Idee regalo per adulti", "Adult gift ideas"],
  ["Prodotti per coppie", "Couples' products"],
  ["Accessori per coppie", "Couples' accessories"],
  ["Articoli fetish", "Fetish gear"],
  ["Articoli BDSM", "BDSM gear"],
  ["Articoli per lingerie", "Lingerie items"],
  ["Articoli per roleplay", "Role-play items"],
  ["Profumi sensuali", "Sensual perfumes"],
  ["Atmosfere sensuali", "Sensual atmospheres"],
  ["Musica per una serata hot", "Music for a spicy night"],
  ["Luci per atmosfere erotiche", "Lighting for erotic atmospheres"],
  ["Bevande associate a una serata hot", "Drinks for a spicy night"],
  ["Situazioni imbarazzanti durante un appuntamento", "Awkward dating moments"],
];

const HOT_18_PROMPTS: readonly BombPrompt[] = HOT_18_TOPICS.map(([topic, topicEn], index) => ({
  id: `spicy-18-${String(index + 1).padStart(3, "0")}`,
  category: "spicy_18" as const,
  topic,
  topicEn,
  examples: [],
  examplesEn: [],
}));

export const BOMB_PROMPTS: readonly BombPrompt[] = [...STANDARD_BOMB_PROMPTS, ...HOT_18_PROMPTS];

/** “All” keeps the adult-only category opt-in, matching Impostore's 18+ deck. */
export function bombPromptsForCategory(category: string): readonly BombPrompt[] {
  return category === "all"
    ? STANDARD_BOMB_PROMPTS
    : BOMB_PROMPTS.filter((prompt) => prompt.category === category);
}

// Lower-case aliases keep the data convenient to consume while the upper-case
// names above make the catalog contract obvious to callers.
export const bombCategories = BOMB_CATEGORIES;
export const bombPrompts = BOMB_PROMPTS;
export const bombCategoryLabels = BOMB_CATEGORY_LABELS;
