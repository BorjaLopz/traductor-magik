# Proyecto: Migración Magik → TypeScript

## Contexto
Migración masiva (+50 clases) de Smallworld/Magik (GE PNI) a TypeScript + React + OL v10.
Código legacy de sistema GIS para gestión de canalizaciones cobre/fibra (FTTH).

## Stack de destino
- React 18 + TypeScript strict
- OpenLayers v10
- Turf.js para cálculos espaciales
- Proyección: EPSG:3857 interna, EPSG:4326 para GeoJSON

## Equivalencias Magik → TS (referencia rápida)
| Magik                        | TypeScript / OL                          |
|------------------------------|------------------------------------------|
| `def_slotted_exemplar`       | `interface I<NombreClase>`               |
| `slot`                       | propiedad de interfaz                    |
| `sector` / `sector_rope`     | `Coordinate[]` de ol/coordinate          |
| `bounding_box`               | `Extent` de ol/extent                    |
| `colour.new_from_dec("r,g,b")`| `rgba(r,g,b,1)` como string CSS         |
| `draw_on(window, style)`     | crear `ol/Feature` con `ol/style/Style`  |
| `transform`                  | `ol/proj` transform                      |
| `_unset`                     | `undefined`                              |
| `rope.new()`                 | `[]`                                     |
| `_for x _over coll.fast_elements()` | `for (const x of coll)`          |

## Reglas de migración
- NO traduzcas línea por línea. Analiza intención y reescribe limpio.
- Modela cada clase como: interfaz de tipos + hook o función pura según aplique.
- Lógica de rendering → OL Features/Styles. Lógica de negocio → funciones puras.
- Añade comentario corto en cada función indicando el método Magik equivalente.
- Ignora código comentado en el original y conflictos de Git sin resolver.

## Output por clase
- Componente/hook: `src/components/migration/<NombreClase>.tsx`
- Documentación:  `src/migration/<NombreClase>.txt`
- Registro en:    `src/migration/index.ts` (exportar y añadir al registro)

## App.tsx
- No borrar código previo, comentarlo con // [LEGACY]
- Añadir nueva entrada al selector de menú