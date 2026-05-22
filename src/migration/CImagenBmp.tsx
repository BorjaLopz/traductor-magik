/**
 * Migración: c_imagen_bmp.magik
 * Empresa:   Sigma Tao — dsanchez — 9-Marzo-2005
 * Clase Magik: c_imagen_bmp — extiende c_base_layout
 *
 * Contenedor de imagen BMP para celdas de planos de layout.
 * Wrappea un `bitmap_layout` de Smallworld con nombre de archivo,
 * flip horizontal/vertical y ajuste de imagen.
 *
 * Métodos migrados:
 *   new(RsNombre)                → CImagenBmp.nuevo(nombre)       — constructor
 *   new_from(RoObjeto, RsTexto?) → CImagenBmp.newFrom(obj, texto?) — copia (con validación)
 *   Despliega()                  → despliega()   — asigna oArea a bounds del bitmap
 *   Obten_Elemento_captura       → obtenElementoCaptura() — devuelve bitmap layout
 *   sNombre_Grafico getter/setter → propiedad filename (delegada a BitmapLayout)
 *   bVoltear_H? getter/setter    → propiedad flipH (delegada: bitmap.flipImage)
 *   bVoltear_V? getter/setter    → propiedad flipV (delegada: bitmap.mirrorImage)
 *   bfit_image? getter/setter    → propiedad fitImage (delegada: bitmap.fitImage)
 *
 * Equivalencias:
 *   bitmap_layout               → BitmapLayout (stub)
 *   bounding_box.new(0,0,100,100) → BoundingBox { xMin:0, yMin:0, xMax:100, yMax:100 }
 *   outline_style = _unset      → outlineStyle: null
 *   set_fill_colour(_unset)     → fillColour: null
 *   c_base_layout               → CBaseLayout (stub con oArea + márgenes)
 *   condition.raise(:warning)   → throw TypeError
 *   flip_image                  → CSS scaleX(-1)  (flip horizontal)
 *   mirror_image                → CSS scaleY(-1)  (flip vertical / mirror)
 *   fit_image                   → CSS object-fit: contain
 *   nMargen_xxx / 10            → conversión de unidades (×10 → ×1): ver nota
 *
 * Nota conversión márgenes en new_from:
 *   Magik: nMargen_xxx / 10 — divide por 10 los márgenes copiados.
 *   Probablemente conversión de 1/10 de mm a mm (o escala de plot a pantalla).
 */

import React, { useState } from 'react';
import type { BoundingBox } from './TituloDePlano';

// =============================================================================
// STUBS DE CLASES BASE
// =============================================================================

/**
 * Stub para bitmap_layout — elemento de imagen en Smallworld Layout Designer.
 * Wrappea la referencia al archivo de imagen y sus propiedades de visualización.
 */
export class BitmapLayout {
  bounds      : BoundingBox = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
  filename    : string  = '';    // Magik: .filename ↔ sNombre_Grafico
  flipImage   : boolean = false; // Magik: .flip_image   → CSS scaleX(-1)
  mirrorImage : boolean = false; // Magik: .mirror_image → CSS scaleY(-1)
  fitImage    : boolean = false; // Magik: .fit_image    → CSS object-fit: contain
  outlineStyle: null    = null;  // Magik: outline_style = _unset
  fillColour  : null    = null;  // Magik: set_fill_colour(_unset)
}

/**
 * Stub para c_base_layout — clase base para elementos de celda en plots.
 * Aporta el área de visualización (oArea) y los márgenes.
 */
export class CBaseLayout {
  // Magik: oArea — área asignada a la celda en el plot
  oArea      : BoundingBox = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };

  // Magik: nMargen_xxx — márgenes en unidades de layout
  nMargenInf : number = 0;
  nMargenSup : number = 0;
  nMargenIzq : number = 0;
  nMargenDer : number = 0;
}

// =============================================================================
// CLASE PRINCIPAL — c_imagen_bmp
// =============================================================================

export class CImagenBmp extends CBaseLayout {

  // Magik: {:oImagen_BMP, _unset}  — bitmap_layout de Smallworld
  private _imagenBMP!: BitmapLayout;

  // Magik: {:sNombre_Grafico, _unset} — nombre/ruta del archivo BMP
  // (slot privado; acceso vía getter/setter que delegan a _imagenBMP.filename)

  // Magik: {:bVoltear_H, _false}, {:bVoltear_V, _false}, {:bfit_image, _false}
  // Almacenados en el BitmapLayout subyacente.

