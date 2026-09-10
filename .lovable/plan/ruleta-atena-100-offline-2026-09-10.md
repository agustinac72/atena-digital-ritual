# Ruleta Atena 100% offline

Objetivo: que la ruleta funcione sin ninguna llamada a la nube, guardando todo en el dispositivo. La base de datos y sus tablas se conservan intactas: solo dejan de usarse.

## Qué cambia

1. **Al iniciar, no se consulta nada.** El contador de tragos entregados se lee directamente de la memoria del dispositivo y se mantiene aunque se cierre o reinicie la app.
2. **No se guarda ninguna jugada en la nube.** Se elimina el envío de cada giro, la cola de sincronización, el usuario ficticio "operador-tablet" y el campo de Instagram que ya no se usa.
3. **El botón de reinicio es local.** Pone el contador en cero y borra el último resultado en el dispositivo, sin pedirle nada al servidor.
4. **Casilleros y probabilidades sin cambios.** Los 6 sectores, el 10% / 20% / 70% y la regla de no repetir premio siguen igual, calculados solo en el dispositivo.
5. **Cupo de 50 tragos por dispositivo.** Como se usa una sola tablet, el tope vive en la memoria local.
6. **PWA offline verificada.** Se revisa que la app siga siendo instalable y que arranque sin internet, sin ninguna llamada de red pendiente al abrir.

## Qué NO cambia

- No se borra ni se modifica ninguna tabla ni función de la base de datos.
- No se toca el diseño, el logo, las tipografías, el confeti ni los textos.

## Detalles técnicos

- `src/lib/offline-prizes.ts`: se quita el import de `@/integrations/supabase/client`; `loadGiven` pasa a leer solo `localStorage`; `claimDrink` valida el tope local sin el RPC `claim_drink`; `resetCounter` deja de llamar a `reset_roulette`; se eliminan `saveEntry`, `flushQueue` y la cola `atena.entries.queue`.
- `src/routes/index.tsx`: se eliminan las llamadas a `flushQueue` y `saveEntry`; `refreshCounter` queda síncrono sobre el contador local.
- Las claves locales se mantienen: `atena.drinks.given` y `atena.spins.last`.
- Se conservan `src/integrations/supabase/*` y `src/start.ts` tal como están (no rompen el arranque offline al no ejecutarse).
- Se verifica `vite.config.ts` / `src/lib/pwa.ts`: `generateSW`, `autoUpdate`, NetworkFirst para HTML, CacheFirst para assets y registro solo en el sitio publicado.

## Nota

El modo offline solo se activa en el sitio publicado; dentro del editor no se registra por seguridad.
