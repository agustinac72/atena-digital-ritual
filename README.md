# ATENA QR SORTEO

Create a clean, mobile-first Web App with a dark/gold luxury cyberpunk aesthetic for an electronic music event brand named "ATENA HOUSE".

Color Palette: Deep Obsidian/Black (#000000 background) with warm luxury gold accents (#EAD392, #BA9958).
Typography: Elegant serif (Cinzel / Playfair style) for main headers and clean sans-serif (Montserrat) for UI text.

Core Aesthetic: An exclusive, dark-mode digital ritual. Immersive and futuristic, not a standard landing page.

User Flow:

1. Step 1 - Welcome & Instagram Check:
- Logo / Isotipo placeholder for ATENA HOUSE.
- Title: "BIENVENIDO AL UNIVERSO ATENA"
- Subtitle: "Seguinos en Instagram para desbloquear la experiencia de esta noche."
- Primary Action Button: "SEGUIR A @ATENA" (Opens https://instagram.com/atena.house)
- Secondary Action Button: "YA SIGO A ATENA" (Advances to Step 2)

2. Step 2 - Instagram Handle Identification:
- Title: "INGRESA TU USUARIO"
- Subtitle: "Dejanos tu @ de Instagram para continuar."
- Input Field: @usuario
- Action Button: "CONTINUAR" (Saves handle and advances to Step 3)

3. Step 3 - Experience Selection:
- Title: "ELEGÍ TU EXPERIENCIA"
- Card A: "🍸 JUGAR Y GANAR UN TRAGO"
  -> On click: Triggers a digital wheel / fortune card animation.
  -> Shows result (e.g. "¡Ganaste un Shot de Bienvenida! Mostrá esta pantalla en la barra" or "2x1 en Barra"). Includes a digital voucher display with a close button.
- Card B: "📸 PARTICIPAR POR UNA MESA VIP"
  -> On click: Displays instruction card: 
     "Sacá tu mejor foto esta noche 📸, subila a tu historia de Instagram etiquetando a @atena.house y participá por una Mesa VIP para 4 personas en la próxima edición."
  -> Action Button: "ABRIR INSTAGRAM PARA SUBIR STORY" (Opens Instagram app)

Data storage: Save user handle, timestamp, and chosen experience option to Supabase / local state. Responsive layout optimized for mobile scanning via QR.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/73cdc7af-1cf1-4eab-9c6f-8e23f4afc30c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
