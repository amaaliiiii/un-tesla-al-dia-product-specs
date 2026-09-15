import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Search, Share, X } from "lucide-react";

export const WON_TICKET = { code: "12334-A", store: "Starbucks", sorteo: "Sorteo N°6" };

export const COUNTRIES = [
  { name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { name: "Chile", dial: "+56", flag: "🇨🇱" },
  { name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { name: "México", dial: "+52", flag: "🇲🇽" },
  { name: "Perú", dial: "+51", flag: "🇵🇪" },
  { name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { name: "EE.UU.", dial: "+1", flag: "🇺🇸" },
  { name: "Afganistán", dial: "+93", flag: "🇦🇫" },
];

function sheetDismiss(onClose: () => void) {
  let y: number | null = null;
  return {
    onPointerDown: (e: React.PointerEvent) => { y = e.clientY; },
    onPointerUp: (e: React.PointerEvent) => {
      if (y != null && e.clientY - y > 56) onClose();
      y = null;
    },
    onWheel: (e: React.WheelEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".cc-list, .cc-search")) return;
      if (e.deltaY > 32) onClose();
    },
  };
}

function HotNum({ n }: { n: number }) {
  return <i className="hot-badge">{n}</i>;
}

function StatusBar() {
  return <div className="status" aria-hidden="true"><span>9:41</span><span className="status-end">●●●</span></div>;
}

export function CheckoutScreen({ back, onContinue, joined, total = 80, onJoin, soldOut = false, focusBanner = false }: { back: () => void; onContinue: () => void; joined: boolean; total?: number; onJoin?: () => void; soldOut?: boolean; focusBanner?: boolean }) {
  const [localJoined, setLocalJoined] = useState(joined);
  const participating = !soldOut && (joined || localJoined);
  const pay = `$${total.toFixed(2)}`;
  const joinNow = () => { setLocalJoined(true); onJoin?.(); };
  return <div className="ck-screen">
    <StatusBar />
    <div className="ck-nav">
      <button type="button" className={`ck-back${focusBanner ? "" : " is-hotspot"}`} onClick={back} aria-label="Atrás">
        <img src="/assets/figma/checkout/arrow-back.svg" alt="" width={24} height={24} />
        {focusBanner ? null : <HotNum n={1} />}
      </button>
      <b>Terminar y pagar</b>
      <img className="ck-pro" src="/assets/figma/checkout/ico-pro.svg" alt="" width={32} height={32} />
    </div>
    <div className="ck-scroll">
      <div className="ck-map">
        <img src="/assets/figma/checkout/map.png" alt="" />
        <img className="ck-pin-img" src="/assets/figma/checkout/pin-map.svg" alt="" width={48} height={53} />
        <button type="button" className="ck-adjust">Ajustar punto de entrega</button>
      </div>
      <button type="button" className="ck-row">
        <span className="ck-ico"><img src="/assets/figma/checkout/ico-pin.svg" alt="" width={24} height={24} /></span>
        <div><b>Mi casa</b><small>Carrera 11 #82-01 apto 103</small></div>
        <img src="/assets/figma/checkout/ico-chevron.svg" alt="" width={24} height={24} />
      </button>
      <button type="button" className="ck-row">
        <span className="ck-ico"><img src="/assets/figma/checkout/ico-doc.svg" alt="" width={24} height={24} /></span>
        <div><b>Detalles</b><small>Edificio 82, Apto 1202</small></div>
        <img src="/assets/figma/checkout/ico-chevron.svg" alt="" width={24} height={24} />
      </button>
      <button type="button" className="ck-row">
        <span className="ck-ico"><img src="/assets/figma/checkout/ico-door.svg" alt="" width={24} height={24} /></span>
        <div><b>Dejar en la portería</b><small>Preguntar por la sra. Carmen</small></div>
        <img src="/assets/figma/checkout/ico-chevron.svg" alt="" width={24} height={24} />
      </button>
      <div className="ck-eta">
        <div className="ck-eta-h">
          <span className="ck-ico"><img src="/assets/figma/checkout/ico-clock.svg" alt="" width={24} height={24} /></span>
          <p>Entrega estimada</p>
          <img className="ck-eta-i" src="/assets/figma/checkout/ico-info.svg" alt="" width={16} height={16} />
        </div>
        <div className="ck-eta-slots">
          <button type="button" className="ck-ship on">
            <img src="/assets/figma/checkout/radio-on.svg" alt="" width={24} height={24} />
            <div><b className="fast"><img src="/assets/figma/checkout/ico-bolt.svg" alt="" width={16} height={16} />Más rápido</b><small>14-34 min</small></div>
            <em><img src="/assets/figma/checkout/ico-pro-ship.svg" alt="" width={16} height={16} /><s>$2.00</s> Gratis</em>
          </button>
          <button type="button" className="ck-ship">
            <img src="/assets/figma/checkout/radio.svg" alt="" width={24} height={24} />
            <div><b><img src="/assets/figma/checkout/ico-clock-sm.svg" alt="" width={16} height={16} />Estándar</b><small>28 - 48 min</small></div>
          </button>
        </div>
      </div>
      {soldOut
        ? <div className="ck-ticket-wrap">
            <div className="ck-ticket sold">
              <img className="ck-ticket-word" src="/assets/figma/tesla-wordmark.svg" alt="TESLA" />
              <span className="ck-ticket-tag sold">No recibirás un boleto con este pedido</span>
              <p>Se terminaron los boletos para el sorteo de hoy.</p>
              <img className="ck-ticket-car" src="/assets/figma/checkout/tesla-side.png" alt="" />
            </div>
          </div>
        : participating
        ? <div className="ck-ticket-wrap">
            <div className={`ck-ticket quiet${focusBanner ? " is-hotspot" : ""}`}>
              <img className="ck-ticket-word" src="/assets/figma/tesla-wordmark.svg" alt="TESLA" />
              <span className="ck-ticket-tag">Beneficio activado<img src="/assets/figma/checkout/check-circle.svg" alt="" width={16} height={16} /></span>
              <p>Al recibir este pedido ganarás<br /><b>1 boleto</b> para el sorteo.</p>
              <img className="ck-ticket-car" src="/assets/figma/checkout/tesla-side.png" alt="" />
              {focusBanner && <HotNum n={1} />}
            </div>
          </div>
        : <div className="ck-ticket-wrap">
            <button type="button" className="ck-ticket ask is-hotspot" onClick={joinNow} aria-label="Quiero participar">
              <img className="ck-ticket-word" src="/assets/figma/tesla-wordmark.svg" alt="TESLA" width={91} height={15} />
              <p>¿Quieres participar por<br /><b>1 boleto</b> para el sorteo?</p>
              <span className="ck-ticket-in">Quiero participar</span>
              <img className="ck-ticket-car" src="/assets/figma/checkout/tesla-side.png" alt="" width={171} height={96} />
              <HotNum n={focusBanner ? 1 : 2} />
            </button>
          </div>}
      <div className="ck-pay"><span>Método de pago</span><button type="button">Cambiar</button></div>
    </div>
    <div className="ck-dock">
      <div><small>Total a pagar</small><b>{pay}</b></div>
      <button type="button" className={`sd-cta lg${focusBanner ? "" : " is-hotspot"}`} onClick={onContinue}>Continuar{focusBanner ? null : <HotNum n={participating || soldOut ? 2 : 3} />}</button>
    </div>
  </div>;
}

function OtNav() {
  return <div className="ot-nav">
    <button type="button" className="ot-ico" aria-label="Cerrar"><img src="/assets/figma/store/close.svg" alt="" width={24} height={24} /></button>
    <span />
    <span className="ot-ico" aria-hidden="true"><Share size={18} /></span>
    <button type="button" className="ot-help">Ayuda</button>
  </div>;
}

function TeslaBoletoCard({ onClick, hot, n = 1 }: { onClick?: () => void; hot?: boolean; n?: number }) {
  const inner = <>
    <img className="ot-tesla-word" src="/assets/figma/tesla-wordmark.svg" alt="TESLA" width={65} height={8} />
    <b>Tu boleto está en camino</b>
    <small>Lo recibirás cuando se entregue el pedido</small>
    <img className="ot-tesla-car" src="/assets/figma/checkout/tesla-side.png" alt="" width={153} height={86} />
    {hot && <HotNum n={n} />}
  </>;
  return onClick
    ? <button type="button" className={`ot-tesla${hot ? " is-hotspot" : ""}`} onClick={onClick}>{inner}</button>
    : <div className="ot-tesla">{inner}</div>;
}

function OtOrderDetails() {
  return <>
    <div className="ot-line">
      <div>
        <small>Detalles de la entrega</small>
        <b>Dejar en la portería en Carrera 11 #82-01 Apto 103</b>
      </div>
      <img src="/assets/figma/checkout/ico-ot-chevron.svg" alt="" width={24} height={24} />
    </div>
    <div className="ot-chips">
      <span>Cambiar dirección</span>
      <span>Editar detalles</span>
      <span>Editar instrucciones</span>
    </div>
    <div className="ot-line">
      <img className="ot-ava" src="/assets/figma/checkout/starbucks.png" alt="" />
      <div>
        <small>Resumen del pedido</small>
        <b>3 productos · $64.00</b>
      </div>
      <img src="/assets/figma/checkout/ico-ot-chevron.svg" alt="" width={24} height={24} />
    </div>
  </>;
}

export function OrderCreatedScreen({ onNext, onHub, joined = true }: { onNext: () => void; onHub?: () => void; joined?: boolean }) {
  return <div className="ck-screen ot">
    <StatusBar />
    <OtNav />
    <div className="ot-scroll">
      <h1 className={!joined ? "is-hotspot" : undefined} onClick={!joined ? onNext : undefined}>Pedido creado{!joined && <HotNum n={1} />}</h1>
      <p className="ot-eta">Entrega estimada: <b>12:35 pm</b></p>
      <div className="ot-track four">
        <i className="on"><img src="/assets/figma/checkout/ico-confirmed.svg" alt="" width={20} height={20} /></i>
        <b className="q" />
        <i><img src="/assets/figma/checkout/ico-cook.svg" alt="" width={20} height={20} /></i>
        <em />
        <i><img src="/assets/figma/checkout/ico-moto.svg" alt="" width={20} height={20} /></i>
        <em />
        <i><img src="/assets/figma/checkout/ico-house.svg" alt="" width={20} height={20} /></i>
      </div>
      <p className="ot-late">Llega a más tardar a las <b>1:05 pm</b><img src="/assets/figma/checkout/ico-ot-info.svg" alt="" width={16} height={16} /></p>
      <OtOrderDetails />
      {joined && <TeslaBoletoCard onClick={onHub} hot n={1} />}
    </div>
  </div>;
}

export function OrderTransitScreen({ onHub, onNext, joined = true, focusRt = false }: { onNext?: () => void; onHub?: () => void; joined?: boolean; focusRt?: boolean }) {
  return <div className="ck-screen ot transit">
    <StatusBar />
    <OtNav />
    <div className={`ot-head${!joined && onNext ? " is-hotspot" : ""}`} onClick={!joined ? onNext : undefined}>
      <h1>Tu pedido ya está en camino{!joined && onNext && <HotNum n={1} />}</h1>
      <p className="ot-eta">Entrega estimada: <b>12:35 pm</b></p>
      <div className="ot-track slim">
        <i className="on"><img src="/assets/figma/checkout/ico-moto-on.svg" alt="" width={20} height={20} /></i>
        <b className="half" />
        <i><img src="/assets/figma/checkout/ico-house.svg" alt="" width={20} height={20} /></i>
      </div>
      <p className="ot-late">Llega a más tardar a las <b>1:05 pm</b><img src="/assets/figma/checkout/ico-ot-info.svg" alt="" width={16} height={16} /></p>
    </div>
    <div className="ot-map" aria-hidden="true">
      <img src="/assets/figma/checkout/ot-map.png" alt="" />
      {joined && <span className={`ot-rt-car${focusRt ? " is-hotspot" : ""}`}>
        <img src="/assets/figma/checkout/tesla-side.png" alt="" />
        {focusRt && <HotNum n={1} />}
      </span>}
      <span className="ot-map-dest">
        <img src="/assets/figma/checkout/pin-house.svg" alt="" width={10} height={10} />
      </span>
    </div>
    <div className="ot-sheet">
      <div className="ot-code">
        <div><small>Protege tu pedido</small><b>Comparte tu código al recibirlo</b></div>
        <span>123</span>
        <img src="/assets/figma/checkout/ico-ot-chevron.svg" alt="" width={24} height={24} />
      </div>
      <div className="ot-rt">
        <span className="ot-ava-wrap">
          <img className="ot-ava" src="/assets/figma/checkout/rt.png" alt="" />
          <em><img src="/assets/figma/checkout/ico-star.svg" alt="" width={10} height={10} />4.6</em>
        </span>
        <div><b>José Luis</b><small>543 pedidos · Propina: $0</small></div>
        <button type="button">Propina</button>
      </div>
      <div className="ot-chat-row">
        <div className="ot-chat" aria-hidden="true">Chatea con tu Rappi<img src="/assets/figma/checkout/ico-send.svg" alt="" width={16} height={16} /></div>
        <span className="ot-call" aria-hidden="true" />
      </div>
      <OtOrderDetails />
      {joined && <TeslaBoletoCard onClick={onHub} hot={!focusRt} n={1} />}
    </div>
  </div>;
}

const DEL_ISSUES = [
  "Tengo productos incorrectos, dañados o faltantes",
  "Recibí un pedido totalmente diferente",
  "Mi pedido nunca llegó",
  "Quiero devolver un producto",
  "Quiero detalles sobre el pago y promociones",
  "Tuve problemas con el repartidor",
];

export function OrderDeliveredScreen({ onTicket, toast, onToast, joined = true }: { onTicket: () => void; toast?: boolean; onToast?: () => void; joined?: boolean }) {
  return <div className="ck-screen ot delivered">
    <StatusBar />
    <div className="ot-del-scroll">
      <div className="ot-del-hero">
        <img className="ot-del-map" src="/assets/figma/checkout/ot-map.png" alt="" />
        <span className="ot-del-pin" aria-hidden="true">
          <img src="/assets/figma/checkout/pin-house.svg" alt="" width={10} height={10} />
        </span>
        <div className="ot-del-tip">
          <img className="ot-del-photo" src="/assets/figma/checkout/del-photo.png" alt="" width={104} height={104} />
          <div className="ot-del-tip-copy">
            <small>02:34 pm · Ene 12</small>
            <p>Tu Rappi dejó el pedido en la portería.</p>
            <span className="ot-del-detalle">Ver detalle</span>
          </div>
        </div>
        <div className="ot-del-nav">
          <button type="button" className="ot-del-close" aria-label="Cerrar">
            <img src="/assets/figma/store/close.svg" alt="" width={24} height={24} />
          </button>
          <div>
            <small>Starbucks</small>
            <h1>Pedido entregado</h1>
          </div>
          <img className="ot-del-brand" src="/assets/figma/checkout/sb-logo.png" alt="" width={40} height={40} />
        </div>
      </div>
      <div className="ot-del-stack">
        <div className="ot-del-card">
          <div className="ot-rt">
            <span className="ot-ava-wrap">
              <img className="ot-ava" src="/assets/figma/checkout/rt-jose.png" alt="" width={40} height={40} />
              <em><img src="/assets/figma/checkout/ico-star.svg" alt="" width={10} height={10} />4.6</em>
            </span>
            <div><b>José Luis</b><small>Propina: $2.000</small></div>
            <button type="button" className="ot-del-tip-btn">Propina<img src="/assets/figma/checkout/ico-plus.svg" alt="" width={16} height={16} /></button>
          </div>
          <div className="ot-del-bubble">
            <p>Dejé su pedido con el portero Camilo.</p>
            <small>12:32 PM</small>
          </div>
          <div className="ot-chat-row">
            <div className="ot-chat" aria-hidden="true">Chatea con tu Rappi<img src="/assets/figma/checkout/ico-send.svg" alt="" width={16} height={16} /></div>
            <span className="ot-call" aria-hidden="true"><img src="/assets/figma/checkout/ico-phone.svg" alt="" width={16} height={16} /></span>
          </div>
          <div className="ot-del-sum">
            <div><small>Total</small><b>$64.000</b></div>
            <span className="ot-del-resumen">Ver resumen</span>
          </div>
        </div>
        {joined && <button type="button" className="ot-won-bar is-hotspot" onClick={toast ? onToast : onTicket}>
          <span>¡Ganaste 1 boleto Tesla!</span>
          <img className="ot-won-car" src="/assets/figma/checkout/tesla-won-bar.png" alt="" width={77} height={43} />
          <img className="ot-won-chev" src="/assets/figma/checkout/ot-won-chevron.svg" alt="" width={24} height={24} />
          <HotNum n={1} />
        </button>}
        <div className="ot-del-rate">
          <span className="ot-del-rate-ico"><img src="/assets/figma/checkout/ico-shop-star.svg" alt="" width={24} height={24} /></span>
          <p>Califica tu experiencia</p>
          <img src="/assets/figma/checkout/ico-chevron-right.svg" alt="" width={24} height={24} />
        </div>
        <h2 className="ot-del-q">¿Tuviste problemas con tu pedido?</h2>
        {DEL_ISSUES.map(label => (
          <div className="ot-del-issue" key={label}>
            <span>{label}</span>
            <img src="/assets/figma/checkout/ico-chevron-right.svg" alt="" width={24} height={24} />
          </div>
        ))}
      </div>
    </div>
    {toast && <button type="button" className="ck-toast is-hotspot" onClick={onToast}>
      <span className="ck-toast-check"><Check size={14} strokeWidth={3} /></span>
      <span>Datos confirmados</span>
      <b>Ver boletos</b>
      <HotNum n={2} />
    </button>}
  </div>;
}

const KB_ALPHA = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
const KB_NUM = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

function IosKeyboard({
  mode, value, onChange, onHide,
}: {
  mode: "name" | "phone";
  value: string;
  onChange: (v: string) => void;
  onHide: () => void;
}) {
  const [shift, setShift] = useState(false);
  const press = (k: string) => {
    if (k === "back") { onChange(value.slice(0, -1)); return; }
    if (k === "space") { onChange(value + " "); return; }
    if (k === "hide") { onHide(); return; }
    onChange(value + (shift ? k.toUpperCase() : k));
    if (shift) setShift(false);
  };
  return <div className={`ios-kb${mode === "phone" ? " is-num" : ""}`} onMouseDown={e => e.preventDefault()}>
    {mode === "name" ? <>
      {KB_ALPHA.map((row, i) => <div key={i} className={`ios-kb-row r${i}`}>
        {i === 2 && <button type="button" className={`ios-kb-key util${shift ? " on" : ""}`} onClick={() => setShift(s => !s)}>⇧</button>}
        {row.map(k => <button type="button" key={k} className="ios-kb-key" onClick={() => press(k)}>{shift ? k.toUpperCase() : k}</button>)}
        {i === 2 && <button type="button" className="ios-kb-key util" onClick={() => press("back")}>⌫</button>}
      </div>)}
      <div className="ios-kb-row r3">
        <button type="button" className="ios-kb-key util wide" onClick={() => press("hide")}>123</button>
        <button type="button" className="ios-kb-key space" onClick={() => press("space")}>espacio</button>
        <button type="button" className="ios-kb-key util wide" onClick={() => press("hide")}>return</button>
      </div>
    </> : <>
      {KB_NUM.map((row, i) => <div key={i} className="ios-kb-row num">{row.map(k => <button type="button" key={k} className="ios-kb-key lg" onClick={() => press(k)}>{k}</button>)}</div>)}
      <div className="ios-kb-row num">
        <button type="button" className="ios-kb-key lg util" onClick={() => press("hide")}>ABC</button>
        <button type="button" className="ios-kb-key lg" onClick={() => press("0")}>0</button>
        <button type="button" className="ios-kb-key lg util" onClick={() => press("back")}>⌫</button>
      </div>
    </>}
  </div>;
}

export function TicketWonScreen({
  name, phone, dial, onName, onPhone, onDial, onConfirm, onCountry,
}: {
  name: string; phone: string; dial: string;
  onName: (v: string) => void; onPhone: (v: string) => void; onDial: (v: string) => void;
  onConfirm: () => void; onCountry: () => void;
}) {
  const country = COUNTRIES.find(c => c.dial === dial);
  const [kb, setKb] = useState<null | "name" | "phone">(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const openKb = (which: "name" | "phone") => {
    setKb(which);
    requestAnimationFrame(() => (which === "name" ? nameRef : phoneRef).current?.focus());
  };
  return <div className={`won2${kb ? " has-kb" : ""}`} onMouseDown={e => {
    const t = e.target as HTMLElement;
    if (!t.closest(".won2-field, .ios-kb, .won2-cta, .won2-dial")) setKb(null);
  }}>
    <StatusBar />
    <img className="won2-car" src="/assets/figma/checkout/tesla-front.png" alt="" />
    <h1>¡Ganaste 1 boleto!</h1>
    <p className="won2-sub">Para el sorteo de mañana</p>
    <div className="won2-tix">
      <div className="won2-tix-rot" aria-hidden="true">
        <span className="won2-tix-shadow">
          <img src="/assets/figma/checkout/won-tix-card.svg" alt="" />
        </span>
      </div>
      <span className="won2-tix-label">Boleto N°</span>
      <img className="won2-tix-word" src="/assets/figma/checkout/won-tesla-word.svg" alt="TESLA" />
      <strong>{WON_TICKET.code}</strong>
      <em>{WON_TICKET.store}</em>
      <small>{WON_TICKET.sorteo}</small>
      <img className="won2-tix-dash" src="/assets/figma/ticket/dash.svg" alt="" />
      <p className="won2-legal">
        <b>Denominación:</b> Sorteo “Un Tesla al día”. <b>Organizador:</b> Tecnologías Rappi, S.A.P.I. de C.V. <b>Día de Participación:</b> Día participación [XXX]. <b>Nombre del Participante:</b> [XXXXXXXXXXXXXXXXX]. <b>Número de orden:</b> [XXXXXXXXXXXXXXX]. <b>Premio:</b> Un Tesla Model Y RWD 2027, valor $804,000.00 M.N. <b>Permiso:</b> SEGOB/DGJS No. [XXX], vigencia [XXX] a [XXX]. Boleto gratuito. Valor nominal $0.00 M.N. Válido únicamente para el sorteo del Día de Participación indicado. Los premios serán entregados de conformidad con lo establecido en las bases del sorteo. Este boleto da derecho a que si su Folio resulta extraído en el sorteo se le considere persona ganadora, sujeto a las condiciones y requisitos establecidos en las bases.
      </p>
    </div>
    <h2>Confirma tu nombre en el boleto</h2>
    <label className={`won2-field is-name is-hotspot${kb === "name" ? " on" : ""}`}>Nombre Completo
      <input
        ref={nameRef}
        value={name}
        inputMode="none"
        autoComplete="off"
        onFocus={() => setKb("name")}
        onChange={e => onName(e.target.value)}
        onClick={() => openKb("name")}
      />
      <HotNum n={1} />
    </label>
    <label className="won2-field is-cell">Celular
      <div className="won2-phone">
        <button type="button" className="won2-dial is-hotspot" onClick={() => { setKb(null); onDial(dial); onCountry(); }}>
          {dial === "+52"
            ? <img className="won2-flag" src="/assets/figma/checkout/flag-mx.svg" alt="" width={24} height={24} />
            : <span className="won2-flag">{country?.flag}</span>}
          <span>{dial}</span>
          <i className="won2-expand"><ChevronDown size={12} /></i>
          <HotNum n={2} />
        </button>
        <span className={`won2-phone-num is-hotspot${kb === "phone" ? " on" : ""}`}>
          <input
            ref={phoneRef}
            value={phone}
            inputMode="none"
            autoComplete="off"
            onFocus={() => setKb("phone")}
            onChange={e => onPhone(e.target.value)}
            onClick={() => openKb("phone")}
          />
          <HotNum n={3} />
        </span>
      </div>
    </label>
    <div className="won2-dock">
      <button className="won2-cta is-hotspot" onClick={() => { setKb(null); onConfirm(); }}>Confirmar<HotNum n={4} /></button>
    </div>
    {kb && <IosKeyboard
      mode={kb}
      value={kb === "name" ? name : phone}
      onChange={kb === "name" ? onName : onPhone}
      onHide={() => setKb(null)}
    />}
  </div>;
}

export function CountryPicker({ onClose, onPick }: { onClose: () => void; onPick: (dial: string) => void }) {
  const [q, setQ] = useState("");
  const list = COUNTRIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.dial.includes(q));
  return <div className="ck-layer" {...sheetDismiss(onClose)}>
    <button className="sd-dim" aria-label="Cerrar" onClick={onClose} />
    <div className="cc-sheet">
      <div className="cc-head">
        <button className="sd-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <b>Indicativo telefónico</b>
      </div>
      <label className="cc-search"><Search size={16} color="#919aaa" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar" /></label>
      <div className="cc-list">
        {list.map(c => <button key={c.dial + c.name} className="cc-row is-hotspot" onClick={() => onPick(c.dial)}>
          <span className="won2-flag">{c.flag}</span><b>{c.name}</b><em>{c.dial}</em>
        </button>)}
      </div>
    </div>
  </div>;
}

export function ConfirmDataSheet({ name, phone, dial, onClose, onConfirm }: { name: string; phone: string; dial: string; onClose: () => void; onConfirm: () => void }) {
  const country = COUNTRIES.find(c => c.dial === dial);
  return <div className="ck-layer cd-layer" {...sheetDismiss(onClose)}>
    <button className="sd-dim is-hotspot" aria-label="Cerrar" onClick={onClose}>
      <HotNum n={2} />
    </button>
    <div className="cd-sheet">
      <span className="cd-check" aria-hidden="true"><Check size={16} strokeWidth={2.5} /></span>
      <div className="cd-copy">
        <h2>¿Estas seguro que tus datos son correctos?</h2>
        <p>Tu nombre deben coincidir con tu identificación oficial.</p>
        <small>Solo te lo pediremos esta info la primera vez.</small>
      </div>
      <div className="cd-fields">
        <label className="cd-field">Nombre Completo
          <input readOnly value={name} />
        </label>
        <label className="cd-field">Celular
          <div className="won2-phone">
            <span className="won2-dial">
              {dial === "+52"
                ? <img className="won2-flag" src="/assets/figma/checkout/flag-mx.svg" alt="" width={24} height={24} />
                : <span className="won2-flag">{country?.flag}</span>}
              <span>{dial}</span>
              <i className="won2-expand"><ChevronDown size={12} /></i>
            </span>
            <input readOnly value={phone} />
          </div>
        </label>
      </div>
      <div className="cd-dock">
        <button className="won2-cta is-hotspot" onClick={onConfirm}>Confirmar<HotNum n={1} /></button>
      </div>
    </div>
  </div>;
}

export function TeslaTag() {
  return <span className="chub-tag">
    <span className="chub-tag-label">BOLETO TESLA</span>
    <span className="chub-tag-car"><img src="/assets/figma/hub/tag-car.png" alt="" /></span>
  </span>;
}

function BannerClock() {
  return <div className="rh-clock">{[["05", "HORAS"], ["11", "MIN"], ["22", "SEG"]].map(([n, l], i) => <React.Fragment key={l}>
    <div className="rh-box"><strong>{n}</strong><em>{l}</em></div>
    {i < 2 && <span>:</span>}
  </React.Fragment>)}</div>;
}

const restCatRows = [
  [
    { img: "/assets/figma/home/popcorn.png", label: "Hits" },
    { img: "/assets/figma/search/chip-tesla.png", label: "Tesla", on: true },
    { img: "/assets/figma/home/taco.png", label: "Tacos" },
    { img: "/assets/figma/home/sushi.png", label: "Sushi" },
    { img: "/assets/figma/home/burger.png", label: "Rápida" },
  ],
  [
    { img: "/assets/figma/home/avatar-turbo.png", label: "Turbo" },
    { img: "/assets/figma/home/bowl.png", label: "Saludable" },
    { img: "/assets/figma/home/taco.png", label: "Mexicano" },
    { img: "/assets/figma/home/pumpkin.png", label: "Helados" },
  ],
];

const restStores = [
  { name: "Starbucks", photo: "/assets/figma/home/sbux.png", eta: "40 min", price: "$5.000" },
  { name: "Watakushi", photo: "/assets/figma/search/watakushi.png", eta: "40 min", price: "$5.000" },
];

export type RestFocus = "chip" | "banner" | "carousel" | "cards";

const restGenericRows: { title: string; stores: { name: string; photo: string; meta: string; tag: boolean }[] }[] = [
  {
    title: "Los más pedidos",
    stores: [
      { name: "Juan Burgers", photo: "/assets/figma/search/ad-burger.png", meta: "30 min · $4.500", tag: true },
      { name: "Green House", photo: "/assets/figma/search/ad-salad.png", meta: "35 min · $5.000", tag: false },
      { name: "Nonna", photo: "/assets/figma/search/s1.png", meta: "25 min · $4.000", tag: true },
    ],
  },
  {
    title: "Cerca de ti",
    stores: [
      { name: "Mora Mora Turbo", photo: "/assets/figma/home/pumpkin.png", meta: "10 min · $3.000", tag: true },
      { name: "Tierra Garat", photo: "/assets/figma/search/p1.png", meta: "25 min · $4.000", tag: false },
      { name: "Bacu", photo: "/assets/figma/search/s2.png", meta: "35 min · $4.800", tag: true },
    ],
  },
  {
    title: "Nuevos en Rappi",
    stores: [
      { name: "Green Grass", photo: "/assets/figma/search/p2.png", meta: "40 min · $5.500", tag: false },
      { name: "Massima", photo: "/assets/figma/search/s3.png", meta: "45 min · $6.000", tag: true },
      { name: "Ice cream nation", photo: "/assets/figma/search/p3.png", meta: "15 min · $2.900", tag: false },
    ],
  },
];

export function RestaurantsHome({ back, openHub, openStore, openSearch, soldOut = false, focus }: { back: () => void; openHub: () => void; openStore: () => void; openSearch: () => void; soldOut?: boolean; focus?: RestFocus }) {
  const on = (k: RestFocus) => !focus || focus === k;
  const hot = (k: RestFocus) => on(k) ? " is-hotspot" : "";
  const num = (k: RestFocus, n: number) => on(k) ? <HotNum n={focus ? 1 : n} /> : null;
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scroller.current;
    if (!root || !focus) return;
    const sel = focus === "banner" ? ".rest-banner" : focus === "carousel" ? ".rest-tesla-sec" : focus === "cards" ? ".rest-row.is-tesla" : null;
    const go = () => {
      if (!sel) { root.scrollTop = 0; return; }
      const el = root.querySelector<HTMLElement>(sel);
      if (el) root.scrollTop = Math.max(0, el.offsetTop - 24);
    };
    go();
    const frame = requestAnimationFrame(() => { go(); requestAnimationFrame(go); });
    return () => cancelAnimationFrame(frame);
  }, [focus]);
  return <div className="screen rest-home" data-scroll="rest-home" ref={scroller}>
    <StatusBar />
    <div className="rh-nav">
      <button className="stores-back" onClick={back} aria-label="Atrás"><img src="/assets/figma/stores/arrow-back-ios.svg" alt="" width={24} height={24} /></button>
      <b className="rh-loc"><span>Casa de Mamá • Calle 92 # 11-72</span><i className="rh-expand"><ChevronDown size={12} /></i></b>
    </div>
    <div className="rest-filters">
      <span className="rest-filter-ico"><img src="/assets/figma/search/ico-filter.svg" alt="" width={16} height={16} /></span>
      <div className="rest-filter-row">
        <span>Ordenar<ChevronDown size={16} /></span>
        <span><img src="/assets/figma/search/ico-promo.svg" alt="" width={16} height={16} />Promos</span>
        <span><img src="/assets/figma/store/star.svg" alt="" width={16} height={16} />+ 4.5</span>
        <span><img src="/assets/figma/search/ico-thunder.svg" alt="" width={16} height={16} />35 min</span>
      </div>
    </div>
    <div className="rest-cats">
      {restCatRows.map((row, i) => <div className="rest-cat-row" key={i}>
        {row.map(c => c.label === "Tesla" ? <button type="button" className={`rest-chip on${hot("chip")}`} key={c.label} onClick={openHub} aria-label="Tesla">
          <img src={c.img} alt="" width={24} height={24} />{c.label}{num("chip", 1)}
        </button> : <span className={`rest-chip${c.on ? " on" : ""}`} key={c.label}><img src={c.img} alt="" width={24} height={24} />{c.label}</span>)}
      </div>)}
    </div>
    <button className={`rh-banner rh-banner-sm rest-banner${hot("banner")}`} onClick={openHub} aria-label="Próximo sorteo cierra en">
      <small>Próximo sorteo cierra en:</small>
      <BannerClock />
      <div className="rh-car-clip">
        <img className="rh-car" src="/assets/figma/home/tesla-a.png" alt="" width={183} height={103} />
        <img className="rh-word" src="/assets/figma/home/tesla-word.svg" alt="" width={43} height={6} />
      </div>
      {num("banner", 2)}
    </button>
    <div className={`rest-tesla-sec${focus === "carousel" ? " is-hotspot" : ""}`}>
      <button type="button" className={`rest-sec${focus === "carousel" ? "" : hot("carousel")}`} onClick={openHub} aria-label="Gana boletos en estas tiendas">
        <img className="rest-word" src="/assets/figma/home/tesla-word.svg" alt="TESLA" />
        <img className="rest-sec-car" src="/assets/figma/home/tesla-a.png" alt="" />
        <h3 className="rest-h">Gana boletos en estas tiendas</h3>
        <i className="rest-sec-go"><ChevronRight size={16} /></i>
        {focus === "carousel" ? null : num("carousel", 3)}
      </button>
      <div className="rest-row is-tesla">
        {restStores.map(s => <button key={s.name} className={`rest-store${hot("cards")}`} onClick={openStore}>
          <span className="rest-photo-wrap">
            <img className="rest-photo" src={s.photo} alt="" />
            {soldOut ? null : <TeslaTag />}
          </span>
          <b>{s.name}</b>
          <small>{s.eta} · {s.price}</small>
          {num("cards", 4)}
        </button>)}
      </div>
      {focus === "carousel" ? <HotNum n={1} /> : null}
    </div>
    {restGenericRows.map(row => <div className="rest-gen" key={row.title}>
      <div className="rest-gen-h"><b>{row.title}</b><ChevronRight size={16} color="#919aaa" /></div>
      <div className="rest-gen-row">
        {row.stores.map(s => <button type="button" key={`${row.title}-${s.name}`} className={`rest-gen-card${s.tag && !soldOut ? hot("cards") : ""}`} onClick={openStore}>
          <span className="rest-gen-photo">
            <img src={s.photo} alt="" />
            {s.tag && !soldOut ? <TeslaTag /> : null}
          </span>
          <b>{s.name}</b>
          <small>{s.meta}</small>
          {s.tag && !soldOut ? num("cards", 4) : null}
        </button>)}
      </div>
    </div>)}
    <div className="rh-dock">
      <button className="rh-search" onClick={openSearch}><img src="/assets/figma/home/search.svg" alt="" /><span>¿Que quieres hoy?</span></button>
      <button className="rh-mic" aria-label="Voz"><img src="/assets/figma/home/mic-ring.svg" alt="" /><img className="rh-mic-ico" src="/assets/figma/home/mic.svg" alt="" /></button>
    </div>
  </div>;
}

