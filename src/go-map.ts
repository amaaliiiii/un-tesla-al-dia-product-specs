import type { GroupOrderFlow, GroupOrderScreen } from "./group-order-data";

export type GoKind =
  | "cover" | "store" | "sheet" | "cart" | "checkout"
  | "creating" | "home" | "tracking" | "fees"
  | "search" | "turbo" | "retail" | "canastas" | "pdp";

export type GoCatalog = "rest-turbo" | "turbo-turbo" | "search-retail" | "retail";

export type GoHotspot = { label: string; desc: string };
export type GoProps = Record<string, string | number | boolean>;

export type GoResolved = {
  kind: GoKind;
  panelTitle: string;
  note: string;
  hotspots: GoHotspot[];
  props: GoProps;
};

const BACK = "Vuelve al contexto anterior.";

const HS = {
  store: [
    { label: "Atrás", desc: BACK },
    { label: "Agregar", desc: "Suma el producto. El FAB de canasta aparece o actualiza el total." },
    { label: "Canasta", desc: "Abre la canasta agrupada con las tiendas de este pedido." },
  ],
  storeNoCart: [
    { label: "Atrás", desc: BACK },
    { label: "Agregar", desc: "Suma el primer producto y muestra el FAB de canasta." },
  ],
  sheet: [
    { label: "Overlay", desc: "Tap en el fondo cierra el sheet y vuelve a la tienda." },
    { label: "Agregar", desc: "Suma el complemento a la canasta de esa tienda." },
    { label: "Cerrar", desc: "Cierra el sheet sin agregar." },
  ],
  cart: [
    { label: "Cerrar", desc: "Vuelve a la tienda, Turbo o la búsqueda." },
    { label: "Stepper", desc: "Cambia la cantidad del ítem en esa tienda. El total agrupado se recalcula." },
    { label: "Continuar", desc: "Entra al checkout unificado (un pago, varias entregas)." },
  ],
  checkoutEta: [
    { label: "Atrás", desc: "Vuelve a la canasta." },
    { label: "ETA por tienda", desc: "Elige la ventana de cada entrega. No hay un solo ETA para el grupo." },
    { label: "Continuar", desc: "Pasa a dirección y pago." },
  ],
  checkout: [
    { label: "Atrás", desc: "Vuelve a la canasta o al selector de ETA." },
    { label: "Dirección", desc: "Misma dirección para todas las sub-órdenes." },
    { label: "Terminar y pagar", desc: "Un pago. Crea la orden padre y las sub-órdenes." },
  ],
  checkoutSheet: [
    { label: "Overlay", desc: "Cierra el sheet y deja el checkout detrás." },
    { label: "Opción", desc: "Confirma el slot de ETA o el método." },
  ],
  creating: [
    { label: "Pedido creado", desc: "La orden padre ya existe. Cada tienda sigue como sub-orden." },
  ],
  home: [
    { label: "Pedido en curso", desc: "Abre el tracking agrupado. Hay una card por entrega." },
    { label: "Buscar", desc: "Abre la búsqueda de Rappi." },
  ],
  tracking: [
    { label: "Tab de tienda", desc: "Cambia de sub-orden. El mapa y el estado son de esa entrega." },
    { label: "Código", desc: "Muestra el código de entrega de esa sub-orden." },
    { label: "Ayuda", desc: "Ayuda de esa sub-orden, no del grupo entero." },
  ],
  trackingTip: [
    { label: "Tooltip", desc: "Explica el estado o el ETA de esa sub-orden." },
    { label: "Tab de tienda", desc: "Cambia de sub-orden." },
  ],
  trackingMap: [
    { label: "Mapa", desc: "Sigue al Rappitendero de esa sub-orden." },
    { label: "Tab de tienda", desc: "Cambia de sub-orden y de mapa." },
  ],
  trackingSheet: [
    { label: "Overlay", desc: "Cierra el sheet de código o de detalle." },
    { label: "Código", desc: "Revela o comparte el código de esa entrega." },
  ],
  fees: [
    { label: "Atrás", desc: BACK },
    { label: "Tip", desc: "La propina es por Rappitendero / sub-orden, no un solo monto." },
  ],
  search: [
    { label: "Atrás", desc: BACK },
    { label: "Agregar", desc: "Suma el producto. El ETA del card es el de esa tienda." },
    { label: "Canasta", desc: "Abre la canasta con ítems de varias tiendas." },
  ],
  turbo: [
    { label: "Atrás", desc: BACK },
    { label: "Pasillo", desc: "Entra al pasillo. El stock puede venir de otra bodega." },
    { label: "Canasta", desc: "Abre la canasta Turbo agrupada." },
  ],
  retail: [
    { label: "Atrás", desc: BACK },
    { label: "Producto", desc: "Abre la ficha. Agregar suma a la canasta de esa marca." },
    { label: "Canasta", desc: "Abre la canasta retail (varias marcas, un total)." },
  ],
  canastas: [
    { label: "Cerrar", desc: BACK },
    { label: "Ver canasta", desc: "Abre el grupo de 3 tiendas o la canasta suelta." },
    { label: "Vaciar", desc: "Vacía todas las canastas guardadas." },
  ],
  pdp: [
    { label: "Agregar", desc: "Suma esa ficha. Puede ir a otra bodega Turbo." },
  ],
} satisfies Record<string, GoHotspot[]>;

