import React from "react";
import {
  ChevronLeft, ChevronRight, ChevronUp, Info, MapPin, Minus, Plus, Search,
  Share, Trash2, X, Clock3, Bike, Zap,
} from "lucide-react";
import type { GoCatalog, GoResolved } from "./go-map";
import "./go-screens.css";

const UI = "assets/group-order/ui";
const PLUS = "assets/figma/search/plus.svg";
const MAP = "assets/figma/checkout/map.png";

function HotNum({ n }: { n: number }) {
  return <span className="hot-badge" aria-hidden="true">{n}</span>;
}

function StatusBar({ light = false }: { light?: boolean }) {
  return <div className={`go-status${light ? " light" : ""}`}><b>9:41</b><div className="island" /><div className="signal">▮▮▮ ᯤ ▰</div></div>;
}

function Money({ v }: { v: string }) {
  return <span className="go-price"><i>$</i><b>{v}</b></span>;
}

function Ava({ kind, src }: { kind: string; src?: string }) {
  if (src) return <img className="go-ava" src={src} alt="" />;
  const label: Record<string, string> = { mcd: "M", turbo: "Turbo", dec: "DECATHLON", pb: "PULL&BEAR", mango: "MANGO", chef: "🍔" };
  return <span className={`go-ava dot ${kind}`}>{label[kind] ?? kind}</span>;
}

function Stepper({ qty, hot }: { qty: number; hot?: boolean }) {
  return <div className={`go-step${hot ? " is-hotspot" : ""}`}>
    <button type="button" aria-label="Menos"><Minus size={14} /></button>
    <em>{qty}</em>
    <button type="button" aria-label="Más"><Plus size={14} /></button>
    {hot && <HotNum n={2} />}
  </div>;
}

function GreenCta({ children, n, onClick }: { children: React.ReactNode; n: number; onClick: () => void }) {
  return <button type="button" className="go-cta is-hotspot" onClick={onClick}>{children}<HotNum n={n} /></button>;
}

type Line = {
  img?: string; emoji?: string; name: string; price: string; qty: number;
  offer?: string; was?: string; unit?: string; extras?: string[];
};
type StoreBlock = {
  kind: string; src?: string; name: string; eta: string; turbo?: boolean;
  lines: Line[]; sub: string; was?: string; save?: string; count: string;
  promo?: string; promoHint?: string; promoOk?: boolean; warehouse?: string; warehouseN?: number;
};

const MCD: StoreBlock = {
  kind: "mcd", src: `${UI}/mcd.png`, name: "McDonald’s", eta: "30 min",
  lines: [
    { img: `${UI}/fries.png`, name: "Papas medianas", price: "6.000", qty: 1 },
    { img: `${UI}/sundae.png`, name: "Sundae", price: "6.500", qty: 2, offer: "−20%", was: "$8.100", extras: ["Sabor: Vainilla", "Extras: Maní · Salsa chocolate"] },
  ],
  sub: "19.500", was: "$22.200", save: "Ahorras: $3.200", count: "3 productos",
  promo: "35% Cashback con Pro", promoHint: "Agrega $1.000 más para activar",
};

const TURBO_DRINK: StoreBlock = {
  kind: "turbo", src: `${UI}/turbo.png`, name: "Turbo", eta: "10 min", turbo: true,
  lines: [
    { img: `${UI}/drink.png`, name: "Brisa maracuyá", price: "6.800", qty: 1, unit: "1 x 1.000 ml" },
    { img: `${UI}/drink2.png`, name: "Coca-Cola", price: "4.500", qty: 1, unit: "1 x 1.5 L" },
    { emoji: "🍫", name: "Chocolate Jet", price: "3.000", qty: 1, unit: "1 x 12 g" },
  ],
  sub: "14.300", count: "3 productos",
};

const TURBO_A: StoreBlock = {
  kind: "turbo", src: `${UI}/turbo.png`, name: "Turbo", eta: "10 min", turbo: true, warehouse: "Entrega en 10 min", warehouseN: 1,
  lines: [
    { emoji: "🍎", name: "Manzana Royal", price: "2.000", qty: 3, unit: "1 x 250 g aprox.", offer: "−20%", was: "$2.500" },
    { emoji: "☕", name: "Café instantáneo Colcafé suave", price: "3.500", qty: 1, unit: "1 x 50 g" },
    { emoji: "🥛", name: "Leche descremada deslactosada Alpina", price: "7.800", qty: 1, unit: "1 x 1100 ml" },
  ],
  sub: "", count: "5 productos",
};

const TURBO_B: StoreBlock = {
  kind: "turbo", src: `${UI}/turbo.png`, name: "Turbo", eta: "20 min", turbo: true, warehouse: "Entrega en 20 min", warehouseN: 2,
  lines: [
    { emoji: "🍪", name: "Torta Gala Vainilla", price: "1.650", qty: 4, unit: "1 x 60 g", offer: "−40%", was: "$2.750" },
    { emoji: "🍔", name: "Hamburguesa de res pre-asada Zenú", price: "18.900", qty: 2, unit: "1 x 400 g" },
  ],
  sub: "", count: "6 productos",
};

const DEC: StoreBlock = {
  kind: "dec", name: "Decathlon", eta: "25 min · programado",
  lines: [{ emoji: "🧥", name: "Buzo polar", price: "85.500", qty: 1, unit: "1 x 1 ud", offer: "−10%", was: "$95.000", extras: ["Talla: S", "Color: Azul aguamarine"] }],
  sub: "85.500", was: "$95.000", save: "Ahorras: $9.500", count: "1 producto",
  promo: "$20mil OFF con Pro", promoHint: "Agrega $84.500 más para activar",
};

