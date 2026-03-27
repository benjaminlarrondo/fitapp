# Fitness Tracker

Web app de entrenamiento hibrido lista para publicar en GitHub Pages y sincronizar progreso en Supabase.

## Local

```bash
npm install
npm run dev
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Sin estas variables, la app sigue funcionando en modo local con `localStorage`.

## Checklist previo a deploy

1. Acepta la licencia de Xcode si `git` falla en tu Mac:

```bash
sudo xcodebuild -license
```

2. Verifica que el proyecto compile:

```bash
npm install
npm run build
```

3. Si usaras GitHub Pages con este `base`, el repo debe llamarse `fitapp`.

## Supabase

1. Crea un proyecto en Supabase.
2. En el SQL Editor ejecuta [supabase/schema.sql](/Users/benjaminlarrondo/Documents/Fitapp/supabase/schema.sql).
3. Activa Email OTP / Magic Link en Auth.
4. Agrega como redirect URL tu entorno local y tu GitHub Pages, por ejemplo:

```text
http://localhost:5417/fitness-tracker/
https://TU-USUARIO.github.io/fitapp/
```

## GitHub Pages

1. Inicializa Git y crea el repo remoto `fitapp` en GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/fitapp.git
git push -u origin main
```

2. En GitHub, entra a `Settings > Pages` y selecciona `GitHub Actions`.

3. Si usaras sync cloud con Supabase, crea en `Settings > Secrets and variables > Actions`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Cada push a `main` volvera a publicar la web automaticamente.

5. La URL final quedara con este formato:

```text
https://TU-USUARIO.github.io/fitapp/
```

El workflow [deploy-pages.yml](/Users/benjaminlarrondo/Documents/Fitapp/.github/workflows/deploy-pages.yml) publicara automaticamente la web.
