# Fairway Lab – golftrening

Interaktiv treningsside for golfspillere.

- Velg **driver, jern, wedge eller putter**
- Velg hva du sliter med (slice, hook, fat, putterhastighet …)
- Velg grep og mål
- Få korte, konkrete tips
- Roter en 3D-figur med musen. Figuren bytter oppstilling etter kølle

## Åpne lokalt

Åpne `index.html` i nettleseren. Siden bruker Three.js fra CDN, så du trenger nett.

Eventuelt:

```bash
python3 -m http.server 8080
```

Gå til http://localhost:8080

## GitHub Pages

Settings → Pages → Deploy from branch `main` / root.

Live (når Pages er slått på): https://aubnic.github.io/fairway-lab/

## Innhold

| Fil | Rolle |
| --- | --- |
| `index.html` | Layout |
| `css/style.css` | Utseende |
| `js/app.js` | Valg og UI |
| `js/tips.js` | Tipsmotor |
| `js/golfer3d.js` | Three.js-figur og køller |
