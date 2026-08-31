# Sakura Bloom

Sitio público de un salón de belleza, construido con Vite + React (SPA client-side,
desplegable en cualquier host estático). Muestra los trabajos, los servicios con
precios y el equipo, y cierra el circuito con un flujo de reserva de turnos.

Toda la identidad gira en torno a la flor de cerezo: el nombre, la marca, la
paleta, las texturas de fondo y la animación de pétalos. Los criterios de diseño
—y las reglas que los mantienen legibles— están en [DESIGN.md](DESIGN.md); el
alcance y el estado del contenido, en [PRODUCT.md](PRODUCT.md).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción en dist/
npm run preview  # previsualizar el build
```

## Estructura

- `src/components/Sakura.jsx` — el sistema de marca: el pétalo (`PETAL_PATH`), la
  flor, el logo (inline y apilado), las ramas de fondo, el divisor y los pétalos
  que caen. Todo el motivo sale de esta única forma.
- `src/styles/tokens.css` — paleta, tipografía y la textura de pétalos del fondo.
- `src/data.js` — servicios, precios, equipo y portfolio (contenido de ejemplo).
- `src/i18n/` — textos en español e inglés.
- `public/favicon.svg` — la misma flor del logo.

## Estado del contenido

Los precios, las biografías del equipo y la dirección son marcadores de posición
hasta que haya contenido real. Las fotos son de Unsplash, verificadas. La reserva
es una maqueta funcional sin backend: no envía ni guarda datos.
