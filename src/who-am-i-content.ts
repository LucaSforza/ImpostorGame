export interface WhoAmIIdentity {
  readonly id: string;
  readonly label: string;
  readonly labelEn: string;
}

/** Stable, bilingual identities. Running sessions snapshot the chosen records. */
export const WHO_AM_I_IDENTITIES: readonly WhoAmIIdentity[] = [
  ['leonardo-da-vinci', 'Leonardo da Vinci', 'Leonardo da Vinci'], ['albert-einstein', 'Albert Einstein', 'Albert Einstein'],
  ['cleopatra', 'Cleopatra', 'Cleopatra'], ['julius-caesar', 'Giulio Cesare', 'Julius Caesar'],
  ['marie-curie', 'Marie Curie', 'Marie Curie'], ['cristiano-ronaldo', 'Cristiano Ronaldo', 'Cristiano Ronaldo'],
  ['michael-jackson', 'Michael Jackson', 'Michael Jackson'], ['frida-kahlo', 'Frida Kahlo', 'Frida Kahlo'],
  ['william-shakespeare', 'William Shakespeare', 'William Shakespeare'], ['mahatma-gandhi', 'Mahatma Gandhi', 'Mahatma Gandhi'],
  ['queen-elizabeth-ii', 'Regina Elisabetta II', 'Queen Elizabeth II'], ['napoleon-bonaparte', 'Napoleone Bonaparte', 'Napoleon Bonaparte'],
  ['martin-luther-king', 'Martin Luther King', 'Martin Luther King'], ['steve-jobs', 'Steve Jobs', 'Steve Jobs'],
  ['amelia-earhart', 'Amelia Earhart', 'Amelia Earhart'], ['mozart', 'Wolfgang Amadeus Mozart', 'Wolfgang Amadeus Mozart'],
  ['charlie-chaplin', 'Charlie Chaplin', 'Charlie Chaplin'], ['usain-bolt', 'Usain Bolt', 'Usain Bolt'],
  ['vincent-van-gogh', 'Vincent van Gogh', 'Vincent van Gogh'], ['mother-teresa', 'Madre Teresa', 'Mother Teresa'],
  ['harry-potter', 'Harry Potter', 'Harry Potter'], ['sherlock-holmes', 'Sherlock Holmes', 'Sherlock Holmes'],
  ['wonder-woman', 'Wonder Woman', 'Wonder Woman'], ['batman', 'Batman', 'Batman'],
  ['superman', 'Superman', 'Superman'], ['spider-man', 'Spider-Man', 'Spider-Man'],
  ['cinderella', 'Cenerentola', 'Cinderella'], ['snow-white', 'Biancaneve', 'Snow White'],
  ['pinocchio', 'Pinocchio', 'Pinocchio'], ['alice-wonderland', 'Alice nel Paese delle Meraviglie', 'Alice in Wonderland'],
  ['darth-vader', 'Darth Vader', 'Darth Vader'], ['yoda', 'Yoda', 'Yoda'],
  ['pikachu', 'Pikachu', 'Pikachu'], ['mario', 'Mario', 'Mario'],
  ['luigi', 'Luigi', 'Luigi'], ['spongebob', 'SpongeBob', 'SpongeBob SquarePants'],
  ['homer-simpson', 'Homer Simpson', 'Homer Simpson'], ['james-bond', 'James Bond', 'James Bond'],
  ['peter-pan', 'Peter Pan', 'Peter Pan'], ['don-quixote', 'Don Chisciotte', 'Don Quixote'],
  ['smartphone', 'Smartphone', 'Smartphone'], ['bicycle', 'Bicicletta', 'Bicycle'],
  ['umbrella', 'Ombrello', 'Umbrella'], ['toothbrush', 'Spazzolino da denti', 'Toothbrush'],
  ['refrigerator', 'Frigorifero', 'Refrigerator'], ['camera', 'Macchina fotografica', 'Camera'],
  ['piano', 'Pianoforte', 'Piano'], ['guitar', 'Chitarra', 'Guitar'],
  ['book', 'Libro', 'Book'], ['key', 'Chiave', 'Key'],
  ['backpack', 'Zaino', 'Backpack'], ['sunglasses', 'Occhiali da sole', 'Sunglasses'],
  ['wristwatch', 'Orologio da polso', 'Wristwatch'], ['skateboard', 'Skateboard', 'Skateboard'],
  ['candle', 'Candela', 'Candle'], ['scissors', 'Forbici', 'Scissors'],
  ['suitcase', 'Valigia', 'Suitcase'], ['compass', 'Bussola', 'Compass'],
  ['telescope', 'Telescopio', 'Telescope'], ['alarm-clock', 'Sveglia', 'Alarm clock'],
].map(([id, label, labelEn]) => ({ id, label, labelEn }));

export const whoAmIIdentities = WHO_AM_I_IDENTITIES;
