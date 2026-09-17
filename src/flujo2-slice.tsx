import React from "react";
import { Search, X } from "lucide-react";
import "./flujo2-slice.css";

const F2 = "assets/group-order/flujo2";
const a = (hash: string, ext = "png") => `${F2}/${hash}.${ext}`;

export const FLUJO2_SLICE = [
  "297:84565",
  "297:84354",
  "297:84219",
  "259:77075",
  "297:89649",
  "272:59663",
  "299:90348",
  "300:90667",
] as const;

export function isFlujo2Slice(nodeId: string) {
  return (FLUJO2_SLICE as readonly string[]).includes(nodeId);
}

export const SLICE_HOTSPOTS: Record<string, { label: string; desc: string }[]> = {
  "297:84565": [
    { label: "Entendido", desc: "Cierra el sheet y abre el home Turbo (297:84354)." },
  ],
  "297:84354": [
    { label: "Atrás", desc: "Vuelve al sheet Turbo más completo (297:84565)." },
    { label: "Fruver", desc: "Frutas de temporada y Verduras del día abren el pasillo (297:84219)." },
    { label: "Agregar", desc: "Suma el SKU y abre la canasta de dos bodegas (259:77075)." },
  ],
  "297:84219": [
    { label: "Atrás", desc: "Vuelve al home Turbo (297:84354)." },
    { label: "Agregar", desc: "Suma el producto y abre la canasta (259:77075)." },
  ],
  "259:77075": [
    { label: "Cerrar", desc: "Vuelve al pasillo Frutas y verduras (297:84219)." },
    { label: "Continuar", desc: "Entra al selector de ETA por entrega (297:89649)." },
  ],
  "297:89649": [
    { label: "Atrás", desc: "Vuelve a la canasta (259:77075)." },
    { label: "Continuar", desc: "Pasa a Terminar y pagar (272:59663)." },
  ],
  "272:59663": [
    { label: "Atrás", desc: "Vuelve al selector de ETA (297:89649)." },
    { label: "Continuar", desc: "Abre la propina por entrega (299:90348)." },
  ],
  "299:90348": [
    { label: "Atrás", desc: "Vuelve a Terminar y pagar (272:59663)." },
    { label: "Hacer Pedido", desc: "Crea la orden padre (300:90667)." },
  ],
  "300:90667": [
    { label: "Deshacer pedido", desc: "Cancela y vuelve al checkout (272:59663)." },
  ],
};

function HotNum({ n }: { n: number }) {
  return <span className="hot-badge" aria-hidden="true">{n}</span>;
}

function StatusBar({ light = false }: { light?: boolean }) {
  return <div className={`f2-status${light ? " light" : ""}`}><b>9:41</b><div className="island" /><div className="signal">▮▮▮ ᯤ ▰</div></div>;
}

const PLUS = a("ba07eb4640dc8dbb45d0f2fc960cd916c2af7d4f", "svg");
const HEART = a("29f4a65a6779c15c1ef3616977e2baec768aa784", "svg");
const TURBO_AVA = a("d3058518e8078a24d57af732a25d209b6b6cde26");
const ARROW = a("0ad042010f5593a20a384118bb079925b01bc1be", "svg");
const CHECK = a("95fb3b6b11b60c8a9a4022296b8492d53ed4cee2", "svg");
const RADIO = a("0cdb951fd0651e945c2e8cfed0b56379ce9475f9", "svg");
const TURBO_WORD_SM = a("8b4a2363b7c52fc37d16e2e2391ab0664fdc0992", "svg");
const MINUS_I = a("4c8913f420318bd8ef31fc4ee934b3922106780b", "svg");
const PLUS_I = a("c0468a23ecc002b1475a4eb43b6e46130ae2572f", "svg");
const TRASH = a("8b8c90df985cc8fd9a4b3157c70b166ef4b048f7", "svg");
const CHEV = a("e0262e42224b33f99629b9d72db9c3436ac3c01d", "svg");