const COVERS: Record<string, { title: string; body: string }> = {
  "1-1": { title: "Flujo 1: Restaurante + Turbo", body: "Pedido de verticales distintas en un carrito, un checkout y un pago." },
  "1-2": { title: "Store Detail + Modal", body: "McDonald’s y el sheet para complementar el pedido." },
  "1-13": { title: "Canasta", body: "McDonald’s + Turbo. Recibirás 2 entregas. Un total." },
  "1-21": { title: "Selector de ETA", body: "Un ETA por cada entrega, no uno solo para el grupo." },
  "1-25": { title: "Checkout", body: "Terminar y pagar. Una dirección, un pago, varias sub-órdenes." },
  "1-29": { title: "Order Creation", body: "Orden padre + sub-órdenes por tienda." },
  "1-32": { title: "Order Tracking", body: "Tabs por tienda. Cada entrega tiene su estado y su mapa." },
  "1-44": { title: "Tips", body: "Resumen de fees y propina por Rappitendero." },
  "2-1": { title: "Flujo 2: Turbo + Turbo", body: "Dos bodegas de la misma cadena cuando una no cubre el stock." },
  "2-2": { title: "Turbo / pasillos", body: "Navegar pasillos y fichas. El stock puede saltar de bodega." },
  "2-16": { title: "Canasta", body: "Entrega en 10 min y entrega en 20 min. Un CTA." },
  "2-21": { title: "Selector de ETA", body: "ETA por bodega." },
  "2-25": { title: "Checkout", body: "Checkout unificado Turbo + Turbo." },
  "2-28": { title: "Fees", body: "Resumen post-pedido con fees." },
  "2-30": { title: "Order Creation", body: "Orden padre con dos sub-órdenes Turbo." },
  "2-32": { title: "Order Tracking", body: "Tabs por bodega / entrega." },
  "3-1": { title: "Flujo 3: Turbo Search + Retailers", body: "Búsqueda con ETA por producto y canasta multi-tienda." },
  "3-2": { title: "Búsqueda", body: "Pañales. Cada card trae el ETA de su tienda." },
  "3-13": { title: "Canasta", body: "Ítems de búsqueda agrupados por tienda." },
  "3-20": { title: "Selector de ETA", body: "ETA por cada retailer / Turbo." },
  "3-24": { title: "Checkout", body: "Checkout unificado de la búsqueda." },
  "3-27": { title: "Pedido", body: "Confirmación y fees." },
  "3-30": { title: "Order Creation", body: "Orden padre de la búsqueda multi-tienda." },
  "3-32": { title: "Order Tracking", body: "Tabs por tienda del pedido de búsqueda." },
  "4-1": { title: "Flujo 4: Retail + Retail", body: "Decathlon + Pull & Bear + Mango. Tres entregas, un total." },
  "4-2": { title: "Browse retail", body: "Storefront de una marca. La canasta ya puede traer otras." },
  "4-9": { title: "Tus canastas", body: "Home de canastas: grupo de 3 tiendas + canasta suelta." },
  "4-12": { title: "Canasta", body: "Tres marcas retail. $538.500. Continuar." },
  "4-17": { title: "Selector de ETA", body: "ETA programado por marca." },
  "4-23": { title: "Checkout", body: "Terminar y pagar las tres entregas." },
  "4-29": { title: "Pedido", body: "Confirmación y fees." },
  "4-32": { title: "Order Creation", body: "Orden padre con tres sub-órdenes retail." },
  "4-34": { title: "Order Tracking", body: "Tabs Decathlon / Pull&Bear / Mango." },
};

