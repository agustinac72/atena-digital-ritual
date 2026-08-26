# ATENA HOUSE — Ruleta con cupo, footer, VIP y logo

## Estado actual verificado
- Lovable Cloud ya está habilitado y la tabla `atena_entries` existe (campos: usuario de Instagram, experiencia, premio, fecha). Las participaciones ya se guardan ahí.
- La ruleta actual tiene 6 premios distintos, sin límite de cupo.
- El footer dice "Atena House · Ritual Digital"; el paso 1 dice "Seguir a @atena"; el logo se muestra a 224 px de ancho con los márgenes negros originales de la imagen.

## Cambios propuestos

### 1. Base de datos: cupo global de 50 tragos
- Nueva tabla de contador global de tragos entregados (una sola fila, arranca en 0).
- Nueva función de servidor `claim_drink()` que, de forma atómica: si ya se entregaron 50 tragos devuelve "sin cupo"; si no, suma 1 y devuelve "premio otorgado". Esto evita que dos personas girando al mismo tiempo superen el cupo.
- Se agrega a `atena_entries` un campo booleano "ganó trago" para poder auditar resultados.
- Permisos: cualquier visitante puede leer el contador y llamar a la función; nadie puede editar el contador a mano desde la web.

### 2. Ruleta de 6 secciones
- 6 casilleros alternados: 3 con "GANASTE UN TRAGO 🍸" y 3 con "NOS VEMOS EN LA PISTA 🪩".
- Al girar, primero se consulta el cupo con `claim_drink()`:
  - Si hay cupo → la aguja cae en uno de los 3 casilleros de premio y se muestra el voucher del trago.
  - Si ya se entregaron los 50 → la aguja cae siempre en un casillero "NOS VEMOS EN LA PISTA 🪩" y se muestra una tarjeta simpática sin premio.
- El resultado (ganó / no ganó) se guarda en `atena_entries` junto al @.

### 3. Footer
- Texto reemplazado por "POWERED BY ATENA HOUSE", chico, centrado, en el mismo dorado sutil actual.

### 4. Tarjeta Mesa VIP
- Sin subida de archivos ni cámara. Solo una tarjeta con los 3 pasos numerados (foto → historia → etiquetar a @atena.house), la nota "¡Al haber ingresado tu @ en el paso anterior, al etiquetarnos ingresás automáticamente al sorteo!" y un único botón "ABRIR INSTAGRAM" que abre https://www.instagram.com en pestaña nueva. Se quita el botón "Volver" secundario del bloque principal (queda la navegación de volver como enlace discreto).

### 5. Logo superior
- El logo pasa a ocupar ~80% del ancho, con recorte interno (`object-cover` sobre un contenedor con relación de aspecto ajustada) para eliminar los bordes vacíos alrededor de la lechuza. Sin contenedores ni fondos grises: fondo negro puro.

### 6. Handle en el home
- "Seguir a @atena" pasa a "SEGUIR A @ATENA.HOUSE".

## Detalles técnicos
- Migración SQL: tabla `prizes_counter` (fila única id=1, `total_drinks_given int default 0`), columna `won_drink boolean` en `atena_entries`, función `public.claim_drink()` en modo `security definer` con `UPDATE ... WHERE total_drinks_given < 50 RETURNING` para atomicidad, GRANT de ejecución a `anon`/`authenticated` y GRANT SELECT del contador.
- Frontend: `src/lib/atena.ts` pasa a exportar los 6 segmentos (alternando premio / sin premio) y el enlace `https://www.instagram.com`; `src/routes/index.tsx` ajusta ruleta, voucher, tarjeta VIP, footer, logo y textos.
- Se mantiene todo el resto de la estética: fondo negro, tipografía Albertus Nova en títulos, Montserrat en UI, bordes y dorados actuales.
