# Un Tesla al día · Product specs

Webviews de product spec. El template visual (header, aside de flujos, teléfono, panel de explicación) vive en este repo. **Un Tesla al día** reconstruye las pantallas en React. **Group Order ID** muestra los frames reales de Figma.

## Specs

| Spec | Entrada | Qué ves |
| --- | --- | --- |
| Un Tesla al día | `index.html` | UI interactiva reconstruida |
| Group Order ID (INI-11230) | `group-order.html` | 4 flujos de Figma *2nd review*, cada `Flow N-n` como PNG del frame |

## Cómo abrir

```bash
npm install
npx vite --port 4871 --host 127.0.0.1
```

- Tesla: http://127.0.0.1:4871/
- Group Order: http://127.0.0.1:4871/group-order.html

Clave de acceso (la misma en ambos): `PremioDiario2026MX`

Group Order también acepta hash: `#flujo-1/15` abre Flujo 1, pantalla Flow 1-15.

## Group Order — Figma

Archivo [Group Order ID](https://www.figma.com/design/NialMl3AkkpfNy6UxQr0h2/Group-Order-ID?node-id=300-92379&m=dev), sección **2nd review**.

1. Flujo 1 · Rest+Turbo (47 pantallas)
2. Flujo 2 · Turbo+Turbo (35)
3. Flujo 3 · Turbo Search+Retailers (35)
4. Flujo 4 · Retail+Retail (38)

No hay tab de multi-formato: ese caso no tiene frame en el archivo.

Capturas en `public/assets/group-order/`.