function Intro({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2 f2-intro">
    <div className="f2-intro-dim"><StatusBar light /><i className="f2-grab" /></div>
    <div className="f2-intro-hero">
      <img className="bag" src={a("b60f0f9feeabd6c0d83fdc08e182e3669588feaf")} alt="" />
      <span className="f2-nuevo">¡NUEVO!</span>
      <img className="word" src={a("7b5e240c062bc7877dcbb5a7ca7c9051c5a3cbec", "svg")} alt="Turbo" />
      <p className="sub">Ahora mucho</p>
      <div className="f2-bar-title">más completo</div>
      <p className="copy">Frutas, lácteos, bebidas, despensa<br />y más, todo sin salir de la app.</p>
    </div>
    <div className="f2-intro-body">
      <p className="lead">Los productos pueden llegar de<br /><b>tiendas diferentes</b></p>
      <div className="f2-pcards">
        <div className="f2-pcard">
          <img src={a("1a9a9d0f114ab01998aec395c385c45fa4470a13")} alt="" />
          <span className="f2-eta-tag fast">⚡ 10 min</span>
        </div>
        <div className="f2-pcard">
          <img src={a("b048bdea03a64743d5704c60e7b1993c75b9aed4")} alt="" />
          <span className="f2-eta-tag slow">⏱ 20 min</span>
        </div>
      </div>
      <p className="f2-intro-hint">Encuentra el tiempo de entrega en cada producto</p>
      <button type="button" className="f2-cta ghost lg full is-hotspot" onClick={() => goTo("297:84354")}>
        Entendido<HotNum n={1} />
      </button>
    </div>
  </div>;
}

const CATS = [
  { img: a("8dd939581442ba3324dc0c64ea41a63271f36293"), name: "Frutas de temporada", fruver: true },
  { img: a("3f5f013f56cbe21dad4b1ae1b62a2405197e1095"), name: "Verduras del día", fruver: true },
  { img: a("6c519ab29864ea3f99ff58551e86cb363a6af69d"), name: "Huevos & lácteos" },
  { img: a("4e14b6c68e385b2722c71b65a33c5fe0a14412ef"), name: "Panadería" },
  { img: a("5621835b6fb32b25bb0a6f9eccb2543a111fad9e"), name: "Helados" },
];

const FAVS = [
  { img: a("d80e32fc76990c4521c4a02fc6c445ea9e0b0175"), eta: "10 min", fast: true, price: "18.000" },
  { img: a("21576f158d59035488d8e61eb7b9fabe7e117b40"), eta: "20 min", price: "18.000", organic: true },
  { img: a("512d6174f16942d6c4653b7d044c117fa0c2a11e"), eta: "10 min", fast: true, price: "18.000", offer: "−20%", was: "$20.000" },
];

const PLAZA = [
  { img: a("c53ebd96a6d22d93fd8f5f72a40051ffb4fb7f1d"), eta: "20 min", price: "18.000", offer: "−20%", was: "$20.000" },
  { img: a("d481ebf2565721347d8c3e6993a8fff5d2fbc0c6"), eta: "10 min", fast: true, price: "18.000" },
  { img: a("a862b986bb076f3795fcb7ca7ceee746af00e0d7"), eta: "20 min", price: "18.000" },
];

function ProdCard({
  img, eta, fast, price, offer, was, organic, small, hot, onAdd,
}: {
  img: string; eta: string; fast?: boolean; price: string; offer?: string; was?: string;
  organic?: boolean; small?: boolean; hot?: boolean; onAdd: () => void;
}) {
  return <div className={`f2-prod${small ? " sm" : ""}`}>
    <div style={{ position: "relative" }}>
      <img className="pic" src={img} alt="" />
      {organic && <span className="f2-org">Orgánico</span>}
      <img className="f2-heart" src={HEART} alt="" />
    </div>
    <button type="button" className={`f2-plus${hot ? " is-hotspot" : ""}`} onClick={onAdd} aria-label="Agregar">
      <img src={PLUS} alt="" />{hot && <HotNum n={3} />}
    </button>
    <div className="meta">
      <span className={`f2-eta-tag${fast ? " fast" : " slow"}`} style={{ height: 16, fontSize: 10 }}>{fast ? "⚡" : "⏱"} {eta}</span>
      <div>
        <span className={`f2-price${small ? " sm" : ""}`}><i>$</i>{price}</span>
        {offer && <><span className="f2-offer">{offer}</span><span className="f2-was">{was}</span></>}
      </div>
      <p className="f2-pname">Este es un nombre de producto muy extenso</p>
      <span className="f2-unit">1 x 330 ml</span>
      <span className="f2-pum">$54,5/ml</span>
    </div>
  </div>;
}

function TurboHome({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <div className="f2-turbo-h">
      <StatusBar light />
      <div className="row">
        <button type="button" className="f2-round white is-hotspot" onClick={() => goTo("297:84565")} aria-label="Atrás">
          <img src={ARROW} alt="" width={24} height={24} /><HotNum n={1} />
        </button>
        <div className="brand">
          <img src={a("350603dea0c61241287ba97bcbd15c5006e2c14d", "svg")} alt="Turbo" />
          <img src={a("3a17fd3e55317d941382d24c4cb1b88cc134cd37", "svg")} alt="Selecto" height={18} />
        </div>
        <button type="button" className="f2-round white" aria-label="Más">···</button>
      </div>
      <div className="f2-eta-pill">
        <img src={a("75e9499f96e6ef009404a3ecf411d9518c084204", "svg")} alt="" width={18} height={18} />
        Entrega en <b>8 min</b>
      </div>
      <button type="button" className="f2-search">
        <img src={a("75ec3dfb6d5e1446dc7c6c5b6eb6282a5a67ffdf", "svg")} alt="" width={24} height={24} />
        Buscar en los 8.000+ productos
      </button>
      <div className="f2-mundos">
        {[
          [a("7809713d72e4651b13fa54cdd577793bb60b55b6", "svg"), "Todo", true],
          [a("3361670e220ff37d60fdb91baf2f9f767f3ea680", "svg"), "Mañanas", false],
          [a("a606ce198c0b57f75a6c474e6be779e9bf11dd3d", "svg"), "Antojo", false],
          [a("da9cdbf0862beac7cd305305e06dd6a9175c8053", "svg"), "Súper", false],
          [a("fb572c6b5a16d06f166bd2545ceadf41a6dc2fd7", "svg"), "Home pro", false],
        ].map(([src, label, on]) =>
          <button type="button" className={`f2-mundo${on ? " on" : ""}`} key={String(label)}>
            <img src={String(src)} alt="" /><span>{label}</span>
          </button>)}
      </div>
    </div>
    <div className="f2-scroll">
      <div className="f2-hero-fresh">
        <img src={a("116d8a3fbc304c1d8a3eb76e38af449b44b20639")} alt="" />
        <div className="copy">ULTRA FRESCO<br /><em>en minutos</em></div>
      </div>
      <div className="f2-offers">
        <div className="f2-off dark"><b>50% Cashback</b><small>Mín: $20.000</small><div className="bar"><i /></div></div>
        <div className="f2-off pro"><b>Envío gratis Pro</b><small>Mín: $10.000</small><div className="bar"><i /></div></div>
      </div>
      <div className="f2-cats">
        {CATS.map((c, i) =>
          <button
            type="button"
            className={`f2-cat${c.fruver ? " is-hotspot" : ""}`}
            key={c.name}
            onClick={() => c.fruver && goTo("297:84219")}
          >
            <img src={c.img} alt="" /><span>{c.name}</span>
            {c.fruver && i === 0 && <HotNum n={2} />}
          </button>)}
      </div>
      <button type="button" className="f2-all-cats">Ver todas las categorías</button>
      <div className="f2-sec-h"><b>Tus Favoritos</b><button type="button">Ver más</button></div>
      <div className="f2-row">
        {FAVS.map((p, i) => <ProdCard key={p.img} {...p} hot={i === 0} onAdd={() => goTo("259:77075")} />)}
      </div>
      <div className="f2-sec-h"><b>Martes de plaza</b><button type="button">Ver más</button></div>
      <div className="f2-row" style={{ paddingBottom: 32 }}>
        {PLAZA.map(p => <ProdCard key={p.img} {...p} onAdd={() => goTo("259:77075")} />)}
      </div>
    </div>
  </div>;
}

const AISLES = [
  { img: a("8dd939581442ba3324dc0c64ea41a63271f36293"), name: "Frutas", on: true },
  { img: a("3f5f013f56cbe21dad4b1ae1b62a2405197e1095"), name: "Verduras" },
  { img: a("4d323a474441e80561529952a93a9fe8a61daa0b"), name: "Hierbas" },
  { img: a("3ec1aab58adc2e1db9d080f127d2e39068fee499"), name: "Papas" },
  { img: a("e707a88a0278490dbe14b404a40fa2dbb8d8de1e"), name: "Frutas congelada" },
  { img: a("5e47095394bad884ba0d6944c6705651d4dc6966"), name: "Verduras congeladas" },
];

const FRUTAS = [
  { img: a("85601dafe2ffb2957202045e3df8b3940e4e3d89"), eta: "10 min", fast: true, offer: "−20%", was: "$20.000", organic: true, ad: true },
  { img: a("803899083959c6ab1060904ee8528f14110174a3"), eta: "20 min" },
  { img: a("2bee1a07286396234e98e6465271602da513b70a"), eta: "10 min", fast: true },
];
const VERDURAS = [
  { img: a("b9f4ef29c4432fc9586830fee6b84501d0fa99d2"), eta: "20 min", ad: true },
  { img: a("3bf42dd18ab34e84af96cb7cad4211a2292728f8"), eta: "10 min", fast: true },
  { img: a("d973a45ed962fd0e68415e2b996be00e63b5ed59"), eta: "10 min", fast: true },
];

function Aisle({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <StatusBar />
    <div className="f2-nav">
      <button type="button" className="f2-round is-hotspot" onClick={() => goTo("297:84354")} aria-label="Atrás">
        <img src={ARROW} alt="" width={24} height={24} /><HotNum n={1} />
      </button>
      <b>Frutas y verduras</b>
      <button type="button" className="f2-round search" aria-label="Buscar"><Search size={18} /></button>
    </div>
    <div className="f2-aisle">
      <nav className="f2-side">
        {AISLES.map(x =>
          <button type="button" className={`f2-side-item${x.on ? " on" : ""}`} key={x.name}>
            <img src={x.img} alt="" />{x.name}
          </button>)}
      </nav>
      <div className="f2-aisle-main">
        <div className="f2-sec-h"><b>Frutas</b><button type="button">Ver todos</button></div>
        <div className="f2-row">
          {FRUTAS.map((p, i) =>
            <ProdCard key={p.img} {...p} price="18.000" small hot={i === 0} onAdd={() => goTo("259:77075")} />)}
        </div>
        <div className="f2-sec-h"><b>Verduras</b><button type="button">Ver todos</button></div>
        <div className="f2-row">
          {VERDURAS.map(p =>
            <ProdCard key={p.img} {...p} price="18.000" small onAdd={() => goTo("259:77075")} />)}
        </div>
      </div>
    </div>
  </div>;
}

const CART_A = [
  { img: a("7c40f7e98f3c77103ff909dbc85ef37182330bf2"), name: "Manzana Royal", unit: "1 x 250 g aprox.", price: "2.000", qty: 3, offer: "−20%", was: "$2.500", pum: "$8/g" },
  { img: a("eb792ea5719b7ece1b680d82b5a2bd2a6fff298b"), name: "Café instantáneo Colcafé suave", unit: "1 x 500 g", price: "3.500", qty: 1, pum: "$7/g" },
  { img: a("1435461c632c5a531f1a2b2aa07e36a9056cb73c"), name: "Leche descremada deslactosada Alpina", unit: "1 x 1100 ml", price: "7.800", qty: 1, pum: "$7/ml" },
];
const CART_B = [
  { img: a("c5e1d4f57bc89b4ac39a0fdacd99f1e61c8263f8"), name: "Torta Gala Vainilla", unit: "1 x 60 g", price: "1.650", qty: 4, offer: "−40%", was: "$2.750", pum: "$27/g" },
  { img: a("e5dd877579e223abf4c7db66b35cbeebe5f159ec"), name: "Hamburguesa de res pre-asada Zenú", unit: "1 x 400 g", price: "18.900", qty: 2, pum: "$47/g" },
];
const UPSELL = [
  { img: a("5f5007df0552a46fb66892ffef8733e238fa413b"), name: "Harina pre-cocida Doñarepa", price: "3.500", eta: "10 min", fast: true, unit: "1 x 1000 g" },
  { img: a("fd6ff2da80fb9c5f453b9bd82b0b965ebc7df45d"), name: "Crema de leche Alquería", price: "7.000", eta: "20 min", unit: "1 x 180 g" },
  { img: a("f514feba8ec394c63c00d98d3095d5ff3afa39ae"), name: "Cerveza Bud Light", price: "4.500", eta: "10 min", fast: true, offer: "−10%", was: "$5.000", unit: "1 x 330 ml" },
];

function Line(p: typeof CART_A[number] & { hot?: boolean }) {
  return <div className="f2-line">
    <img className="f2-thumb" src={p.img} alt="" />
    <div className="info">
      <div className="name">{p.name}</div>
      <div className="f2-unit">{p.unit}</div>
      <div style={{ marginTop: 4 }}>
        <span className="f2-price sm"><i>$</i>{p.price}</span>
        {p.offer && <><span className="f2-offer">{p.offer}</span><span className="f2-was">{p.was}</span></>}
      </div>
      <div className="f2-pum">{p.pum}</div>
    </div>
    <div className={`f2-step${p.hot ? " is-hotspot" : ""}`}>
      <button type="button" aria-label="Menos"><img src={MINUS_I} alt="" width={20} height={20} /></button>
      <em>{p.qty}</em>
      <button type="button" aria-label="Más"><img src={PLUS_I} alt="" width={20} height={20} /></button>
    </div>
  </div>;
}

function Cart({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <StatusBar />
    <div className="f2-nav">
      <button type="button" className="f2-round is-hotspot" onClick={() => goTo("297:84219")} aria-label="Cerrar">
        <X size={16} /><HotNum n={1} />
      </button>
      <b>Canasta</b>
    </div>
    <div className="f2-scroll">
      <div className="f2-info">
        <img src={a("8d33565b4df3b4876b184e23de8045a29d2d1ba2", "svg")} alt="" />
        <div><b>Recibirás 2 entregas sin costo adicional</b><small>Productos enviados de bodegas diferentes</small></div>
      </div>
      <div className="f2-store-h">
        <img className="f2-ava" src={TURBO_AVA} alt="" />
        <div className="meta"><b>Turbo</b></div>
      </div>
      <div className="f2-store-h">
        <span className="f2-num">1</span>
        <div className="meta"><b>Entrega en 10 min</b><small>5 productos</small></div>
        <button type="button" className="f2-ico" aria-label="Vaciar"><img src={TRASH} alt="" width={16} height={16} /></button>
      </div>
      {CART_A.map(p => <Line key={p.name} {...p} />)}
      <div className="f2-store-h">
        <span className="f2-num">2</span>
        <div className="meta"><b>Entrega en 20 min</b><small>6 productos</small></div>
        <button type="button" className="f2-ico" aria-label="Vaciar"><img src={TRASH} alt="" width={16} height={16} /></button>
      </div>
      {CART_B.map(p => <Line key={p.name} {...p} />)}
      <div className="f2-up">
        <div className="f2-sec-h"><b>Completa tu pedido</b></div>
        <div className="f2-row">
          {UPSELL.map(p =>
            <div className="f2-up-card" key={p.name}>
              <img className="pic" src={p.img} alt="" />
              <button type="button" className="f2-plus" aria-label="Agregar"><img src={PLUS} alt="" /></button>
              <span className={`f2-eta-tag${p.fast ? " fast" : " slow"}`} style={{ height: 16, fontSize: 10, marginTop: 8 }}>{p.fast ? "⚡" : "⏱"} {p.eta}</span>
              <div><span className="f2-price sm"><i>$</i>{p.price}</span>{p.offer && <span className="f2-offer">{p.offer}</span>}</div>
              <p className="f2-pname">{p.name}</p>
              <span className="f2-unit">{p.unit}</span>
            </div>)}
        </div>
      </div>
      <div className="f2-bens"><span>✓ ¡Conseguiste tus beneficios!</span><span>2 beneficios ▾</span></div>
    </div>
    <div className="f2-dock">
      <div className="tot"><b>$61.700</b></div>
      <button type="button" className="f2-cta is-hotspot" onClick={() => goTo("297:89649")}>Continuar<HotNum n={2} /></button>
    </div>
  </div>;
}

function Eta({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <StatusBar />
    <div className="f2-nav">
      <button type="button" className="f2-round is-hotspot" onClick={() => goTo("259:77075")} aria-label="Atrás">
        <img src={ARROW} alt="" width={24} height={24} /><HotNum n={1} />
      </button>
      <b>Elige cuándo llega cada entrega</b>
    </div>
    <div className="f2-scroll">
      <div className="f2-eta-block">
        <div className="f2-store-h" style={{ border: 0 }}>
          <img className="f2-ava" src={TURBO_AVA} alt="" />
          <div className="meta"><b>Turbo</b><small>Entrega 1</small></div>
          <div className="f2-thumbs">
            {CART_A.map(p => <img key={p.name} src={p.img} alt="" />)}
          </div>
        </div>
        <button type="button" className="f2-slot on">
          <img src={CHECK} alt="" width={24} height={24} />
          <div><b><img src={TURBO_WORD_SM} alt="Turbo" height={14} /></b><small>8 - 10 min</small></div>
        </button>
        <button type="button" className="f2-slot">
          <img src={RADIO} alt="" width={24} height={24} />
          <div><b>Programar</b><small>Desde las 2:00 pm</small></div>
        </button>
      </div>
      <div className="f2-eta-block">
        <div className="f2-store-h" style={{ border: 0 }}>
          <img className="f2-ava" src={TURBO_AVA} alt="" />
          <div className="meta"><b>Turbo</b><small>Entrega 2</small></div>
          <div className="f2-thumbs">
            {CART_B.map(p => <img key={p.name} src={p.img} alt="" />)}
          </div>
        </div>
        <button type="button" className="f2-slot on">
          <img src={CHECK} alt="" width={24} height={24} />
          <div><b className="red">Estándar</b><small>18 - 20 min</small></div>
        </button>
        <button type="button" className="f2-slot">
          <img src={RADIO} alt="" width={24} height={24} />
          <div><b>Programar</b><small>Desde las 2:00 pm</small></div>
        </button>
      </div>
    </div>
    <div className="f2-dock" style={{ boxShadow: "none", justifyContent: "stretch" }}>
      <button type="button" className="f2-cta full lg is-hotspot" onClick={() => goTo("272:59663")}>Continuar<HotNum n={2} /></button>
    </div>
  </div>;
}

function Checkout({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <StatusBar />
    <div className="f2-nav">
      <button type="button" className="f2-round is-hotspot" onClick={() => goTo("297:89649")} aria-label="Atrás">
        <img src={ARROW} alt="" width={24} height={24} /><HotNum n={1} />
      </button>
      <b>Terminar y pagar</b>
      <span style={{ width: 32 }} />
    </div>
    <div className="f2-scroll">
      <div className="f2-map">
        <img className="map" src={a("1b7a46ab40d2474ee3e9637d03e48e2b6d6dc227")} alt="" />
        <img className="pin" src={a("e802df78ff8ddbc794f1bc96d432672bbfbd8537", "svg")} alt="" />
        <button type="button" className="adjust">Ajustar punto de entrega</button>
      </div>
      <button type="button" className="f2-rowline">
        <img src={a("2185414f54d2e4291ff2dd67d55a972b2597d0c9", "svg")} alt="" width={24} height={24} />
        <div className="txt"><b>Mi casa</b><small>Carrera 11 #82-01</small></div>
        <img className="f2-chev" src={CHEV} alt="" width={16} height={16} />
      </button>
      <button type="button" className="f2-rowline">
        <img src={a("53aaad155950d89bf004d5118cb766e034b03ec2", "svg")} alt="" width={24} height={24} />
        <div className="txt"><b>Detalles</b><small>Edificio 82, Apto 1202</small></div>
        <img className="f2-chev" src={CHEV} alt="" width={16} height={16} />
      </button>
      <button type="button" className="f2-rowline">
        <img src={a("f8ae2a9554574d1770cf72fcfc0cd046d13c2b54", "svg")} alt="" width={24} height={24} />
        <div className="txt"><b>Déjalo en recepción</b><small>Agregar instrucciones</small></div>
        <img className="f2-chev" src={CHEV} alt="" width={16} height={16} />
      </button>
      <div className="f2-pay-h"><span>Método de pago</span><button type="button">Cambiar</button></div>
      <div className="f2-rowline">
        <span className="f2-visa">VISA</span>
        <div className="txt"><b>Crédito *2122 · 1 cuota</b><small>DETAIL INFORMATION</small></div>
      </div>
      <div className="f2-rowline">
        <img src={a("979496a6cc85bff2b42f5a8600eb95aee8d3d294")} alt="" width={28} height={28} />
        <div className="txt"><b>$80.000 Créditos</b></div>
        <span style={{ fontSize: 12, color: "#177749" }}>Ver más</span>
      </div>
      <button type="button" className="f2-rowline"><div className="txt"><b>Cupones</b></div><img className="f2-chev" src={CHEV} alt="" width={16} height={16} /></button>
      <div className="f2-sec-h"><b>Este pedido tiene 2 entregas</b></div>
      <div className="f2-store-h">
        <span className="f2-num">1</span>
        <div className="meta"><b>Entrega 1</b><small>5 productos</small></div>
        <button type="button" className="f2-ico" aria-label="Vaciar"><img src={TRASH} alt="" width={16} height={16} /></button>
      </div>
      <button type="button" className="f2-slot on" style={{ marginBottom: 8 }}>
        <img src={CHECK} alt="" width={24} height={24} />
        <div><b><img src={TURBO_WORD_SM} alt="Turbo" height={14} /></b><small>8 - 10 min</small></div>
      </button>
      <div className="f2-pay-h" style={{ paddingTop: 0 }}><span style={{ fontSize: 14, color: "#464d59" }}>Subtotal</span><b>$18.800</b></div>
      <div className="f2-store-h">
        <span className="f2-num">2</span>
        <div className="meta"><b>Entrega 2</b><small>6 productos</small></div>
        <button type="button" className="f2-ico" aria-label="Vaciar"><img src={TRASH} alt="" width={16} height={16} /></button>
      </div>
      <button type="button" className="f2-slot on" style={{ marginBottom: 8 }}>
        <img src={CHECK} alt="" width={24} height={24} />
        <div><b className="red">Estándar</b><small>18 - 20 min</small></div>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#177749" }}>Cambiar</span>
      </button>
      <div className="f2-pay-h" style={{ paddingTop: 0 }}><span style={{ fontSize: 14, color: "#464d59" }}>Subtotal</span><b>$45.900</b></div>
      <div className="f2-sum">
        <div style={{ fontSize: 16, fontWeight: 500, margin: "8px 0" }}>Resumen de tu pedido</div>
        <div className="r"><span>Costo de productos</span><span><s style={{ color: "#919aaa" }}>$67.600</s> $61.700</span></div>
        <div className="r"><span>Costo de envío</span><span><s style={{ color: "#919aaa" }}>$4.500</s> $0</span></div>
        <div className="r"><span>Tarifa de servicio</span><span><s style={{ color: "#919aaa" }}>$6.000</s> $3.000</span></div>
        <div className="r"><span>Más rápido</span><span><s style={{ color: "#919aaa" }}>$2.000</s> $0</span></div>
        <div className="r tot"><span>Total a pagar</span><span>$64.700</span></div>
      </div>
      <div className="f2-save">
        <img src={a("979496a6cc85bff2b42f5a8600eb95aee8d3d294")} alt="" />
        Ahorras $12.900 con Pro Black y promociones adicionales.
      </div>
    </div>
    <div className="f2-dock">
      <div className="tot"><small>Total a pagar</small><b>$64.700</b></div>
      <button type="button" className="f2-cta is-hotspot" onClick={() => goTo("299:90348")}>Continuar<HotNum n={2} /></button>
    </div>
  </div>;
}

function Tips({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <div className="f2-tip-hero">
      <img src={a("5ccfc34474258ba64289d5e7d320dec313f7b5cf")} alt="" />
      <button type="button" className="back is-hotspot" onClick={() => goTo("272:59663")} aria-label="Atrás">
        <img src={ARROW} alt="" width={24} height={24} /><HotNum n={1} />
      </button>
      <div className="f2-bubble">87% de los usuarios le dan una propina a su Rappi.</div>
    </div>
    <div className="f2-scroll">
      <div className="f2-tip-body">
        <h1>Reconoce su esfuerzo</h1>
        <p>Tu Rappi recibe el 100% del valor de la propina. Recuerda que la propina es voluntaria, el valor sugerido puede ser modificado.</p>
        <h2>Propina para cada entrega:</h2>
        {[
          [a("1846e68d21a4e91ca9872a8003ca94cc38556bdf", "svg"), "Gracias por tu compromiso", "$6.300"],
          [a("dc9dff7b74d6cdc81c7d65cabbb242af56f6075c", "svg"), "Porque tu trabajo cuenta", "$4.400"],
          [a("6be09cf7feb3b2f439714053d2157e94bd469c09", "svg"), "Un extra por tu esfuerzo", "$3.150"],
        ].map(([ic, label, amt]) =>
          <button type="button" className="f2-tip-opt" key={label}>
            <img src={ic} alt="" /><span>{label}</span><em className="f2-chip-amt">{amt}</em>
          </button>)}
        <div className="f2-why">
          <button type="button" className="x" aria-label="Cerrar"><X size={16} /></button>
          <h3>¿Por qué este valor?</h3>
          <div className="r"><div>Entrega 1: Turbo<small>8 - 10 min</small></div><span>$1.300</span></div>
          <div className="r"><div>Entrega 2: Turbo<small>20 - 30 min</small></div><span>$1.300</span></div>
          <div className="tot"><span>Total de propina</span><span>$2.600</span></div>
        </div>
      </div>
    </div>
    <div className="f2-dock" style={{ boxShadow: "none" }}>
      <button type="button" className="f2-cta full lg is-hotspot" onClick={() => goTo("300:90667")}>Hacer Pedido<HotNum n={2} /></button>
    </div>
  </div>;
}

function Creating({ goTo }: { goTo: (id: string) => void }) {
  return <div className="f2">
    <StatusBar />
    <div className="f2-scroll f2-create">
      <img className="f2-mustache" src={a("9f152d58f0db6d56ec01bfbbb34637bf81b5ad90", "svg")} alt="" />
      <h1>Estamos creando<br />tu pedido</h1>
      <div className="f2-info" style={{ margin: "0 -24px" }}>
        <img src={a("42cdfbe37e8e8ac4dbfff88e90c050465f673d36", "svg")} alt="" />
        <div><b>Recibirás 2 entregas</b></div>
      </div>
      <div className="f2-rowline">
        <img className="f2-ava" src={TURBO_AVA} alt="" />
        <div className="txt"><b>2 bodegas</b><small>11 productos</small></div>
      </div>
      <div className="f2-rowline">
        <img src={a("2185414f54d2e4291ff2dd67d55a972b2597d0c9", "svg")} alt="" width={24} height={24} />
        <div className="txt"><b>Mi Casa</b><small>Carrera 11 #82-01</small></div>
      </div>
      <div className="f2-rowline">
        <span className="f2-visa">VISA</span>
        <div className="txt"><b>Crédito *2122</b><small>DETAIL INFORMATION</small></div>
      </div>
    </div>
    <div className="f2-create-dock">
      <button type="button" className="f2-cta ghost lg full is-hotspot" onClick={() => goTo("272:59663")}>
        Deshacer pedido<HotNum n={1} />
      </button>
    </div>
  </div>;
}

export function Flujo2Slice({ nodeId, goTo }: { nodeId: string; goTo: (id: string) => void }) {
  switch (nodeId) {
    case "297:84565": return <Intro goTo={goTo} />;
    case "297:84354": return <TurboHome goTo={goTo} />;
    case "297:84219": return <Aisle goTo={goTo} />;
    case "259:77075": return <Cart goTo={goTo} />;
    case "297:89649": return <Eta goTo={goTo} />;
    case "272:59663": return <Checkout goTo={goTo} />;
    case "299:90348": return <Tips goTo={goTo} />;
    case "300:90667": return <Creating goTo={goTo} />;
    default: return null;
  }
}