  // ---------------------------------------------------------------------------
  // new(RsNombre) — constructor principal
  //
  // Magik:
  //   LoCaja << bounding_box.new(0,0,100,100)
  //   _self.oImagen_BMP << bitmap_layout.new_with(:bounds, LoCaja)
  //   _self.sNombre_Grafico << RsNombre
  //   _self.oImagen_BMP.outline_style << _unset
  //   _self.oImagen_BMP.set_fill_colour(_unset)
  //   _self.bVoltear_V = _false; bVoltear_H = _false; bfit_image = _false
  // ---------------------------------------------------------------------------
  static nuevo(nombre: string): CImagenBmp {
    const inst        = new CImagenBmp();
    inst._imagenBMP   = new BitmapLayout();
    // bounds iniciales 100×100 (valores definitivos los toma de la celda en Despliega)
    inst._imagenBMP.bounds       = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
    inst._imagenBMP.outlineStyle = null;
    inst._imagenBMP.fillColour   = null;
    inst._imagenBMP.flipImage    = false;
    inst._imagenBMP.mirrorImage  = false;
    inst._imagenBMP.fitImage     = false;
    // sNombre_Grafico setter → asigna filename al bitmap
    inst.sNombreGrafico          = nombre;
    return inst;
  }

  // ---------------------------------------------------------------------------
  // new_from(RoObjeto, optional RsTexto) — constructor de copia
  //
  // Magik:
  //   _if RoObjeto.is_kind_of?(c_imagen_bmp)  → instanceof check
  //   _else condition.raise(:warning, ...)      → throw TypeError
  //   Copia: sNombre_Grafico, bVoltear_H/V, bfit_image
  //   Márgenes: nMargen_xxx = RoObjeto.nMargen_xxx / 10  (conversión de unidad)
  // ---------------------------------------------------------------------------
  static newFrom(obj: CImagenBmp, nombre?: string): CImagenBmp {
    // Magik: _if RoObjeto.is_kind_of?(c_imagen_bmp) _then ... _else condition.raise
    if (!(obj instanceof CImagenBmp)) {
      throw new TypeError('El objeto que se proporcionó no es de tipo c_imagen_bmp');
    }

    const inst        = new CImagenBmp();
    inst._imagenBMP   = new BitmapLayout();
    inst._imagenBMP.bounds       = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
    inst._imagenBMP.outlineStyle = null;
    inst._imagenBMP.fillColour   = null;

    // Magik: _if RsTexto = _unset _then << RoObjeto.sNombre_Grafico _else << RsTexto
    inst.sNombreGrafico = nombre !== undefined ? nombre : obj.sNombreGrafico;

    // Copia propiedades de flip/fit del objeto origen
    inst._imagenBMP.flipImage   = obj._imagenBMP.flipImage;
    inst._imagenBMP.mirrorImage = obj._imagenBMP.mirrorImage;
    inst._imagenBMP.fitImage    = obj._imagenBMP.fitImage;

    // Magik: nMargen_xxx << RoObjeto.nMargen_xxx / 10
    // División por 10 → conversión de unidad (p.ej. décimas de mm → mm)
    inst.nMargenInf = obj.nMargenInf / 10;
    inst.nMargenSup = obj.nMargenSup / 10;
    inst.nMargenIzq = obj.nMargenIzq / 10;
    inst.nMargenDer = obj.nMargenDer / 10;

    return inst;
  }

  // ---------------------------------------------------------------------------
  // Despliega()
  //
  // Magik: _self.oImagen_BMP.bounds << _self.oArea
  // Asigna el área de la celda (oArea) a los bounds del bitmap_layout.
  // Esto posiciona la imagen dentro del espacio de la celda del plano.
  // ---------------------------------------------------------------------------
  despliega(): void {
    this._imagenBMP.bounds = { ...this.oArea };
  }

  // ---------------------------------------------------------------------------
  // Obten_Elemento_captura
  //
  // Magik: _return .oImagen_BMP
  // Devuelve la referencia al bitmap_layout subyacente.
  // ---------------------------------------------------------------------------
  obtenElementoCaptura(): BitmapLayout {
    return this._imagenBMP;
  }

  // ---------------------------------------------------------------------------
  // sNombre_Grafico << RsValor  /  sNombre_Grafico getter
  //
  // Magik setter: _self.oImagen_BMP.filename << RsValor
  // Magik getter: _return _self.oImagen_BMP.filename
  // ---------------------------------------------------------------------------
  get sNombreGrafico(): string {
    return this._imagenBMP?.filename ?? '';
  }
  set sNombreGrafico(valor: string) {
    if (this._imagenBMP) this._imagenBMP.filename = valor;
  }