function catalog(flow: number): GoCatalog {
  if (flow === 2) return "turbo-turbo";
  if (flow === 3) return "search-retail";
  if (flow === 4) return "retail";
  return "rest-turbo";
}

function cover(flow: number, n: number, screen: GroupOrderScreen): GoResolved {
  const c = COVERS[`${flow}-${n}`];
  return {
    kind: "cover",
    panelTitle: c?.title ?? screen.title,
    note: c?.body ?? "Corte de diseño (slides 2.0). No es una pantalla de app.",
    hotspots: [],
    props: { kicker: `Flujo ${flow}`, title: c?.title ?? screen.title, body: c?.body ?? screen.note },
  };
}

export function resolveGoScreen(flow: GroupOrderFlow, screen: GroupOrderScreen): GoResolved {
  const f = flow.figma;
  const n = screen.n;
  const t = screen.title;
  const cat = catalog(f);
  const base = { catalog: cat };

  if (t === "Cover") return cover(f, n, screen);

  if (t === "Fichas de producto") {
    return { kind: "pdp", panelTitle: "Fichas de producto", note: screen.note, hotspots: HS.pdp, props: { ...base } };
  }

  if (t === "Tus canastas" || t === "body") {
    return {
      kind: "canastas",
      panelTitle: "Tus canastas",
      note: t === "body" ? "Home de canastas (body del frame)." : screen.note,
      hotspots: HS.canastas,
      props: { ...base, empty: t === "body" },
    };
  }

  if (t === "Retail") {
    return { kind: "retail", panelTitle: "Decathlon", note: screen.note, hotspots: HS.retail, props: { ...base, cartQty: 0 } };
  }

  if (t.startsWith("Búsqueda")) {
    const qty = t.includes("canasta") ? Math.min(4, Math.max(1, n - 3)) : 0;
    return {
      kind: "search",
      panelTitle: qty ? "Búsqueda · canasta" : "Búsqueda",
      note: screen.note,
      hotspots: HS.search,
      props: { ...base, cartQty: qty },
    };
  }

  if (t.startsWith("Turbo")) {
    const qty = t.includes("canasta") ? Math.min(6, Math.max(1, n - 9)) : 0;
    return {
      kind: "turbo",
      panelTitle: t,
      note: screen.note,
      hotspots: HS.turbo,
      props: { ...base, cartQty: qty, pasillos: t.includes("pasillos") },
    };
  }

  if (t.startsWith("Tienda")) {
    const qty = t.includes("canasta") ? (f === 1 && n === 19 ? 4 : Math.min(3, n - 3)) : 0;
    return {
      kind: "store",
      panelTitle: qty ? "Tienda · canasta" : "McDonald’s",
      note: screen.note,
      hotspots: qty ? HS.store : HS.storeNoCart,
      props: { ...base, cartQty: Math.max(0, qty) },
    };
  }

  if (t === "Modal") {
    if (f === 2) {
      return { kind: "sheet", panelTitle: "Sheet Turbo", note: screen.note, hotspots: HS.sheet, props: { ...base, sheet: "turbo" } };
    }
    const sheets = ["complements", "complements", "added", "qty", "qty", "added"] as const;
    const sheet = sheets[Math.min(n - 7, sheets.length - 1)] ?? "complements";
    return { kind: "sheet", panelTitle: "Complementa tu pedido", note: screen.note, hotspots: HS.sheet, props: { ...base, sheet, cartQty: 2 } };
  }

  if (t === "Sheet") {
    return { kind: "checkout", panelTitle: "Checkout · sheet", note: screen.note, hotspots: HS.checkoutSheet, props: { ...base, phase: "sheet" } };
  }

  if (t.startsWith("Canasta")) {
    return {
      kind: "cart",
      panelTitle: "Canasta",
      note: screen.note,
      hotspots: HS.cart,
      props: { ...base, tall: screen.height > 900, overlay: n % 5 === 0 ? "coupon" : "" },
    };
  }

  if (t.startsWith("Checkout")) {
    const modal = t.includes("modal");
    const unified = screen.note.includes("unificado") || screen.height > 900;
    const phase = modal ? "eta-sheet" : unified ? "pay" : "eta";
    return {
      kind: "checkout",
      panelTitle: modal ? "Checkout · modal" : unified ? "Terminar y pagar" : "Selector de ETA",
      note: screen.note,
      hotspots: modal ? HS.checkoutSheet : unified ? HS.checkout : HS.checkoutEta,
      props: { ...base, phase, tall: unified },
    };
  }

  if (t === "Pedido creado") {
    return {
      kind: "creating",
      panelTitle: n % 2 === 0 ? "Creando pedido" : "Pedido creado",
      note: screen.note,
      hotspots: HS.creating,
      props: { ...base, done: n % 2 === 1 },
    };
  }

  if (t === "Home") {
    return { kind: "home", panelTitle: "Home Rappi", note: screen.note, hotspots: HS.home, props: { ...base, widget: n !== 33 } };
  }

  if (t.startsWith("Tracking")) {
    const sheet = t.includes("modal");
    const tooltip = t.includes("tooltip");
    const map = t.includes("mapa");
    return {
      kind: "tracking",
      panelTitle: t,
      note: screen.note,
      hotspots: sheet ? HS.trackingSheet : tooltip ? HS.trackingTip : map ? HS.trackingMap : HS.tracking,
      props: { ...base, tab: map ? 1 : 0, tooltip, map, sheet, code: sheet && n >= 42 },
    };
  }

  if (t === "Resumen de fees" || t === "Pedido") {
    return {
      kind: "fees",
      panelTitle: t === "Resumen de fees" ? "Resumen de fees" : "Pedido",
      note: screen.note,
      hotspots: HS.fees,
      props: { ...base, tips: t !== "Resumen de fees" },
    };
  }

  if (t === "all") {
    if (f === 2) {
      return {
        kind: "turbo",
        panelTitle: n === 4 ? "Turbo · pasillos" : "Turbo · canasta",
        note: "Frame largo de Turbo (all).",
        hotspots: HS.turbo,
        props: { ...base, cartQty: n === 8 ? 3 : 0, pasillos: true, tall: true },
      };
    }
    return {
      kind: "search",
      panelTitle: "Búsqueda · canasta",
      note: "Frame all de búsqueda.",
      hotspots: HS.search,
      props: { ...base, cartQty: 3 },
    };
  }

  return {
    kind: "cover",
    panelTitle: screen.title,
    note: screen.note,
    hotspots: [],
    props: { kicker: `Flujo ${f}`, title: screen.title, body: screen.note },
  };
}