const srProds = [
  { img: "s1.png", name: "Este es un nombre de producto muy largo para que ocupe más de 2 lineas" },
  { img: "s2.png", name: "Este es un nombre de producto muy largo para que ocupe más de 2 lineas" },
  { img: "s3.png", name: "Este es un nombre de producto muy largo para que ocupe más de 2 lineas" },
];

export function SearchScreen({ back, openHub, openStore, soldOut = false }: { back: () => void; openHub: () => void; openStore: () => void; soldOut?: boolean }) {
  return <div className="screen search-res" data-scroll="search-res">
    <StatusBar />
    <div className="sr-nav">
      <div className="sr-q">
        <button className="stores-back is-hotspot" onClick={back} aria-label="Atrás"><img src="/assets/figma/stores/arrow-back-ios.svg" alt="" width={24} height={24} /><HotNum n={1} /></button>
        <span>Ensalada</span>
        <button type="button" className="sr-clear" onClick={back} aria-label="Limpiar"><X size={16} /></button>
      </div>
    </div>
    <div className="sr-tabs">
      <span className="on">Todo</span>
      <span>Restaurantes</span>
      <span>Mercado</span>
      <span>Farmacias</span>
      <span>Tiendas</span>
    </div>
    <div className="sr-filters">
      <span><img src="/assets/figma/search/ico-thunder.svg" alt="" width={16} height={16} />35 min</span>
      <span><img src="/assets/figma/search/ico-promo.svg" alt="" width={16} height={16} />Ofertas</span>
      <span><img src="/assets/figma/store/star.svg" alt="" width={16} height={16} />4.5</span>
    </div>
    <p className="sr-kicker">Recomendados</p>
    <div className="sr-ads">
      <div className="sr-ad">
        <img className="sr-ad-img" src="/assets/figma/search/ad-salad.png" alt="" />
        <img className="sr-ad-logo" src="/assets/figma/search/ad-logo.png" alt="" />
        <div className="sr-ad-copy">
          <div className="sr-ad-row"><span>Hasta</span><em>30% OFF</em></div>
          <p>en Juan Burgers</p>
        </div>
      </div>
      <div className="sr-ad">
        <img className="sr-ad-img" src="/assets/figma/search/ad-burger.png" alt="" />
        <img className="sr-ad-logo" src="/assets/figma/search/greenhouse.png" alt="" />
        <div className="sr-ad-copy">
          <p className="sr-ad-lead">Descuentos de hasta</p>
          <div className="sr-ad-row"><em>30% OFF</em></div>
          <p>en El Corral</p>
        </div>
      </div>
    </div>
    <div className="sr-dots"><i className="on" /><i /><i /><i /><i /><i /></div>
    <button className="sr-store is-hotspot" onClick={openStore}>
      <img className="sr-logo" src="/assets/figma/search/greenhouse.png" alt="" />
      <div>
        <b>Green House<span className="sr-adpill">Ad</span></b>
        <span className="sr-meta">
          <img src="/assets/figma/search/ico-clock.svg" alt="" width={12} height={12} />40 min
          <i className="sr-dot" />$5.000
          <i className="sr-dot" />2km
          <i className="sr-dot" />
          <img src="/assets/figma/store/star.svg" alt="" width={12} height={12} />4.6
          <em>(1.234)</em>
        </span>
        {soldOut ? null : <TeslaTag />}
      </div>
      <HotNum n={2} />
    </button>
    <div className="sr-prods">
      {srProds.map(p => <div key={p.img} className="sr-prod">
        <img className="sr-prod-img" src={`/assets/figma/search/${p.img}`} alt="" width={136} height={136} />
        <img className="sr-plus" src="/assets/figma/search/plus.svg" alt="" width={40} height={40} />
        <b>$18.000</b>
        <p>{p.name}</p>
      </div>)}
    </div>
    <button className="sr-tesla is-hotspot" onClick={openHub}>
      <b>Un Tesla al día. Todos los días.</b>
      <div className="sr-mini-clock">{[["05", "HORAS"], ["11", "MIN"], ["22", "SEG"]].map(([n, l], i) => <React.Fragment key={l}>
        <div className="sr-mini-box"><strong>{n}</strong><em>{l}</em></div>
        {i < 2 && <span>:</span>}
      </React.Fragment>)}</div>
      <img className="sr-tesla-car" src="/assets/figma/home/tesla-a.png" alt="" width={150} height={84} />
      <HotNum n={3} />
    </button>
    <button className="sr-store is-hotspot" onClick={openStore}>
      <img className="sr-logo" src="/assets/figma/search/turbo.png" alt="" />
      <div>
        <b>Turbo</b>
        <span className="sr-meta">
          <img src="/assets/figma/search/ico-turbo.svg" alt="" width={12} height={12} /><em className="sr-turbo">10 min</em>
          <i className="sr-dot" />2km
        </span>
        {soldOut ? null : <TeslaTag />}
      </div>
      <HotNum n={2} />
    </button>
    <div className="sr-prods">
      {srProds.map(p => <div key={`t-${p.img}`} className="sr-prod">
        <img className="sr-prod-img" src={`/assets/figma/search/${p.img}`} alt="" width={136} height={136} />
        <img className="sr-plus" src="/assets/figma/search/plus.svg" alt="" width={40} height={40} />
        <b>$18.000</b>
        <p>{p.name}</p>
        <small>1 x 330 ml</small>
      </div>)}
    </div>
  </div>;
}