  // ---------------------------------------------------------------------------
  // bVoltear_H? getter/setter
  //
  // Magik setter: _self.oImagen_BMP.flip_image << RbValor   → CSS scaleX(-1)
  // Magik getter: _return _self.oImagen_BMP.flip_image
  // ---------------------------------------------------------------------------
  get bVoltearH(): boolean {
    return this._imagenBMP?.flipImage ?? false;
  }
  set bVoltearH(valor: boolean) {
    if (this._imagenBMP) this._imagenBMP.flipImage = valor;
  }

  // ---------------------------------------------------------------------------
  // bVoltear_V? getter/setter
  //
  // Magik setter: _self.oImagen_BMP.mirror_image << RbValor  → CSS scaleY(-1)
  // Magik getter: _return _self.oImagen_BMP.mirror_image
  // ---------------------------------------------------------------------------
  get bVoltearV(): boolean {
    return this._imagenBMP?.mirrorImage ?? false;
  }
  set bVoltearV(valor: boolean) {
    if (this._imagenBMP) this._imagenBMP.mirrorImage = valor;
  }

  // ---------------------------------------------------------------------------
  // bfit_image? getter/setter
  //
  // Magik setter: _self.oImagen_BMP.fit_image << RbValor   → CSS object-fit: contain
  // Magik getter: _return _self.oImagen_BMP.bfit_image
  // ---------------------------------------------------------------------------
  get bFitImage(): boolean {
    return this._imagenBMP?.fitImage ?? false;
  }
  set bFitImage(valor: boolean) {
    if (this._imagenBMP) this._imagenBMP.fitImage = valor;
  }

  // Acceso directo al BitmapLayout (equivale a .oImagen_BMP)
  get imagenBMP(): BitmapLayout { return this._imagenBMP; }
}

// =============================================================================
// PLACEHOLDER — imagen SVG usada como sustituto del archivo .BMP en el demo
// En producción: src = ruta de archivo local o URL de imagen real.
// =============================================================================

