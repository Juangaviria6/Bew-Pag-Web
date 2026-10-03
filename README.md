# bew_ · Websites & Landing Pages

Prototipo interactivo en **React + TypeScript + Vite**, con animaciones de [Motion](https://motion.dev) y scroll suave con [Lenis](https://lenis.darkroom.engineering).

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción (dist/)
```

## Estructura

```
public/brand/          # piezas de marca recortadas (posts y logos)
src/
  data/content.ts      # todos los textos e imágenes de la web
  types/               # tipos compartidos
  hooks/               # useSmoothScroll (Lenis), useMediaQuery
  styles/globals.css   # tokens de color, tipografía y utilidades
  components/
    layout/            # Preloader, Navbar, Footer
    ui/                # Cursor, HoverExpand, ImageRevealList, Marquee, Magnetic, SplitText, Lightbox, Shapes, Logo
  sections/            # Hero, Equation, Services, Work, ProTip, Features, Process, BrandWall, Contact
```

Cada componente/sección vive en su carpeta con su `.tsx` y su `.css`.
