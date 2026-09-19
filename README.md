# Impostor

Party game mobile in italiano e inglese. Un telefono passa tra 3–20 amici: la crew conosce una parola, gli impostori ricevono solo un indizio.

- TypeScript + Vite, sito statico senza backend, account o analytics.
- Personaggi, impostazioni, lingua e partita salvati in IndexedDB sul dispositivo.
- 120 parole bilingue in 6 categorie. Ruoli casuali, carte private, voto collettivo e rivincita.
- Design mobile, animazioni con rispetto di `prefers-reduced-motion`.

## Sviluppo

Node.js 22+.

```sh
npm ci
npm run dev
npm test
npm run build
```

## Pubblicazione

GitHub Pages: https://lucasforza.github.io/ImpostorGame/

Il workflow `.github/workflows/deploy.yml` verifica i test e pubblica `dist/` ad ogni push su `main`. La sorgente Pages del repository deve essere **GitHub Actions**. Il base path Vite è `/ImpostorGame/`.

## Knowledge base

Vedi [kb/README.md](kb/README.md), incluso UML Mermaid dei dati IndexedDB.

Il sito richiede rete per caricare i file iniziali. Una volta aperto, il gioco funziona senza chiamate di rete. I dati sono specifici del browser e dell'origine: non si trasferiscono tra localhost e GitHub Pages. Cancellare i dati del sito cancella personaggi e partita. Utilizzare una sola scheda di gioco per dispositivo.

## Licenza

Distribuito con licenza [GNU Affero General Public License v3.0 o successiva](LICENSE).