function makePlaceholderDataUrl(filename: string): string {
  const short = filename.split(/[/\\]/).pop() ?? filename;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150">
    <rect width="200" height="150" fill="#e3f2fd" rx="4"/>
    <rect x="10" y="10" width="180" height="130" fill="none" stroke="#1565c0" strokeWidth="1.5" strokeDasharray="4,3" rx="3"/>
    <text x="100" y="58" text-anchor="middle" font-size="13" fill="#1565c0" font-family="sans-serif" font-weight="bold">[ Imagen BMP ]</text>
    <text x="100" y="80" text-anchor="middle" font-size="9"  fill="#555"    font-family="monospace">${short.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>
    <rect x="60" y="100" width="80" height="22" fill="#1565c0" rx="3"/>
    <text x="100" y="115" text-anchor="middle" font-size="9" fill="white"   font-family="sans-serif">bitmap_layout</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// =============================================================================
// COMPONENTE REACT — demo de c_imagen_bmp
// =============================================================================

export function CImagenBmpUI() {
  const [nombre,    setNombre  ] = useState('/imagenes/red/mapa_fachada.bmp');
  const [voltearH,  setVoltearH] = useState(false);
  const [voltearV,  setVoltearV] = useState(false);
  const [fitImage,  setFitImage] = useState(false);
  const [areaW,     setAreaW   ] = useState(200);
  const [areaH,     setAreaH   ] = useState(150);
  const [margInf,   setMargInf ] = useState(0);
  const [margSup,   setMargSup ] = useState(0);
  const [margIzq,   setMargIzq ] = useState(0);
  const [margDer,   setMargDer ] = useState(0);
  const [modoNew,   setModoNew ] = useState<'nuevo' | 'newFrom'>('nuevo');
  const [copyError, setCopyError] = useState<string | null>(null);

  // Construir instancia con el constructor seleccionado
  let imagen: CImagenBmp;
  let imagenCopia: CImagenBmp | null = null;
  copyError; // consumir para lint

  try {
    imagen = CImagenBmp.nuevo(nombre);
    imagen.bVoltearH = voltearH;
    imagen.bVoltearV = voltearV;
    imagen.bFitImage = fitImage;
    imagen.nMargenInf = margInf;
    imagen.nMargenSup = margSup;
    imagen.nMargenIzq = margIzq;
    imagen.nMargenDer = margDer;
    imagen.oArea = { xMin: 0, xMax: areaW, yMin: 0, yMax: areaH };
    // Despliega() — asigna oArea a los bounds del bitmap
    imagen.despliega();

    if (modoNew === 'newFrom') {
      // new_from: copia desde el objeto original (márgenes / 10)
      imagenCopia = CImagenBmp.newFrom(imagen);
    }
  } catch {
    imagen = CImagenBmp.nuevo('error');
  }

  const bitmap = imagen.obtenElementoCaptura();

  // Transform CSS equivalente a flip_image y mirror_image
  const transformCSS = [
    bitmap.flipImage   ? 'scaleX(-1)' : '',
    bitmap.mirrorImage ? 'scaleY(-1)' : '',
  ].filter(Boolean).join(' ') || 'none';

  const objectFitCSS: React.CSSProperties['objectFit'] = bitmap.fitImage ? 'contain' : 'fill';

  const imgSrc = makePlaceholderDataUrl(bitmap.filename);

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_imagen_bmp</h3>
      <p style={s.meta}>
        Contenedor de imagen BMP para celdas de layout de planos.
        Wrappea <code>bitmap_layout</code> con nombre de archivo, flip H/V y fit.
      </p>

      {/* ── Controles ── */}
      <div style={s.control}>
        <label style={s.lbl}>
          sNombre_Grafico (filename):
          <input
            type="text" value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ ...s.textInput, width: 240 }}
          />
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={voltearH} onChange={e => setVoltearH(e.target.checked)} />
          {' '}bVoltear_H (flip_image = scaleX(-1))
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={voltearV} onChange={e => setVoltearV(e.target.checked)} />
          {' '}bVoltear_V (mirror_image = scaleY(-1))
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={fitImage} onChange={e => setFitImage(e.target.checked)} />
          {' '}bfit_image (fit_image = object-fit: contain)
        </label>
      </div>

      <div style={{ ...s.control, marginTop: 4 }}>
        <label style={s.lbl}>
          oArea ancho:
          <input type="number" value={areaW} min={50} max={600}
            onChange={e => setAreaW(Number(e.target.value))} style={s.numInput} />px
        </label>
        <label style={s.lbl}>
          alto:
          <input type="number" value={areaH} min={50} max={400}
            onChange={e => setAreaH(Number(e.target.value))} style={s.numInput} />px
        </label>

        {['Inf','Sup','Izq','Der'].map((d, i) => {
          const vals    = [margInf, margSup, margIzq, margDer];
          const setters = [setMargInf, setMargSup, setMargIzq, setMargDer];
          return (
            <label key={d} style={s.lbl}>
              Marg{d}:
              <input type="number" value={vals[i]} min={0} max={50}
                onChange={e => setters[i](Number(e.target.value))} style={{ ...s.numInput, width: 38 }} />u
            </label>
          );
        })}

        <label style={s.lbl}>
          Constructor:
          <select value={modoNew} onChange={e => setModoNew(e.target.value as 'nuevo' | 'newFrom')} style={s.select}>
            <option value="nuevo">new(RsNombre)</option>
            <option value="newFrom">new_from(RoObjeto)</option>
          </select>
        </label>
      </div>

      {copyError && (
        <div style={{ padding: '4px 8px', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 3, fontSize: 11 }}>
          {copyError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── Preview de la imagen ── */}
        <div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
            Despliega() → bitmap.bounds = oArea ({areaW}×{areaH}px)
          </div>
          <div
            style={{
              width : areaW,
              height: areaH,
              border: '1px solid #90a4ae',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#f5f5f5',
              position: 'relative',
              // Márgenes de layout aplicados como padding
              paddingLeft  : margIzq,
              paddingRight : margDer,
              paddingTop   : margSup,
              paddingBottom: margInf,
              boxSizing    : 'border-box',
            }}
          >
            <img
              src={imgSrc}
              alt={bitmap.filename}
              style={{
                width    : '100%',
                height   : '100%',
                objectFit: objectFitCSS,
                transform: transformCSS,
                display  : 'block',
              }}
            />
          </div>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            transform: <code>{transformCSS}</code> · object-fit: <code>{objectFitCSS}</code>
          </small>
        </div>

        {/* ── Copia new_from (si activo) ── */}
        {modoNew === 'newFrom' && imagenCopia && (
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
              new_from(imagen) → copia con márgenes / 10
            </div>
            <div
              style={{
                width : areaW,
                height: areaH,
                border: '1px dashed #1565c0',
                borderRadius: 3,
                overflow: 'hidden',
                background: '#e8eaf6',
                boxSizing: 'border-box',
                paddingLeft  : imagenCopia.nMargenIzq,
                paddingRight : imagenCopia.nMargenDer,
                paddingTop   : imagenCopia.nMargenSup,
                paddingBottom: imagenCopia.nMargenInf,
              }}
            >
              <img
                src={makePlaceholderDataUrl(imagenCopia.sNombreGrafico)}
                alt={imagenCopia.sNombreGrafico}
                style={{
                  width    : '100%',
                  height   : '100%',
                  objectFit: imagenCopia.bFitImage ? 'contain' : 'fill',
                  transform: [
                    imagenCopia.bVoltearH ? 'scaleX(-1)' : '',
                    imagenCopia.bVoltearV ? 'scaleY(-1)' : '',
                  ].filter(Boolean).join(' ') || 'none',
                  display: 'block',
                }}
              />
            </div>
            <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
              Copia — márgenes: Inf={imagenCopia.nMargenInf.toFixed(1)} · Sup={imagenCopia.nMargenSup.toFixed(1)} · Izq={imagenCopia.nMargenIzq.toFixed(1)} · Der={imagenCopia.nMargenDer.toFixed(1)}
            </small>
          </div>
        )}

        {/* ── Tabla de propiedades ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          <table style={s.table}>
            <thead>
              <tr>
                {['Slot Magik', 'Getter/Setter TS', 'Valor actual', 'Equivalente CSS/SVG'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { slot: 'sNombre_Grafico',  ts: 'sNombreGrafico',  val: bitmap.filename,            css: 'src / href'           },
                { slot: 'bVoltear_H',       ts: 'bVoltearH',       val: String(bitmap.flipImage),   css: 'scaleX(-1)'           },
                { slot: 'bVoltear_V',       ts: 'bVoltearV',       val: String(bitmap.mirrorImage), css: 'scaleY(-1)'           },
                { slot: 'bfit_image',       ts: 'bFitImage',       val: String(bitmap.fitImage),    css: 'object-fit: contain'  },
                { slot: 'outline_style',    ts: 'outlineStyle',    val: 'null (_unset)',             css: 'border: none'         },
                { slot: 'set_fill_colour',  ts: 'fillColour',      val: 'null (_unset)',             css: 'background: none'     },
                { slot: 'oImagen_BMP.bounds', ts: 'bitmap.bounds', val: `${areaW}×${areaH}`,        css: 'width/height'         },
              ].map(({ slot, ts, val, css }, i) => (
                <tr key={slot} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}><code>{slot}</code></td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}><code>{ts}</code></td>
                  <td style={{ ...s.td, fontWeight: 'bold'       }}>{val}</td>
                  <td style={{ ...s.td, color: '#555', fontSize: 11 }}>{css}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {modoNew === 'newFrom' && imagenCopia && (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Margen', 'Original (u)', 'Copia /10 (u)', 'Nota'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: 'Inferior', orig: margInf, copia: imagenCopia.nMargenInf },
                  { m: 'Superior', orig: margSup, copia: imagenCopia.nMargenSup },
                  { m: 'Izquierdo', orig: margIzq, copia: imagenCopia.nMargenIzq },
                  { m: 'Derecho',  orig: margDer, copia: imagenCopia.nMargenDer },
                ].map(({ m, orig, copia }, i) => (
                  <tr key={m} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                    <td style={s.td}>{m}</td>
                    <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{orig}</td>
                    <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{copia.toFixed(1)}</td>
                    <td style={{ ...s.td, fontSize: 10, color: '#777' }}>new_from: nMargen / 10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <table style={s.table}>
            <thead>
              <tr>
                {['Método Magik', 'TS equivalente', 'Descripción'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { m: 'new(RsNombre)',             ts: 'CImagenBmp.nuevo(nombre)',           d: 'Constructor principal' },
                { m: 'new_from(RoObjeto, RsTexto)', ts: 'CImagenBmp.newFrom(obj, texto?)',  d: 'Copia con validación instanceof' },
                { m: 'Despliega()',               ts: 'despliega()',                         d: 'bitmap.bounds = oArea' },
                { m: 'Obten_Elemento_captura',    ts: 'obtenElementoCaptura()',              d: 'Devuelve BitmapLayout' },
                { m: 'condition.raise(:warning)', ts: 'throw TypeError(...)',                d: 'Validación tipo en new_from' },
              ].map(({ m, ts, d }, i) => (
                <tr key={m} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}><code>{m}</code></td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}><code>{ts}</code></td>
                  <td style={{ ...s.td, fontSize: 11, color: '#555' }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        <code>bitmap_layout.new_with(:bounds, LoCaja)</code> → <code>new BitmapLayout()</code>.
        Nota: archivo <code>.bmp</code> local no accesible directamente en web;
        en producción usar <code>URL.createObjectURL</code> o servidor de archivos.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl      : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  textInput: { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  numInput : { width: 52, padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  select   : { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  table    : { borderCollapse: 'collapse' },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td       : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default CImagenBmpUI;
