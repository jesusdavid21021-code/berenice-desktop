# Berenice — mascota de escritorio

Compañera medieval para Windows. Al abrirla aparece encima del escritorio, se mueve sola y suelta frases con giro de capitana.

## Cómo ejecutarla (desarrollo)

Necesitas [Node.js 20+](https://nodejs.org/).

```bash
git clone https://github.com/jesusdavid21021-code/berenice-desktop.git
cd berenice-desktop
npm install
npx electron .
```

## Cómo empaquetar el .exe (Windows)

Desde esta carpeta:

```bash
npm install
npm run pack:win
```

El resultado queda en `../dist-win/Berenice-win32-x64/`. Extrae esa carpeta y abre `Berenice.exe`. No separes el exe de los demás archivos.

## Controles

- **Clic** sobre ella: habla.
- **Arrastrar**: la mueves a mano.
- **Bandeja del sistema** (icono junto al reloj): Hablar, Tamaño, Salir.

Windows puede avisar que no está firmada: *Más información* → *Ejecutar de todos modos*.

## Dónde editar

| Qué quieres cambiar | Archivo |
|---|---|
| Frases | `renderer/phrases.json` |
| Animaciones / poses | `renderer/anims.json` y `renderer/berenice/` |
| Movimiento, idle, globo | `renderer/app.js` y `renderer/app.css` |
| Ventana transparente, bandeja | `main.js` |
| Icono | `icon.png` / `icon.ico` |

Sprites: cada carpeta en `renderer/berenice/<pose>/` tiene 12 frames `f00.webp` … `f11.webp`.
