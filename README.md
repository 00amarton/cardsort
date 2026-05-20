# Card Sorting

Zero banner, zero autenticazione. Link partecipanti completamente pubblici.

## File

```
cardsort/
├── index.html       # Pannello ricercatore
├── card-sort.html   # Pagina partecipanti
├── api.js           # Chiamate al backend GAS
├── config.js        # <-- UNICO FILE DA MODIFICARE
├── Code.gs          # Backend Google Apps Script
└── README.md
```

## Setup in 3 passi

### 1. Backend (Google Apps Script)

1. Apri Google Sheets → **Estensioni → Apps Script**
2. Cancella tutto il codice esistente
3. Incolla il contenuto di `Code.gs`
4. Salva (Ctrl+S)
5. **Distribuisci → Nuova distribuzione**
   - Tipo: App web
   - Esegui come: Me
   - Chi può accedere: **Chiunque**
6. Copia l'URL `/exec`

### 2. Configura config.js

Apri `config.js` e incolla l'URL:

```js
var GAS_URL = 'https://script.google.com/macros/s/AKfy.../exec';
```

### 3. GitHub Pages

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/TUO-USERNAME/cardsort.git
git push -u origin main
```

Poi su GitHub: **Settings → Pages → main / root → Save**

Il sito sarà su: `https://TUO-USERNAME.github.io/cardsort/`

## Utilizzo

- **Ricercatore**: apre `index.html`, crea sessione, copia link
- **Partecipante**: apre il link, ordina le carte, clicca "Invia risultato"
- **Risultati**: tab "Risultati" oppure Google Sheet direttamente

## ID partecipante personalizzato

Aggiungi `?pid=P001` al link per collegare il card sort a un questionario:
```
card-sort.html?session=abc12345&pid=P001
```