const PB: StoreBlock = {
  kind: "pb", name: "Pull & Bear", eta: "50 min · programado",
  lines: [
    { emoji: "👖", name: "Pantalón sudadera", price: "140.000", qty: 1, unit: "1 x 1 ud", offer: "−20%", was: "$175.000", extras: ["Talla: S", "Color: Gris"] },
    { emoji: "🧥", name: "Chaqueta impermeable", price: "84.000", qty: 1, unit: "1 x 1 ud", offer: "−30%", was: "$120.000", extras: ["Talla: S", "Color: Rojo"] },
    { emoji: "🧢", name: "Gorra básica atletismo", price: "40.000", qty: 1, unit: "1 x 1 ud", offer: "−20%", was: "$50.000", extras: ["Color: Gris"] },
    { emoji: "🎒", name: "Morral senderismo", price: "27.000", qty: 1, unit: "1 x 1 ud", offer: "−10%", was: "$30.000" },
  ],
  sub: "291.000", was: "$375.000", save: "Ahorras: $84.000", count: "4 productos", promoOk: true,
};

const MANGO: StoreBlock = {
  kind: "mango", name: "Mango", eta: "Hoy, 2 pm",
  lines: [{ emoji: "👚", name: "Bluza satinada", price: "162.000", qty: 1, unit: "1 x 1 ud", offer: "−10%", was: "$180.000", extras: ["Talla: XS", "Color: Verde olivo"] }],
  sub: "162.000", was: "$180.000", save: "Ahorras: $18.000", count: "1 producto", promoOk: true,
};

const SEARCH_A: StoreBlock = {
  kind: "turbo", src: `${UI}/turbo.png`, name: "Turbo", eta: "10 min", turbo: true,
  lines: [
    { emoji: "📦", name: "Pañales etapa 6 — Pampers", price: "22.400", qty: 1, unit: "1 x 330 ml", offer: "−30%", was: "$32.000" },
    { emoji: "📦", name: "Pañales etapa 6 — Huggies", price: "20.000", qty: 1, unit: "1 x 330 ml", offer: "−20%", was: "$25.000" },
  ],
  sub: "42.400", count: "2 productos",
};

const SEARCH_B: StoreBlock = {
  kind: "dec", name: "Farmatodo", eta: "20 min",
  lines: [{ emoji: "📦", name: "Pañales Winny etapa 6", price: "22.900", qty: 1, unit: "1 x 330 ml" }],
  sub: "22.900", count: "1 producto",
};

function storesFor(cat: GoCatalog): { banner: string; sub: string; total: string; storesN: string; blocks: StoreBlock[] } {
  if (cat === "turbo-turbo") {
    return {
      banner: "Recibirás 2 entregas sin costo adicional",
      sub: "Productos enviados de bodegas diferentes",
      total: "61.700", storesN: "2 tiendas",
      blocks: [TURBO_A, TURBO_B],
    };
  }
  if (cat === "search-retail") {
    return {
      banner: "Recibirás 2 entregas",
      sub: "Productos enviados de tiendas diferentes",
      total: "65.300", storesN: "2 tiendas",
      blocks: [SEARCH_A, SEARCH_B],
    };
  }
  if (cat === "retail") {
    return {
      banner: "Recibirás 3 entregas",
      sub: "Productos enviados de tiendas diferentes",
      total: "538.500", storesN: "3 tiendas",
      blocks: [DEC, PB, MANGO],
    };
  }
  return {
    banner: "Recibirás 2 entregas",
    sub: "Productos enviados de tiendas diferentes",
    total: "33.800", storesN: "2 tiendas",
    blocks: [MCD, TURBO_DRINK],
  };
}

function LineRow({ line, hot }: { line: Line; hot?: boolean }) {
  return <div className="go-line">
    {line.img
      ? <img className="go-thumb" src={line.img} alt="" />
      : <div className="go-sku">{line.emoji ?? "🛒"}</div>}
    <div className="info">
      <div className="name">{line.name}</div>
      {line.unit && <div className="unit">{line.unit}</div>}
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Money v={line.price} />
        {line.offer && <span className="go-offer">{line.offer}</span>}
        {line.was && <span className="go-was">{line.was}</span>}
      </div>
      {line.extras && <div className="go-extras">{line.extras.map(e => <div key={e}>{e}</div>)}</div>}
    </div>
    <Stepper qty={line.qty} hot={hot} />
  </div>;
}

function StoreBasket({ block, firstHot }: { block: StoreBlock; firstHot?: boolean }) {
  return <div>
    {block.warehouse
      ? <div className="go-wh"><span className={`n${block.warehouseN === 2 ? " late" : ""}`}>{block.warehouseN}</span>{block.warehouse}
          <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" className="go-x" aria-label="Vaciar"><Trash2 size={14} /></button>
            <button type="button" className="go-x" aria-label="Colapsar"><ChevronUp size={14} /></button>
          </span>
        </div>
      : <div className="go-store-h">
          <Ava kind={block.kind} src={block.src} />
          <div className="meta">
            <b>{block.name}</b>
            <small className={block.turbo ? "turbo" : ""}>{block.turbo && <Zap size={12} />}{block.eta}</small>
          </div>
          <div className="go-ico-btns">
            <button type="button" aria-label="Vaciar"><Trash2 size={14} /></button>
            <button type="button" aria-label="Colapsar"><ChevronUp size={14} /></button>
          </div>
        </div>}
    {block.lines.map((l, i) => <LineRow key={l.name} line={l} hot={firstHot && i === 0} />)}
    {block.promo && <>
      <div className="go-promo">
        <span className="stamp">0</span>
        <div className="txt"><b>{block.promo}</b><small>{block.promoHint}</small></div>
        <button type="button" className="go-chip">3 beneficios <ChevronRight size={12} /></button>
      </div>
      <div className="go-bar"><i><em style={{ width: "70%" }} /></i></div>
    </>}
    {block.promoOk && <div className="go-promo"><span className="stamp" style={{ borderColor: "#177749", color: "#177749" }}>✓</span>
      <div className="txt"><b>¡Conseguiste tus beneficios!</b></div>
      <button type="button" className="go-chip">3 beneficios <ChevronUp size={12} /></button>
    </div>}
    {block.sub && <div className="go-sub">
      <div className="left">
        <b>${block.sub}</b>
        {(block.was || block.save) && <div className="save"><span className="go-was">{block.was}</span>{block.save && <span> · {block.save}</span>}</div>}
      </div>
      <span className="count">{block.count}</span>
    </div>}
  </div>;
}

