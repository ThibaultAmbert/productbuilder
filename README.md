# 🔮 Astro Quiz

Une application web de devinette de signes astrologiques pour animer vos formations et icebreakers.

Les participants s'inscrivent avec leur prénom et leur date de naissance — le signe est calculé automatiquement et gardé secret. Les autres joueurs essaient de le deviner et accumulent des points. Un classement en temps réel suit les meilleurs devineurs.

---

## Fonctionnalités

- **Inscription** — entrez votre prénom et date de naissance, votre signe est révélé uniquement à vous
- **Jeu** — devinez le signe des autres participants parmi les 12 signes du zodiaque
- **Scoring** — +10 points par bonne réponse, chaque participant ne peut être deviné qu'une seule fois
- **Classement live** — médailles 🥇🥈🥉, score, nombre de bonnes réponses et taux de précision
- **Confettis** — animation de célébration à chaque bonne réponse
- **Persistance** — toutes les données sont stockées dans le `localStorage` du navigateur, aucun serveur requis

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Structure | HTML5 |
| Style | CSS3 (custom properties, grid, animations) |
| Logique | JavaScript vanilla (ES6+) |
| Persistance | `localStorage` |
| Dépendances | **Aucune** |

---

## Installation et lancement

### Option 1 — Ouverture directe (sans serveur)

```bash
# Cloner le dépôt
git clone https://github.com/ThibaultAmbert/productbuilder.git
cd productbuilder

# Ouvrir index.html dans votre navigateur
```

> Double-cliquez sur `index.html` ou glissez-le dans votre navigateur.

### Option 2 — Serveur local (recommandé)

Avec **Node.js** :

```bash
npx serve .
# → http://localhost:3000
```

Avec **Python** :

```bash
python -m http.server 8080
# → http://localhost:8080
```

Avec l'extension **Live Server** sur VS Code : clic droit sur `index.html` → *Open with Live Server*.

---

## Utilisation

### 1. S'inscrire

1. Cliquez sur **M'inscrire**
2. Entrez votre prénom et votre date de naissance
3. Votre signe astrologique est calculé automatiquement et affiché
4. Il reste caché pour les autres participants

### 2. Jouer

1. Cliquez sur **Jouer** (nécessite au moins 2 participants inscrits)
2. Sélectionnez votre profil
3. Choisissez un participant à deviner
4. Cliquez sur le signe qui vous semble juste parmi les 12 proposés
5. Consultez votre résultat et votre score

### 3. Classement

Accessible à tout moment depuis le bouton 🏆. Affiche tous les participants triés par score, avec leur signe, leur précision et leurs médailles.

---

## Réinitialiser les données

Les données sont stockées dans le `localStorage` du navigateur. Pour tout effacer :

```javascript
// Dans la console du navigateur (F12)
localStorage.removeItem('astro_participants');
localStorage.removeItem('astro_guesses');
location.reload();
```

---

## Structure du projet

```
.
├── index.html   # Shell HTML de l'application
├── style.css    # Design system complet (thème cosmique sombre)
├── app.js       # Logique SPA : router, vues, base de données locale
└── .claude/
    └── skills/
        └── code-review.md   # Skill Claude Code pour la revue de code
```

---

## Signes astrologiques supportés

| Signe | Période |
|-------|---------|
| ♈ Bélier | 21 mars – 19 avril |
| ♉ Taureau | 20 avril – 20 mai |
| ♊ Gémeaux | 21 mai – 20 juin |
| ♋ Cancer | 21 juin – 22 juillet |
| ♌ Lion | 23 juillet – 22 août |
| ♍ Vierge | 23 août – 22 septembre |
| ♎ Balance | 23 septembre – 22 octobre |
| ♏ Scorpion | 23 octobre – 21 novembre |
| ♐ Sagittaire | 22 novembre – 21 décembre |
| ♑ Capricorne | 22 décembre – 19 janvier |
| ♒ Verseau | 20 janvier – 18 février |
| ♓ Poissons | 19 février – 20 mars |