function GoCover({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <div className="go-screen go-cover">
    <StatusBar light />
    <div className="mark">R</div>
    <span className="kicker">{kicker} · 2nd review</span>
    <h1>{title}</h1>
    <p>{body}</p>
  </div>;
}

const STORE_PRODS = [
  { img: `${UI}/burger.png`, price: "8.000" },
  { img: `${UI}/combo.png`, price: "18.000" },
  { img: `${UI}/sundae.png`, price: "6.500" },
  { img: `${UI}/nuggets.png`, price: "7.000" },
  { img: `${UI}/fries.png`, price: "18.000" },
  { img: `${UI}/drink.png`, price: "18.000" },
];

function GoStore({ cartQty, next, sheet }: { cartQty: number; next: () => void; sheet?: string }) {
  const total = cartQty >= 4 ? "33.800" : cartQty >= 2 ? "19.500" : cartQty === 1 ? "6.000" : "";
  return <div className="go-screen">
    <div className="go-body">
    <StatusBar />
    <div className="go-hero">
      <img src={`${UI}/mcd-hero.png`} alt="" />
      <div className="float">
        <button type="button" className="go-round is-hotspot" onClick={next} aria-label="Atrás"><ChevronLeft size={18} /><HotNum n={1} /></button>
        <span className="sp" />
        <button type="button" className="go-round" aria-label="Buscar"><Search size={16} /></button>
        <button type="button" className="go-round" aria-label="Compartir"><Share size={16} /></button>
      </div>
    </div>
    <div className="go-storename"><img className="go-ava" src={`${UI}/mcd.png`} alt="" /><b>McDonald’s</b></div>
    <div className="go-info">
      <div><small>Entrega</small><b>30 min</b></div>
      <div><small>Envío</small><b>$4.900</b></div>
      <div><small>Pedido mín.</small><b>$12.000</b></div>
    </div>
    <div className="go-stamps">{[1, 2, 3, 4, 5].map(n => <i key={n}>{n}</i>)}</div>
    <div className="go-offers">
      <div className="go-off"><b>35% Cashback</b><small>Mín. $20.000</small><div className="bar"><i /></div></div>
      <div className="go-off pro"><b>Envío gratis Pro</b><small>Mín. $10.000</small><div className="bar"><i /></div></div>
    </div>
    <div className="go-tabs">
      <button type="button" className="on">Novedades</button>
      <button type="button">McCombos</button>
      <button type="button">McNívoros</button>
      <button type="button">Signature</button>
    </div>
    <div className="go-grid">{STORE_PRODS.map((p, i) =>
      <div className="go-prod" key={p.price + i}>
        <div className="img"><img src={p.img} alt="" /></div>
        <button type="button" className={`plus go-plus${i === 0 ? " is-hotspot" : ""}`} onClick={next} aria-label="Agregar">
          <img src={PLUS} alt="" />{i === 0 && <HotNum n={2} />}
        </button>
        <b>${p.price}</b>
        <p>Este es un nombre de producto muy largo para que ocupe más de 2 lineas</p>
      </div>)}
    </div>
    {cartQty > 0 && !sheet && <button type="button" className="go-fab is-hotspot" onClick={next}>
      <span>{cartQty} prod.</span><b>${total}</b><HotNum n={3} />
    </button>}
    </div>
    {sheet && <>
      <button type="button" className="go-dim is-hotspot" onClick={next} aria-label="Overlay"><HotNum n={1} /></button>
      <div className="go-sheet">
        <div className="grab" />
        <button type="button" className="go-x is-hotspot" onClick={next} aria-label="Cerrar" style={{ position: "absolute", right: 24, top: 16 }}><X size={16} /><HotNum n={3} /></button>
        <h2>{sheet === "turbo" ? "Completa tu pedido" : "Complementa tu pedido"}</h2>
        <p className="sub">{sheet === "turbo" ? "Productos de otra bodega Turbo, 20 min." : "La gente también pide esto en McDonald’s."}</p>
        {[["Papas medianas", `${UI}/fries.png`, "6.000"], ["Sundae", `${UI}/sundae.png`, "6.500"], ["McNuggets", `${UI}/nuggets.png`, "8.000"]].map(([n, img, p]) =>
          <div className="go-sheet-item" key={n}>
            <div className="ph"><img src={img} alt="" /></div>
            <div className="info"><b>{n}</b><small>${p}</small></div>
            <button type="button" className="plus go-plus is-hotspot" onClick={next} aria-label="Agregar" style={{ width: 40, height: 40, border: 0, background: "transparent", padding: 0, position: "relative" }}>
              <img src={PLUS} alt="" width={40} height={40} /><HotNum n={2} />
            </button>
          </div>)}
      </div>
    </>}
  </div>;
}

function GoCart({ cat, next, tall }: { cat: GoCatalog; next: () => void; tall?: boolean }) {
  const data = storesFor(cat);
  return <div className="go-screen">
    <div className="go-body">
    <StatusBar />
    <div className="go-nav">
      <button type="button" className="go-x is-hotspot" onClick={next} aria-label="Cerrar"><X size={16} /><HotNum n={1} /></button>
      <b>Canasta</b>
    </div>
    <div className="go-banner">
      <i><Bike size={18} /></i>
      <div><b>{data.banner}</b><small>{data.sub}</small></div>
    </div>
    {data.blocks.map((b, i) => <React.Fragment key={b.name + (b.warehouse ?? "")}>
      {i > 0 && !(b.warehouse && i === 1 && data.blocks[0].kind === "turbo") && <div className="go-gap" />}
      <StoreBasket block={b} firstHot={i === 0} />
    </React.Fragment>)}
    {cat === "turbo-turbo" && <div className="go-upsell">
      <h4>Completa tu pedido</h4>
      <div className="go-upsell-row">
        <div className="go-up">
          <div className="ph">🌾<img className="plus" src={PLUS} alt="" /></div>
          <div className="eta"><Zap size={12} />10 min</div>
          <b>$3.500</b>
          <p>Harina precocida Doñarepa</p>
        </div>
        <div className="go-up">
          <div className="ph">🥛<img className="plus" src={PLUS} alt="" /></div>
          <div className="eta slow"><Clock3 size={12} />20 min</div>
          <b>$7.000</b>
          <p>Crema de leche Alquería</p>
        </div>
        <div className="go-up">
          <div className="ph">🍺<img className="plus" src={PLUS} alt="" /></div>
          <div className="eta"><Zap size={12} />10 min</div>
          <b>$4.500</b>
          <p>Cerveza Bud Light</p>
        </div>
      </div>
    </div>}
    {tall && <div style={{ height: 40 }} />}
    </div>
    <div className="go-dock">
      <div className="go-total"><b>${data.total}</b><small>{data.storesN}</small></div>
      <GreenCta n={3} onClick={next}>Continuar</GreenCta>
    </div>
  </div>;
}

function etaStores(cat: GoCatalog): { name: string; kind: string; slots: [string, string][]; on: number }[] {
  if (cat === "retail") return [
    { name: "Decathlon", kind: "dec", slots: [["Más rápido", "25-40 min"], ["Programar", "Hoy, 4 pm"]], on: 0 },
    { name: "Pull & Bear", kind: "pb", slots: [["Más rápido", "50-70 min"], ["Programar", "Hoy, 6 pm"]], on: 1 },
    { name: "Mango", kind: "mango", slots: [["Más rápido", "Hoy, 2 pm"], ["Programar", "Mañana"]], on: 0 },
  ];
  if (cat === "turbo-turbo") return [
    { name: "Turbo · 10 min", kind: "turbo", slots: [["Más rápido", "10 min"], ["Estándar", "20 min"]], on: 0 },
    { name: "Turbo · 20 min", kind: "turbo", slots: [["Más rápido", "20 min"], ["Estándar", "35 min"]], on: 0 },
  ];
  if (cat === "search-retail") return [
    { name: "Turbo", kind: "turbo", slots: [["Más rápido", "10 min"], ["Estándar", "25 min"]], on: 0 },
    { name: "Farmatodo", kind: "dec", slots: [["Más rápido", "20 min"], ["Estándar", "40 min"]], on: 0 },
  ];
  return [
    { name: "McDonald’s", kind: "mcd", slots: [["Más rápido", "30 min"], ["Estándar", "45-60 min"]], on: 0 },
    { name: "Turbo", kind: "turbo", slots: [["Más rápido", "10 min"], ["Estándar", "25 min"]], on: 0 },
  ];
}

function GoCheckout({ cat, phase, next }: { cat: GoCatalog; phase: string; next: () => void }) {
  const data = storesFor(cat);
  const etas = etaStores(cat);
  const pay = phase === "pay" || phase === "sheet";
  const overlay = phase === "eta-sheet" || phase === "sheet";
  return <div className="go-screen">
    <div className="go-body">
    <StatusBar />
    <div className="go-ck-nav">
      <button type="button" className="go-x is-hotspot" onClick={next} aria-label="Atrás"><ChevronLeft size={18} /><HotNum n={1} /></button>
      <b>{pay ? "Terminar y pagar" : "Entrega estimada"}</b>
      <span style={{ width: 32 }} />
    </div>
    {pay && <div className="go-map">
      <img src={MAP} alt="" />
      <i className="pin" />
      <button type="button" className="adj">Ajustar punto de entrega</button>
    </div>}
    {pay && <>
      <button type="button" className="go-row is-hotspot" onClick={next}><MapPin className="ico" size={20} /><div><b>Mi casa</b><small>Carrera 11 #82-01 apto 103</small></div><ChevronRight size={18} style={{ marginLeft: "auto", color: "#919aaa" }} /><HotNum n={2} /></button>
      <button type="button" className="go-row"><Info className="ico" size={20} /><div><b>Detalles</b><small>Edificio 82, Apto 1202</small></div><ChevronRight size={18} style={{ marginLeft: "auto", color: "#919aaa" }} /></button>
    </>}
    {etas.map(s => <div className="go-eta-block" key={s.name}>
      <div className="h"><Ava kind={s.kind} /><b>{s.name}</b></div>
      {s.slots.map((sl, i) =>
        <button type="button" key={sl[0]} className={`go-slot${i === s.on ? " on is-hotspot" : ""}`} onClick={next}>
          <span className="radio" />
          <div><b>{s.kind === "turbo" && i === 0 && <Zap size={14} />}{sl[0]}</b><small>{sl[1]}</small></div>
          {i === s.on && i === 0 && s.name.startsWith("Mc") && <HotNum n={2} />}
        </button>)}
    </div>)}
    {pay && <>
      <div className="go-pay-h"><span>Método de pago</span><button type="button">Cambiar</button></div>
      <div className="go-row"><div><b>RappiPay</b><small>Visa ···· 4242</small></div></div>
    </>}
    <div className="go-dock">
      <div className="go-total"><b>${data.total}</b><small>{data.storesN}</small></div>
      <GreenCta n={3} onClick={next}>{pay ? "Terminar y pagar" : "Continuar"}</GreenCta>
    </div>
    </div>
    {overlay ? <>
      <button type="button" className="go-dim is-hotspot" onClick={next} aria-label="Overlay"><HotNum n={1} /></button>
      <div className="go-sheet">
        <div className="grab" />
        <h2>Elige el horario</h2>
        <p className="sub">Cada tienda tiene su propia ventana de entrega.</p>
        {etas[0].slots.map((sl, i) =>
          <button type="button" key={sl[0]} className={`go-slot${i === 0 ? " on is-hotspot" : ""}`} onClick={next}>
            <span className="radio" /><div><b>{sl[0]}</b><small>{sl[1]}</small></div>{i === 0 && <HotNum n={2} />}
          </button>)}
      </div>
    </> : null}
  </div>;
}

function GoCreating({ cat, done, next }: { cat: GoCatalog; done: boolean; next: () => void }) {
  const n = storesFor(cat).blocks.length;
  return <div className="go-screen">
    <StatusBar />
    <div className="go-ck-nav">
      <button type="button" className="go-x" aria-label="Cerrar"><X size={16} /></button>
      <span />
      <button type="button" className="go-chip" style={{ height: 32 }}>Ayuda</button>
    </div>
    {done
      ? <div className="go-create is-hotspot" onClick={next}>
          <h1>Pedido creado<HotNum n={1} /></h1>
          <p className="eta">Entrega estimada: <b>12:35 pm</b></p>
          <p className="go-late">{n} entregas · llega a más tardar a las <b>1:05 pm</b></p>
          {storesFor(cat).blocks.map(b =>
            <div className="go-row" key={b.name}><Ava kind={b.kind} src={b.src} /><div><b>{b.name}</b><small>{b.eta} · ${b.sub || storesFor(cat).total}</small></div><ChevronRight size={18} style={{ marginLeft: "auto", color: "#919aaa" }} /></div>)}
        </div>
      : <div className="go-create" style={{ textAlign: "center" }}>
          <div className="go-spin" />
          <h1 style={{ fontSize: 20 }}>Estamos creando tu pedido</h1>
          <p className="eta">Un pago. {n} entregas en camino.</p>
        </div>}
  </div>;
}

function tabsFor(cat: GoCatalog): { kind: string; name: string }[] {
  return storesFor(cat).blocks.map(b => ({ kind: b.kind, name: b.name.split("·")[0].trim() }));
}

function GoTracking({ cat, tab, tooltip, map, sheet, code, next }: { cat: GoCatalog; tab: number; tooltip?: boolean; map?: boolean; sheet?: boolean; code?: boolean; next: () => void }) {
  const tabs = tabsFor(cat);
  const active = tabs[Math.min(tab, tabs.length - 1)] ?? tabs[0];
  const block = storesFor(cat).blocks[Math.min(tab, tabs.length - 1)];
  return <div className="go-screen">
    <div className="go-body">
    <StatusBar />
    <div className="go-tabs-store">
      <button type="button" className="go-x" aria-label="Cerrar"><X size={16} /></button>
      {tabs.map((t, i) =>
        <button type="button" key={t.name} className={`tab go-ava dot ${t.kind}${i === tab ? " on is-hotspot" : ""}`} onClick={next}>
          {t.kind === "mcd" ? "M" : t.kind === "turbo" ? "T" : t.kind === "dec" ? "DEC" : t.kind === "pb" ? "P&B" : "MG"}
          {i === 0 && <HotNum n={1} />}
        </button>)}
    </div>
    <div style={{ padding: "8px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <b style={{ fontSize: 16 }}>{active.name}</b>
      <span style={{ display: "flex", gap: 8 }}>
        <button type="button" className="go-round" aria-label="Compartir"><Share size={16} /></button>
        <button type="button" className="go-chip is-hotspot" onClick={next} style={{ height: 32 }}>Ayuda<HotNum n={3} /></button>
      </span>
    </div>
    {map && <div className="go-map-full is-hotspot" onClick={next}><img src={MAP} alt="" /><HotNum n={1} /></div>}
    <div className="go-create" style={{ paddingTop: 12 }}>
      <h1>Pedido creado</h1>
      <p className="eta">Entrega estimada: <b>12:35 pm</b></p>
      <div className="go-track">
        <i className="on">✓</i><b className="on" /><i>🛒</i><em /><i>🛵</i><em /><i>🏠</i>
      </div>
      <p className="go-late">Llega a más tardar a las <b>1:05 pm</b> <Info size={14} /></p>
      <button type="button" className="go-protect is-hotspot" onClick={next}>
        <span>Protege tu pedido<small>Comparte tu código al recibirlo</small></span>
        <em className="code">{code ? "123" : "123"}</em>
        <ChevronRight size={16} /><HotNum n={2} />
      </button>
      <div className="go-prod-list">
        <h3>Tus productos <ChevronRight size={16} /></h3>
        <div className="go-line" style={{ paddingLeft: 0, paddingRight: 0 }}>
          {block?.lines[0]?.img
            ? <img className="go-thumb" src={block.lines[0].img} alt="" />
            : <div className="go-sku">{block?.lines[0]?.emoji ?? "🧥"}</div>}
          <div className="info"><div className="name">{block?.lines[0]?.name}</div></div>
        </div>
        <button type="button" className="go-cta ghost full" style={{ marginTop: 8 }}>Editar pedido</button>
      </div>
      <div className="go-row" style={{ border: 0 }}><div><small style={{ color: "#919aaa" }}>Detalles de la entrega</small><b>Dejar en la portería en Carrera 11 #82-01 Apto 103</b></div></div>
      <div className="go-chips-h"><span>Cambiar dirección</span><span>Editar detalles</span><span>Editar instrucciones</span></div>
      <div className="go-row"><Ava kind={active.kind} /><div><small style={{ color: "#919aaa" }}>Resumen del pedido</small><b>${block?.sub || storesFor(cat).total}</b></div><ChevronRight size={18} style={{ marginLeft: "auto" }} /></div>
    </div>
    {tooltip && <div className="go-tip is-hotspot" onClick={next}>Esta entrega es solo de {active.name}. Las otras siguen en su tab.<HotNum n={1} /></div>}
    </div>
    {sheet && <>
      <button type="button" className="go-dim is-hotspot" onClick={next} aria-label="Overlay"><HotNum n={1} /></button>
      <div className="go-sheet" style={{ textAlign: "center" }}>
        <div className="grab" />
        <h2>Código de entrega</h2>
        <p className="sub">Compártelo con el Rappitendero de {active.name}.</p>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 8, margin: "12px 0 20px" }}>1 2 3</div>
        <button type="button" className="go-cta full is-hotspot" onClick={next}>Entendido<HotNum n={2} /></button>
      </div>
    </>}
  </div>;
}

function GoHome({ cat, widget, next }: { cat: GoCatalog; widget: boolean; next: () => void }) {
  const n = storesFor(cat).blocks.length;
  return <div className="go-screen" style={{ background: "#f7f8f9" }}>
    <StatusBar />
    <div className="go-nav"><b>Calle 82 #11</b></div>
    <button type="button" className="go-home-search is-hotspot" onClick={next}><Search size={16} /> ¿Qué quieres hoy?<HotNum n={2} /></button>
    {widget && <button type="button" className="go-widget is-hotspot" onClick={next}>
      <small>Pedido en curso · {n} entregas</small>
      <b>Llega desde las 12:35 pm</b>
      <div className="row">{storesFor(cat).blocks.map(b => <span key={b.name}><b style={{ fontSize: 11 }}>{b.name.split("·")[0]}</b><br />{b.eta}</span>)}</div>
      <HotNum n={1} />
    </button>}
    <div className="go-cats">
      <button type="button" className="go-cat"><b>Restaurantes</b><small>15 min</small></button>
      <button type="button" className="go-cat"><b>Turbo</b><small>10 min</small></button>
      <button type="button" className="go-cat"><b>Supermercado</b><small>20 min</small></button>
      <button type="button" className="go-cat"><b>Farmacia</b><small>20 min</small></button>
    </div>
  </div>;
}

function GoFees({ cat, tips, next }: { cat: GoCatalog; tips: boolean; next: () => void }) {
  const data = storesFor(cat);
  return <div className="go-screen">
    <StatusBar />
    <div className="go-nav">
      <button type="button" className="go-x is-hotspot" onClick={next} aria-label="Atrás"><ChevronLeft size={18} /><HotNum n={1} /></button>
      <b>{tips ? "Propina" : "Resumen"}</b>
    </div>
    <div className="go-fee">
      <h1>{tips ? "¿Cuánto quieres dejar?" : "Desglose del pedido"}</h1>
      {tips && <p style={{ fontSize: 12, color: "#919aaa", marginTop: -8 }}>Una propina por cada Rappitendero.</p>}
      {data.blocks.map(b => <div key={b.name} style={{ marginTop: 16 }}>
        <div className="go-store-h" style={{ padding: "8px 0", border: 0 }}><Ava kind={b.kind} src={b.src} /><div className="meta"><b>{b.name}</b><small>{b.eta}</small></div></div>
        {tips
          ? <div className="go-tips">
              {["$0", "$2.000", "$4.000", "Otro"].map((x, i) =>
                <button type="button" key={x} className={i === 1 ? "on is-hotspot" : ""} onClick={next}>{x}{i === 1 && <HotNum n={2} />}</button>)}
            </div>
          : <>
              <div className="r"><span>Productos</span><span>${b.sub || "—"}</span></div>
              <div className="r"><span>Envío</span><span>$0</span></div>
              <div className="r"><span>Servicio</span><span>$1.900</span></div>
            </>}
      </div>)}
      <div className="r tot"><span>Total</span><span>${data.total}</span></div>
    </div>
    <div className="go-dock"><GreenCta n={tips ? 2 : 1} onClick={next}>{tips ? "Confirmar propinas" : "Listo"}</GreenCta></div>
  </div>;
}

const SEARCH_CARDS = [
  { brand: "Pampers", cls: "pam", price: "13.500", offer: "−10%", was: "$15.000", eta: "10 min", ad: true },
  { brand: "Pampers XG", cls: "pam", price: "22.400", offer: "−30%", was: "$32.000", eta: "10 min", ad: true },
  { brand: "Pampers", cls: "pam", price: "20.000", offer: "−20%", was: "$25.000", eta: "10 min" },
  { brand: "Winny", cls: "win", price: "22.900", eta: "20 min", slow: true },
  { brand: "Pampers", cls: "pam", price: "31.500", eta: "10 min" },
  { brand: "Huggies", cls: "hug", price: "18.000", offer: "−20%", was: "$20.000", eta: "20 min", slow: true },
  { brand: "Huggies", cls: "hug", price: "24.000", eta: "20 min", slow: true },
  { brand: "Babysec", cls: "pam", price: "16.800", eta: "10 min" },
];

function GoSearch({ cartQty, next }: { cartQty: number; next: () => void }) {
  return <div className="go-screen">
    <StatusBar />
    <div className="go-search-bar">
      <button type="button" className="go-x is-hotspot" onClick={next} aria-label="Atrás"><ChevronLeft size={16} /><HotNum n={1} /></button>
      <span>Pañales etapa 6</span>
      <button type="button" className="go-x" aria-label="Limpiar"><X size={14} /></button>
    </div>
    <div className="go-sg">{SEARCH_CARDS.map((c, i) =>
      <div className="go-sc" key={c.brand + i}>
        {c.ad && <span className="ad">Ad</span>}
        <div className={`ph ${c.cls}`}>{c.brand}<br />etapa 6</div>
        <button type="button" className={`plus${i === 0 ? " is-hotspot" : ""}`} onClick={next} aria-label="Agregar">
          <img src={PLUS} alt="" width={32} height={32} />{i === 0 && <HotNum n={2} />}
        </button>
        <div className={`eta${c.slow ? " slow" : ""}`}>{c.slow ? <Clock3 size={12} /> : <Zap size={12} />} {c.eta}</div>
        <div className="pr">${c.price}</div>
        {c.offer && <div><span className="go-offer">{c.offer}</span><span className="go-was">{c.was}</span></div>}
        <p>Este es un nombre de producto muy largo para que ocupe más de 2 lineas</p>
        <div className="ml">1 x 330 ml · $54,5/ml</div>
      </div>)}
    </div>
    {cartQty > 0 && <button type="button" className="go-fab is-hotspot" onClick={next}>
      <span>{cartQty} prod.</span><b>$65.300</b><HotNum n={3} />
    </button>}
  </div>;
}

function GoTurbo({ cartQty, pasillos, next }: { cartQty: number; pasillos: boolean; next: () => void }) {
  return <div className="go-screen go-turbo">
    <StatusBar light />
    <div className="go-turbo-h">
      <button type="button" className="go-round is-hotspot" onClick={next} aria-label="Atrás"><ChevronLeft size={18} /><HotNum n={1} /></button>
      <h1>Turbo</h1>
    </div>
    <div className="go-aisles">
      {["Destacados", "Frutas", "Lácteos", "Snacks", "Bebidas", "Limpieza"].map((a, i) =>
        <button type="button" key={a} className={i === (pasillos ? 1 : 0) ? "on is-hotspot" : ""} onClick={next}>{a}{i === 1 && <HotNum n={2} />}</button>)}
    </div>
    <div className="go-grid" style={{ paddingBottom: 90 }}>
      {[{ e: "🍎", n: "Manzana Royal", p: "2.000" }, { e: "🍌", n: "Banano", p: "1.800" }, { e: "🥛", n: "Leche Alpina", p: "7.800" }, { e: "☕", n: "Café Colcafé", p: "3.500" }, { e: "🍪", n: "Torta Gala", p: "1.650" }, { e: "🍺", n: "Bud Light", p: "4.500" }].map((p, i) =>
        <div className="go-prod" key={p.n}>
          <div className="img" style={{ display: "grid", placeItems: "center", fontSize: 48 }}>{p.e}</div>
          <button type="button" className={`plus${i === 0 ? " is-hotspot" : ""}`} onClick={next} aria-label="Agregar"><img src={PLUS} alt="" />{i === 0 && cartQty === 0 && <HotNum n={2} />}</button>
          <b>${p.p}</b><p>{p.n}</p>
        </div>)}
    </div>
    {cartQty > 0 && <button type="button" className="go-fab is-hotspot" onClick={next}>
      <span>{cartQty} prod.</span><b>$61.700</b><HotNum n={3} />
    </button>}
  </div>;
}

function GoRetail({ cartQty, next }: { cartQty: number; next: () => void }) {
  return <div className="go-screen">
    <StatusBar />
    <div className="go-ret-hero">
      <button type="button" className="go-round is-hotspot" onClick={next} aria-label="Atrás" style={{ position: "absolute", left: 24, top: 56 }}><ChevronLeft size={18} /><HotNum n={1} /></button>
      <b>DECATHLON</b>
    </div>
    <div className="go-storename"><Ava kind="dec" /><b>Decathlon</b></div>
    <div className="go-info">
      <div><small>Entrega</small><b>25 min</b></div>
      <div><small>Envío</small><b>Gratis</b></div>
      <div><small>Pedido mín.</small><b>$40.000</b></div>
    </div>
    <div className="go-tabs">
      <button type="button" className="on">Novedades</button>
      <button type="button">Hombre</button>
      <button type="button">Mujer</button>
      <button type="button">Running</button>
    </div>
    <div className="go-grid">
      {[{ e: "🧥", n: "Buzo polar", p: "85.500" }, { e: "👟", n: "Tenis running", p: "199.000" }, { e: "🎒", n: "Morral 20L", p: "79.000" }, { e: "🧢", n: "Gorra dry", p: "45.000" }].map((p, i) =>
        <div className="go-prod" key={p.n}>
          <div className="img" style={{ display: "grid", placeItems: "center", fontSize: 56, background: "#e8f3fb" }}>{p.e}</div>
          <button type="button" className={`plus${i === 0 ? " is-hotspot" : ""}`} onClick={next} aria-label="Agregar"><img src={PLUS} alt="" />{i === 0 && <HotNum n={2} />}</button>
          <b>${p.p}</b><p>{p.n}</p>
        </div>)}
    </div>
    {cartQty > 0 && <button type="button" className="go-fab is-hotspot" onClick={next}><span>{cartQty} prod.</span><b>$538.500</b><HotNum n={3} /></button>}
  </div>;
}

function GoCanastas({ empty, next }: { empty?: boolean; next: () => void }) {
  return <div className="go-screen">
    <StatusBar />
    <div className="go-nav">
      <button type="button" className="go-x is-hotspot" onClick={next} aria-label="Cerrar"><X size={16} /><HotNum n={1} /></button>
      <b>Tus canastas</b>
    </div>
    <div className="go-chips">
      {["Todas", "Restaurantes", "Mercado", "Turbo"].map((c, i) =>
        <button type="button" key={c} className={i === 0 ? "on is-hotspot" : ""} onClick={next}>{c}{i === 1 && <HotNum n={2} />}</button>)}
    </div>
    {empty
      ? <div className="go-empty"><b>No hay canastas guardadas</b>Los grupos de varias tiendas aparecen aquí.</div>
      : <>
          <div className="go-bag">
            <div className="go-save">Estás ahorrando $133.500</div>
            <div className="go-store-h" style={{ padding: 0, border: 0 }}>
              <div style={{ display: "flex" }}>
                <Ava kind="mango" /><Ava kind="pb" /><Ava kind="dec" />
              </div>
              <div className="meta"><b>3 tiendas</b><small>3 entregas · $538.500</small></div>
            </div>
            <div className="go-thumbs">
              {["🧥", "👖", "🧥", "🧢"].map((e, i) => <div className="t" key={i}>{e}<em>1</em></div>)}
              <div className="t" style={{ background: "#111", color: "#fff", fontSize: 12 }}>+2</div>
            </div>
            <button type="button" className="go-cta full is-hotspot" onClick={next}>Ver canasta<HotNum n={2} /></button>
          </div>
          <div className="go-bag">
            <div className="go-store-h" style={{ padding: 0, border: 0 }}>
              <Ava kind="chef" />
              <div className="meta"><b>Chef Burger</b><small>40 min · $120.000</small></div>
              <button type="button" className="go-x" aria-label="Vaciar"><Trash2 size={14} /></button>
            </div>
            <div className="go-thumbs">{["🍔", "🍟", "🥤"].map((e, i) => <div className="t" key={i}>{e}<em>1</em></div>)}</div>
            <div className="go-bag-cta">
              <button type="button" className="go-cta ghost" style={{ flex: 1 }}>Ir a tienda</button>
              <button type="button" className="go-cta is-hotspot" style={{ flex: 1 }} onClick={next}>Ver canasta<HotNum n={2} /></button>
            </div>
          </div>
          <button type="button" className="go-cta ghost" style={{ margin: "8px 16px", width: "calc(100% - 32px)" }}>Vaciar todas las canastas</button>
        </>}
  </div>;
}

function GoPdp({ next }: { next: () => void }) {
  return <div className="go-screen">
    <StatusBar />
    <div className="go-nav"><b>Fichas de producto</b></div>
    <div className="go-grid">{[
      { e: "🍎", n: "Manzana Royal", p: "2.000" }, { e: "🥛", n: "Leche Alpina", p: "7.800" },
      { e: "☕", n: "Café Colcafé", p: "3.500" }, { e: "🍪", n: "Torta Gala", p: "1.650" },
      { e: "🍔", n: "Hamburguesa Zenú", p: "18.900" }, { e: "🍺", n: "Bud Light", p: "4.500" },
    ].map((p, i) =>
      <div className="go-prod" key={p.n}>
        <div className="img" style={{ display: "grid", placeItems: "center", fontSize: 48 }}>{p.e}</div>
        <button type="button" className={`plus${i === 0 ? " is-hotspot" : ""}`} onClick={next} aria-label="Agregar"><img src={PLUS} alt="" />{i === 0 && <HotNum n={1} />}</button>
        <b>${p.p}</b><p>{p.n}</p>
      </div>)}
    </div>
  </div>;
}

function catOf(props: GoResolved["props"]): GoCatalog {
  const c = String(props.catalog ?? "rest-turbo");
  if (c === "turbo-turbo" || c === "search-retail" || c === "retail") return c;
  return "rest-turbo";
}

export function renderGoScreen(resolved: GoResolved, next: () => void) {
  const p = resolved.props;
  const cat = catOf(p);
  switch (resolved.kind) {
    case "cover": return <GoCover kicker={String(p.kicker)} title={String(p.title)} body={String(p.body)} />;
    case "store": return <GoStore cartQty={Number(p.cartQty) || 0} next={next} />;
    case "sheet": return <GoStore cartQty={Number(p.cartQty) || 2} next={next} sheet={String(p.sheet || "complements")} />;
    case "cart": return <GoCart cat={cat} next={next} tall={!!p.tall} />;
    case "checkout": return <GoCheckout cat={cat} phase={String(p.phase || "eta")} next={next} />;
    case "creating": return <GoCreating cat={cat} done={!!p.done} next={next} />;
    case "home": return <GoHome cat={cat} widget={p.widget !== false} next={next} />;
    case "tracking": return <GoTracking cat={cat} tab={Number(p.tab) || 0} tooltip={!!p.tooltip} map={!!p.map} sheet={!!p.sheet} code={!!p.code} next={next} />;
    case "fees": return <GoFees cat={cat} tips={!!p.tips} next={next} />;
    case "search": return <GoSearch cartQty={Number(p.cartQty) || 0} next={next} />;
    case "turbo": return <GoTurbo cartQty={Number(p.cartQty) || 0} pasillos={!!p.pasillos} next={next} />;
    case "retail": return <GoRetail cartQty={Number(p.cartQty) || 0} next={next} />;
    case "canastas": return <GoCanastas empty={!!p.empty} next={next} />;
    case "pdp": return <GoPdp next={next} />;
  }
}
