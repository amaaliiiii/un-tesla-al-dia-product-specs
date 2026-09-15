import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Ban, CircleHelp, Clock3, CreditCard, Eye, EyeOff, Gift, Home, Info, MapPin, Menu, Minus,
  Play, RotateCcw, Search, Share, ShoppingBag, Sparkles, Store, Ticket, Trophy, User, X
} from "lucide-react";
import "./styles.css";
import { AccessGate } from "./gate";
import {
  CheckoutScreen, OrderCreatedScreen, OrderTransitScreen, OrderDeliveredScreen,
  TicketWonScreen, CountryPicker, ConfirmDataSheet, RestaurantsHome, SearchScreen, WON_TICKET,
  TeslaTag,
} from "./checkout";
import type { RestFocus } from "./checkout";

type StepKind =
  | "optin" | "rules" | "home" | "hub" | "tickets" | "stores" | "store"
  | "live" | "results" | "delivery" | "won" | "confirm" | "pay"
  | "cancelled" | "cap" | "intro" | "faq" | "chub" | "home2" | "boletos" | "prevresults"
  | "rest" | "search" | "winintro" | "video";

type Hotspot = { label: string; desc: string };

type Step = {
  title: string;
  kind: StepKind;
  action?: string;
  note: string;
  hotspots?: Hotspot[];
  props?: Record<string, string | boolean | number>;
};

type ContextArea = "existing" | "new";
type ContextRef = { area: ContextArea; screen: string; render: string };

type Flow = {
  id: string;
  label: string;
  short: string;
  description: string;
  icon: React.ReactNode;
  group?: "flujos" | "placements" | "context" | "render";
  ctx?: ContextRef;
  disclaimer?: string;
  steps: Step[];
};

type TicketInfo = { code: string; store: string; sorteo?: string };
type NavFrame = {
  stepIndex: number;
  showRest: boolean;
  showSearch: boolean;
  showStores: boolean;
  showResults: boolean;
  showBoletos: boolean;
  showFaq: boolean;
  showStore: boolean;
  legalDoc: "bases" | "privacy" | null;
  storeView: StoreView;
  ticket: TicketInfo | null;
  resultsLive: boolean;
  showYoutube: boolean;
};
const BACK_PREV = "Regresa al contexto anterior.";

const storeJoinHotspots: Hotspot[] = [
  { label: "Acepto participar", desc: "Acepta los T&C, registra el opt-in y entra a la tienda." },
  { label: "No quiero participar", desc: "Cierra el modal sin unirse. Puedes entrar a la tienda igual." },
  { label: "T&C", desc: "Abre la landing legal con las bases del sorteo." },
  { label: "Overlay", desc: "Tap en el fondo o scroll hacia abajo cierra el modal." },
];
const storeSoldHotspots: Hotspot[] = [
  { label: "Entendido", desc: "Cierra el aviso y entra a la tienda. Este pedido no da boleto." },
  { label: "Overlay", desc: "Tap en el fondo o scroll hacia abajo cierra el modal." },
];
const storeOfferHotspots: Hotspot[] = [
  { label: "Cerrar", desc: "La X cierra el popup y vuelve a la tienda." },
  { label: "Entendido", desc: "Cierra el popup y vuelve a la tienda." },
  { label: "Overlay", desc: "Tap en el fondo o scroll hacia abajo cierra el popup." },
];
const checkoutHotspots: Hotspot[] = [
  { label: "Atrás", desc: "Vuelve a la canasta." },
  { label: "Continuar", desc: "Crea el pedido." },
];
const checkoutSoldHotspots: Hotspot[] = [
  { label: "Atrás", desc: "Vuelve a la canasta." },
  { label: "Continuar", desc: "Crea el pedido. Este pedido no da boleto." },
];
const checkoutAskHotspots: Hotspot[] = [
  { label: "Atrás", desc: "Vuelve a la canasta." },
  { label: "Banner Tesla", desc: "Toda la imagen es el CTA. Activa el beneficio Tesla en esta orden." },
  { label: "Continuar", desc: "Crea el pedido. Sin aceptar, las vistas siguientes no muestran Tesla." },
];
const createdHotspots: Hotspot[] = [
  { label: "Tu boleto está en camino", desc: "Abre el hub del concurso. Atrás vuelve a este order tracking." },
];
const transitHotspots: Hotspot[] = [
  { label: "Tu boleto está en camino", desc: "Abre el hub del concurso. Atrás vuelve a este order tracking." },
];
const deliveredHotspots: Hotspot[] = [
  { label: "¡Ganaste 1 boleto Tesla!", desc: "Abre la confirmación del boleto. El chat no es accionable." },
];
const wonHotspots: Hotspot[] = [
  { label: "Nombre completo", desc: "Datos precargados. Tap abre el teclado para editarlos." },
  { label: "Indicativo", desc: "Cambia el país del celular." },
  { label: "Teléfono", desc: "Dato precargado. Tap abre el teclado numérico." },
  { label: "Confirmar", desc: "Abre la confirmación de datos." },
];
const confirmHotspots: Hotspot[] = [
  { label: "Confirmar", desc: "Guarda el nombre y muestra el toast." },
  { label: "Overlay", desc: "Tap en el fondo o scroll hacia abajo cierra el modal." },
];
const legalHotspots: Hotspot[] = [
  { label: "Atrás", desc: "Cierra la landing legal y vuelve a la pantalla anterior." },
];
const restHotspots: Hotspot[] = [
  { label: "Chip Tesla", desc: "Deeplink al hub del concurso." },
  { label: "Banner del concurso", desc: "Abre el hub del concurso." },
  { label: "Gana boletos en estas tiendas", desc: "Abre el hub del concurso." },
  { label: "Tienda con tag", desc: "Abre el storefront. El tag Boleto Tesla marca las tiendas que participan hoy." },
];
const searchHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Tienda", desc: "Abre el storefront." },
  { label: "Banner Tesla", desc: "Deeplink al hub del concurso." },
];
const soldRestSearchSteps: Step[] = [
  { title: "Home restaurantes", kind: "rest", note: "", props: { soldOut: true }, hotspots: restHotspots.slice(0, 3).concat({ label: "Tienda sin tag", desc: "Abre el storefront. Con los boletos agotados el tag desaparece de las tiendas." }) },
  { title: "Búsqueda", kind: "search", note: "", props: { soldOut: true }, hotspots: searchHotspots },
];
const restSearchSteps: Step[] = [
  { title: "Home restaurantes", kind: "rest", note: "", hotspots: restHotspots },
  { title: "Búsqueda", kind: "search", note: "", hotspots: searchHotspots },
];
const homeNav = (banner: string): Hotspot[] => [
  { label: "Banner del concurso", desc: banner },
  { label: "Restaurantes", desc: "Abre el home de restaurantes." },
  { label: "Buscar", desc: "Abre la búsqueda de Ensalada." },
];
const homeTicketsNav: Hotspot[] = [
  { label: "Un Tesla al día", desc: "Abre el hub del concurso." },
  { label: "Tus boletos de mañana", desc: "Abre Mis boletos." },
  { label: "Tus boletos de hoy", desc: "Abre las tiendas participantes de hoy." },
  { label: "Restaurantes", desc: "Abre el home de restaurantes." },
  { label: "Buscar", desc: "Abre la búsqueda de Ensalada." },
];
const homeLiveNav: Hotspot[] = [
  { label: "¡El sorteo de hoy está en curso!", desc: "Abre el hub para ver el sorteo en vivo." },
  { label: "Un Tesla al día", desc: "Abre las tiendas participantes de hoy." },
  { label: "Tus boletos de mañana", desc: "Abre Mis boletos." },
  { label: "Restaurantes", desc: "Abre el home de restaurantes." },
  { label: "Buscar", desc: "Abre la búsqueda de Ensalada." },
];
const homeResultsNav: Hotspot[] = [
  { label: "Resultados último sorteo", desc: "Abre la landing de resultados." },
  { label: "Un Tesla al día", desc: "Abre las tiendas participantes de hoy." },
  { label: "Tus boletos de mañana", desc: "Abre Mis boletos." },
  { label: "Restaurantes", desc: "Abre el home de restaurantes." },
  { label: "Buscar", desc: "Abre la búsqueda de Ensalada." },
];
const resultsHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Chips de sorteo", desc: "Cambian el sorteo consultado." },
  { label: "Video del sorteo", desc: "Abre el replay en un webview de YouTube. No se reproduce dentro de Rappi." },
  { label: "Gana boletos", desc: "Abre el listado de tiendas participantes." },
  { label: "Cada boleto", desc: "Muestra un boleto con el que participaste." },
];
const resultsCoverageHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Chips de sorteo", desc: "Cambian el sorteo consultado." },
  { label: "Video del sorteo", desc: "Abre el replay en un webview de YouTube. No se reproduce dentro de Rappi." },
  { label: "Gana boletos", desc: "Abre la landing de zonas de cobertura." },
  { label: "Cada boleto", desc: "Muestra un boleto con el que participaste." },
];
const liveResultsHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Chips de sorteo", desc: "Hoy es el sorteo en curso. Los chips anteriores muestran resultados pasados." },
  { label: "¡Mira el sorteo en vivo!", desc: "Abre el video en un webview de YouTube. No se reproduce dentro de Rappi." },
  { label: "Cada boleto", desc: "Boletos con los que estás participando hoy." },
];
const youtubeHotspots: Hotspot[] = [
  { label: "Cerrar", desc: "Cierra el webview de YouTube y vuelve a Resultados." },
];
const faqHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Cada pregunta", desc: "Se expande o colapsa al tocarla." },
  { label: "Ver tiendas participantes", desc: "Abre el listado de tiendas de hoy." },
  { label: "Ver mis boletos activos", desc: "Abre tus boletos del sorteo." },
  { label: "Bases y Política de privacidad", desc: "Abren los documentos legales." },
];
const storesListHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Cada tienda", desc: "Abre el storefront correspondiente." },
];
const resultsStep: Step = { title: "Resultados", kind: "prevresults", note: "", hotspots: resultsHotspots };
const faqStep: Step = { title: "Términos y condiciones", kind: "faq", note: "", hotspots: faqHotspots };
const storesListStep: Step = { title: "Tiendas participantes", kind: "stores", note: "", hotspots: storesListHotspots };
const hubExploreSteps: Step[] = [resultsStep, faqStep, storesListStep];
const hubEmptyHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
  { label: "Gana boletos", desc: "Lleva a las tiendas participantes." },
  { label: "Ver resultados y sorteos anteriores", desc: "Muestra los sorteos ya realizados." },
  { label: "Pide y gana boletos", desc: "Abre el listado de tiendas de hoy." },
  { label: "Tiendas participantes", desc: "Cada tarjeta redirecciona a la tienda." },
  { label: "Ver todas las tiendas participantes", desc: "Abre el listado completo de tiendas." },
];
const storeJoinStep: Step = {
  title: "Modal T&C",
  kind: "store",
  note: "",
  props: { phase: "join" },
  hotspots: storeJoinHotspots,
};
const cartHotspots: Hotspot[] = [
  { label: "Continuar", desc: "Pasa al checkout con el beneficio Tesla." },
];
const storeDetailStep: Step = {
  title: "Vista store detail",
  kind: "store",
  note: "",
  props: { phase: "store" },
  hotspots: [
    { label: "Boleto Tesla", desc: "La offer card abre el detalle del beneficio Tesla." },
    { label: "Agregar producto", desc: "Suma productos hasta el mínimo que da el boleto." },
    { label: "Progreso del boleto", desc: "Aparece con productos en canasta. Abre el detalle de beneficios." },
    { label: "Ver canasta", desc: "Abre la canasta con el progreso del boleto." },
  ],
};
const soldCommerceSteps: Step[] = [
  { title: "Modal se terminaron", kind: "store", note: "", props: { phase: "join", soldOut: true }, hotspots: storeSoldHotspots },
  { title: "Vista store detail", kind: "store", note: "", props: { phase: "store", soldOut: true }, hotspots: [
    { label: "Agregar producto", desc: "Sin badge ni offer card de Tesla: este pedido no da boleto." },
    { label: "Ver canasta", desc: "Abre la canasta sin el beneficio Tesla." },
  ] },
  { title: "Vista canasta", kind: "store", note: "", props: { phase: "cart", soldOut: true }, hotspots: cartHotspots },
  { title: "Checkout · se terminaron", kind: "store", note: "", props: { phase: "checkout", soldOut: true }, hotspots: checkoutSoldHotspots },
];
const hubTicketsHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
  { label: "Gana boletos", desc: "Lleva a las tiendas participantes." },
  { label: "Ver resultados y sorteos anteriores", desc: "Muestra los sorteos ya realizados." },
  { label: "Mis boletos", desc: "Toda la sección abre el listado de tus boletos." },
  { label: "Chips de sorteo", desc: "Filtran los boletos entre sorteo de mañana y sorteo de hoy." },
  { label: "Cada boleto", desc: "Abre el detalle del boleto correspondiente." },
  { label: "Pide y gana boletos", desc: "Abre el listado de tiendas de hoy." },
  { label: "Tiendas participantes", desc: "Cada tarjeta redirecciona a la tienda." },
  { label: "Ver todas las tiendas participantes", desc: "Abre el listado completo de tiendas." },
];
const orderFlowSteps: Step[] = [
  { title: "Vista checkout", kind: "store", note: "", props: { phase: "checkout" }, hotspots: checkoutHotspots },
  { title: "Vista order tracking - Creado", kind: "store", note: "", props: { phase: "created" }, hotspots: createdHotspots },
  { title: "Vista order tracking - En camino", kind: "store", note: "", props: { phase: "transit" }, hotspots: transitHotspots },
  { title: "Rescue screen", kind: "store", note: "", props: { phase: "delivered" }, hotspots: deliveredHotspots },
  { title: "Recolección de datos", kind: "store", note: "", props: { phase: "won" }, hotspots: wonHotspots },
  {
    title: "Hub - Con boleto", kind: "chub", note: "",
    props: { tickets: true },
    hotspots: hubTicketsHotspots,
  },
];
const storeJourneySteps: Step[] = [
  storeJoinStep,
  storeDetailStep,
  { title: "Pantalla internal global offer card", kind: "store", note: "", props: { phase: "offer" }, hotspots: storeOfferHotspots },
  { title: "Vista canasta", kind: "store", note: "", props: { phase: "cart" }, hotspots: cartHotspots },
  ...orderFlowSteps,
];
const boletosHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Chips de sorteo", desc: "Filtran los boletos: mañana (N°6 + CTA), hoy (N°5, sin CTA) o N°3." },
  { label: "Gana más boletos", desc: "Solo en Sorteo de mañana. Abre las tiendas de hoy. Atrás vuelve a Mis boletos." },
  { label: "Cada boleto", desc: "Abre el detalle del boleto correspondiente." },
];
const hubTicketsHoyHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
  { label: "Gana boletos", desc: "El empty de mañana y el CTA del hero abren tiendas." },
  { label: "Chips de sorteo", desc: "Mañana está vacío. Hoy muestra los boletos que ya tiene." },
  { label: "Pide y gana boletos", desc: "Abre el listado de tiendas de hoy." },
];
const boletosEmptyHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Chips de sorteo", desc: "Mañana está vacío. Hoy muestra los boletos del sorteo en curso." },
  { label: "Gana boletos", desc: "Abre las tiendas de hoy. Atrás vuelve a Mis boletos." },
];
const liveBoletosHotspots: Hotspot[] = [
  { label: "Atrás", desc: BACK_PREV },
  { label: "Chips de sorteo", desc: "Hoy muestra Ver sorteo N°5 en VIVO. Mañana sigue con Gana más boletos." },
  { label: "Ver sorteo N°5 en VIVO", desc: "Solo en Sorteo de hoy. Abre Resultados con el video en la misma pantalla." },
  { label: "Cada boleto", desc: "Boletos con los que estás participando hoy." },
];
const boletosStep: Step = {
  title: "Mis boletos", kind: "boletos", note: "",
  hotspots: boletosHotspots,
};

const flows: Flow[] = [
  {
    id: "onboarding", label: "Onboarding y reglas", short: "Onboarding",
    description: "Entrada al concurso, hub principal y reglas con preguntas frecuentes.",
    icon: <Sparkles size={17} />,
    steps: [
      {
        title: "Onboarding fullscreen", kind: "intro", note: "",
        hotspots: [
          { label: "Conocer más", desc: "Abre el hub / landing del concurso." },
          { label: "Entendido", desc: "Cierra el in-app y muestra el home con el banner." },
        ],
      },
      {
        title: "Home con banner", kind: "home2", note: "",
        hotspots: [
          { label: "Banner del concurso", desc: "Abre el hub / landing del concurso." },
          { label: "Restaurantes", desc: "Abre el home de restaurantes." },
          { label: "Buscar", desc: "Abre la búsqueda de Ensalada." },
        ],
      },
      ...restSearchSteps,
      { title: "Hub del concurso", kind: "chub", note: "", hotspots: hubEmptyHotspots },
      ...hubExploreSteps,
      ...storeJourneySteps,
    ],
  },
  {
    id: "without-tickets", label: "Usuario sin boletos", short: "Sin boletos",
    description: "Desde home vacío hasta el primer boleto ganado.",
    icon: <CircleHelp size={17} />,
    steps: [
      { title: "Home vacío", kind: "home2", note: "", props: { empty: true }, hotspots: homeNav("Abre el hub / landing del concurso.") },
      ...restSearchSteps,
      { title: "Hub vacío", kind: "chub", note: "", hotspots: hubEmptyHotspots },
      ...hubExploreSteps,
      ...storeJourneySteps,
    ],
  },
  {
    id: "with-tickets", label: "Usuario con boletos", short: "Con boletos",
    description: "Mismas pantallas con boletos. Sin onboarding ni intro.",
    icon: <Ticket size={17} />,
    steps: [
      { title: "Home con boletos", kind: "home2", note: "", props: { tickets: true }, hotspots: homeTicketsNav },
      ...restSearchSteps,
      { title: "Hub con boletos", kind: "chub", note: "", props: { tickets: true }, hotspots: hubTicketsHotspots },
      { title: "Hub · solo boletos de hoy", kind: "chub", note: "", props: { ticketsHoy: true }, hotspots: hubTicketsHoyHotspots },
      { title: "Mis boletos · vacío mañana", kind: "boletos", note: "", props: { emptyManana: true }, hotspots: boletosEmptyHotspots },
      boletosStep,
      ...hubExploreSteps,
      ...storeJourneySteps,
    ],
  },
  {
    id: "live", label: "Sorteo en vivo", short: "Sorteo en vivo",
    description: "Carrusel de 3 banners y Resultados: en vivo el video va en esa misma pantalla; si ya pasó, se ve el ganador.",
    icon: <Play size={17} />,
    steps: [
      { title: "Home en vivo", kind: "home2", note: "", props: { live: true }, hotspots: homeLiveNav },
      ...restSearchSteps,
      {
        title: "Hub · En vivo", kind: "chub", note: "", props: { live: true, tickets: true },
        hotspots: [
          { label: "Atrás", desc: BACK_PREV },
          { label: "Ver sorteo N°5 en VIVO", desc: "Abre Resultados con el video del sorteo en curso." },
          { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
          { label: "Gana boletos", desc: "Tiendas del próximo cierre. El de hoy ya está en curso." },
          { label: "Ver resultados y sorteos anteriores", desc: "Muestra los sorteos ya realizados." },
        ],
      },
      { title: "Mis boletos · en vivo", kind: "boletos", note: "", props: { live: true }, hotspots: liveBoletosHotspots },
      { title: "Resultados · en vivo", kind: "prevresults", note: "", props: { live: true }, hotspots: liveResultsHotspots },
      faqStep,
      storesListStep,
      ...storeJourneySteps,
    ],
  },
  {
    id: "results", label: "Resultados del sorteo", short: "Resultados",
    description: "Folio ganador del Tesla y boletos con los que participaste.",
    icon: <Trophy size={17} />,
    steps: [
      { title: "Home resultados", kind: "home2", note: "", props: { results: true }, hotspots: homeResultsNav },
      ...restSearchSteps,
      resultsStep,
      { title: "Hub del concurso", kind: "chub", note: "", hotspots: hubEmptyHotspots },
      faqStep,
      storesListStep,
      ...storeJourneySteps,
    ],
  },
  {
    id: "win-tesla", label: "Gana Tesla", short: "Gana Tesla",
    description: "Ganador del auto: ¡Hoy eres el ganador del Tesla! Boleto 3321-H.",
    icon: <Gift size={17} />,
    steps: [
      {
        title: "In-app ganaste el Tesla", kind: "winintro", note: "",
        hotspots: [
          { label: "Cerrar", desc: "Cierra el in-app y va al home ganador." },
          { label: "Compartir", desc: "Cierra el in-app. El share es informativo por ahora." },
        ],
      },
      { title: "Home ganador", kind: "home2", note: "", props: { winner: true }, hotspots: homeNav("Abre el resultado como ganador del Tesla.") },
      ...restSearchSteps,
      {
        title: "¡Hoy eres el ganador del Tesla!", kind: "prevresults", note: "", props: { winner: true },
        hotspots: [
          { label: "Atrás", desc: BACK_PREV },
          { label: "Boleto 3321-H", desc: "Tu boleto ganador. Rappi te contactará." },
        ],
      },
      { title: "Hub del concurso", kind: "chub", note: "", props: { tickets: true }, hotspots: hubTicketsHotspots },
      faqStep,
    ],
  },
  {
    id: "no-coverage", label: "Sin cobertura", short: "Sin cobertura",
    description: "Aún no hay tiendas para ganar boletos en esta dirección.",
    icon: <MapPin size={17} />,
    steps: [
      { title: "Home sin cobertura", kind: "home2", note: "", props: { noCoverage: true, small: true }, hotspots: [{ label: "Banner del concurso", desc: "Abre el hub. Aún no hay tiendas en esta dirección." }] },
      {
        title: "Hub sin cobertura", kind: "chub", note: "", props: { noCoverage: true, tickets: true },
        hotspots: [
          { label: "Atrás", desc: BACK_PREV },
          { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
          { label: "Gana boletos", desc: "Abre zonas. El vacío es solo informativo." },
          { label: "Ver resultados y sorteos anteriores", desc: "Los sorteos previos siguen consultables." },
        ],
      },
      { title: "Resultados", kind: "prevresults", note: "", props: { noCoverage: true }, hotspots: resultsCoverageHotspots },
      faqStep,
      {
        title: "Zonas de cobertura", kind: "stores", note: "", props: { noCoverage: true },
        hotspots: [{ label: "Atrás", desc: BACK_PREV }],
      },
    ],
  },
  {
    id: "no-stores-day", label: "Sin tiendas ese día", short: "Sin tiendas hoy",
    description: "Hoy no hay tiendas participantes en tu zona. Regresa mañana.",
    icon: <Store size={17} />,
    steps: [
      { title: "Home", kind: "home2", note: "", hotspots: homeNav("Abre el hub del día sin tiendas.") },
      ...restSearchSteps,
      {
        title: "Hub · sin tiendas hoy", kind: "chub", note: "", props: { noStoresDay: true, tickets: true },
        hotspots: [
          { label: "Atrás", desc: BACK_PREV },
          { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
          { label: "Regresa mañana", desc: "El vacío no ofrece aviso; hay que volver al día siguiente." },
          { label: "Ver resultados y sorteos anteriores", desc: "Los sorteos previos siguen consultables." },
        ],
      },
      resultsStep,
      faqStep,
      {
        title: "Tiendas · hoy no hay", kind: "stores", note: "", props: { noStoresDay: true },
        hotspots: [{ label: "Atrás", desc: BACK_PREV }],
      },
    ],
  },
  {
    id: "sold-out", label: "Se terminaron los boletos del día", short: "Boletos agotados",
    description: "Copy de hub: se terminaron los boletos; los acumulados siguen participando.",
    icon: <Ticket size={17} />,
    steps: [
      { title: "Home agotado", kind: "home2", note: "", props: { soldOut: true }, hotspots: homeNav("Abre el hub con emisión cerrada.") },
      ...soldRestSearchSteps,
      { title: "Hub · se terminaron", kind: "chub", note: "", props: { soldOut: true, tickets: true }, hotspots: [
        { label: "Atrás", desc: BACK_PREV },
        { label: "Mis boletos", desc: "Los boletos acumulados siguen participando." },
        { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
        { label: "Ver resultados y sorteos anteriores", desc: "Muestra los sorteos ya realizados." },
      ] },
      { title: "Mis boletos · se terminaron", kind: "boletos", note: "", props: { soldOut: true }, hotspots: [{ label: "Cada boleto", desc: "Siguen participando en el sorteo." }] },
      resultsStep,
      faqStep,
      storesListStep,
      ...soldCommerceSteps,
    ],
  },
  {
    id: "campaign-ended", label: "Campaña terminada", short: "Terminada",
    description: "Los sorteos han terminado. El hub muestra el último Tesla sorteado.",
    icon: <Ban size={17} />,
    steps: [
      { title: "Home · terminada", kind: "home2", note: "", props: { ended: true }, hotspots: homeNav("Abre el hub: los sorteos ya cerraron.") },
      ...soldRestSearchSteps,
      { title: "Hub · terminada", kind: "chub", note: "", props: { ended: true, tickets: true }, hotspots: [
        { label: "Atrás", desc: BACK_PREV },
        { label: "Ver resultados", desc: "¡Ya sorteamos este Tesla!" },
        { label: "¿Cómo funciona?", desc: "Abre términos y condiciones y preguntas frecuentes." },
      ] },
      { title: "Resultados · último Tesla", kind: "prevresults", note: "", props: { delivered: true }, hotspots: [{ label: "Atrás", desc: BACK_PREV }] },
      faqStep,
    ],
  },
  {
    id: "cancelled-order", label: "Pedido cancelado", short: "Cancelado",
    description: "Si el pedido se cancela antes de entregarse, esta modal avisa que no se emite boleto.",
    icon: <X size={17} />,
    steps: [
      { title: "Pedido cancelado", kind: "cancelled", note: "", hotspots: [{ label: "Entendido", desc: "Cierra el aviso. Este pedido no da boleto." }] },
    ],
  },
  {
    id: "ctx-home-banner", group: "context", ctx: { area: "existing", screen: "home", render: "Banner" },
    label: "Home", short: "Banner",
    description: "Estados del banner grande de Tesla en el home de Rappi.",
    icon: <Home size={17} />,
    disclaimer: "El estado del banner depende del estado del sorteo y del usuario.",
    steps: [
      { title: "General con timer", kind: "home2", note: "", props: { single: true, timerCta: true }, hotspots: [{ label: "Banner", desc: "Un Tesla al día. Todos los días. Cuenta el cierre del sorteo y el CTA abre las tiendas de hoy." }] },
      { title: "Vacío", kind: "home2", note: "", props: { single: true, empty: true }, hotspots: [{ label: "Banner", desc: "El usuario no tiene boletos para el sorteo de mañana. Gana boletos abre las tiendas." }] },
      { title: "Boletos hoy", kind: "home2", note: "", props: { single: true, ticketsToday: true }, hotspots: [{ label: "Banner", desc: "Boletos que ya participan en el sorteo de hoy. Abre Mis boletos." }] },
      { title: "Boletos mañana", kind: "home2", note: "", props: { single: true, tickets: true }, hotspots: [{ label: "Banner", desc: "Boletos acumulados para el sorteo de mañana, con timer y CTA para ganar más." }] },
      { title: "En vivo", kind: "home2", note: "", props: { single: true, live: true }, hotspots: [{ label: "Banner", desc: "El sorteo de hoy está en curso. El CTA abre el sorteo en vivo." }] },
      { title: "Resultados sorteo", kind: "home2", note: "", props: { single: true, results: true }, hotspots: [{ label: "Banner", desc: "Boleto ganador del último sorteo. Abre Resultados." }] },
      { title: "Ganador", kind: "home2", note: "", props: { single: true, winner: true }, hotspots: [{ label: "Banner", desc: "El usuario ganó el Tesla. Abre Resultados con su boleto ganador." }] },
      { title: "Boletos agotados", kind: "home2", note: "", props: { single: true, soldOut: true }, hotspots: [{ label: "Banner", desc: "Se terminaron los boletos del día; los acumulados siguen participando." }] },
      { title: "Sin cobertura", kind: "home2", note: "", props: { single: true, noCoverage: true }, hotspots: [{ label: "Banner", desc: "Aún no hay tiendas en esta dirección. CTA para avisarme." }] },
    ],
  },
  {
    id: "ctx-home-tags", group: "context", ctx: { area: "existing", screen: "home", render: "Carousel tags" },
    label: "Home", short: "Carousel tags",
    description: "Tag Boleto Tesla en las tiendas que participan dentro de los carruseles del home.",
    icon: <Store size={17} />,
    steps: [
      { title: "Con tag", kind: "home2", note: "", props: { tickets: true, tags: true }, hotspots: [{ label: "Tag Boleto Tesla", desc: "Aparece sobre la foto de las tiendas que participan en el sorteo de hoy." }] },
      { title: "Agotado · sin tag", kind: "home2", note: "", props: { soldOut: true, tags: true }, hotspots: [{ label: "Sin tag", desc: "Si se terminaron los boletos del día, el tag desaparece de las tiendas." }] },
    ],
  },
  {
    id: "ctx-home-motion", group: "context", ctx: { area: "existing", screen: "home", render: "Animaciones" },
    label: "Home", short: "Animaciones",
    description: "Motion del banner de Tesla en el home y su entrada al landing.",
    icon: <Play size={17} />,
    disclaimer: "Grabaciones de diseño: muestran el motion real, no son la pantalla navegable del spec.",
    steps: [
      { title: "Banner y entrada al landing", kind: "video", note: "", props: { src: "assets/video/banner-landing.mp4", caption: "El banner del home con el timer corriendo; el tap abre el landing del concurso y de ahí a las tiendas participantes de hoy." }, hotspots: [] },
      { title: "Banner del ganador", kind: "video", note: "", props: { src: "assets/video/banner-ganador.mp4", caption: "El banner de ganador en el home y el tap que lleva a Resultados con el boleto ganador." }, hotspots: [] },
    ],
  },
  {
    id: "ctx-rest-chip", group: "context", ctx: { area: "existing", screen: "rest-home", render: "Chips" },
    label: "Rest home", short: "Chips",
    description: "Chip de la categoría Tesla en la fila de categorías del home de restaurantes.",
    icon: <Sparkles size={17} />,
    steps: [
      { title: "Único estado", kind: "rest", note: "", props: { focus: "chip" }, hotspots: [{ label: "Chip Tesla", desc: "Segunda posición de la primera fila. Deeplink al hub del concurso. No tiene otros estados." }] },
    ],
  },
  {
    id: "ctx-rest-banner", group: "context", ctx: { area: "existing", screen: "rest-home", render: "Banner" },
    label: "Rest home", short: "Banner",
    description: "Banner chico del concurso dentro del home de restaurantes.",
    icon: <Home size={17} />,
    steps: [
      { title: "Único estado · timer", kind: "rest", note: "", props: { focus: "banner" }, hotspots: [{ label: "Banner del concurso", desc: "Próximo sorteo cierra en: con el contador. Toda la imagen abre el hub. No tiene otros estados." }] },
    ],
  },
  {
    id: "ctx-rest-section", group: "context", ctx: { area: "existing", screen: "rest-home", render: "Carrusel" },
    label: "Rest home", short: "Carrusel",
    description: "Sección Gana boletos en estas tiendas con el carrusel de tiendas participantes.",
    icon: <Store size={17} />,
    steps: [
      { title: "Sorteo activo", kind: "rest", note: "", props: { focus: "carousel" }, hotspots: [{ label: "Gana boletos en estas tiendas", desc: "Header con el logo Tesla y carrusel de tiendas participantes. El header abre el hub; cada tienda abre su storefront." }] },
      { title: "Agotado", kind: "rest", note: "", props: { focus: "carousel", soldOut: true }, hotspots: [{ label: "Gana boletos en estas tiendas", desc: "El carrusel se mantiene, pero las tiendas ya no muestran el tag: hoy no se emiten más boletos." }] },
    ],
  },
  {
    id: "ctx-rest-tag", group: "context", ctx: { area: "existing", screen: "rest-home", render: "Store cards" },
    label: "Rest home", short: "Store cards",
    description: "El tag Boleto Tesla aplica a las cards de los carruseles genéricos y a la card de tienda grande.",
    icon: <Ticket size={17} />,
    disclaimer: "El tag solo aparece en las tiendas que participan en el sorteo de hoy; las demás cards quedan iguales.",
    steps: [
      { title: "Sorteo activo", kind: "rest", note: "", props: { focus: "cards" }, hotspots: [{ label: "Tag Boleto Tesla", desc: "Aplica a la card de tienda grande de la sección Tesla y a las cards de los carruseles genéricos de restaurantes." }] },
      { title: "Agotado", kind: "rest", note: "", props: { focus: "cards", soldOut: true }, hotspots: [{ label: "Sin tag", desc: "Si se terminaron los boletos del día, el tag desaparece de todas las cards; la card queda igual a cualquier otra tienda." }] },
    ],
  },
  {
    id: "ctx-search-banner", group: "context", ctx: { area: "existing", screen: "search", render: "Banner Tesla" },
    label: "Search", short: "Banner",
    description: "Banner de Tesla intercalado en los resultados de búsqueda.",
    icon: <Search size={17} />,
    steps: [
      { title: "Con timer", kind: "search", note: "", hotspots: [{ label: "Banner Tesla", desc: "Un Tesla al día con el contador. Deeplink al hub del concurso." }] },
    ],
  },
  {
    id: "ctx-search-tag", group: "context", ctx: { area: "existing", screen: "search", render: "Tag Boleto Tesla" },
    label: "Search", short: "Tag",
    description: "Tag Boleto Tesla en las tiendas participantes de los resultados.",
    icon: <Ticket size={17} />,
    steps: [
      { title: "Con tag", kind: "search", note: "", hotspots: [{ label: "Tag Boleto Tesla", desc: "Debajo del nombre y la metadata de cada tienda participante." }] },
      { title: "Agotado · sin tag", kind: "search", note: "", props: { soldOut: true }, hotspots: [{ label: "Sin tag", desc: "Si se terminaron los boletos del día, el tag desaparece de los resultados." }] },
    ],
  },
  {
    id: "ctx-store-join", group: "context", ctx: { area: "existing", screen: "rest-store", render: "Modal T&C" },
    label: "Rest store detail", short: "Modal T&C",
    description: "Modal de opt-in con las bases del sorteo al entrar a una tienda participante.",
    icon: <CircleHelp size={17} />,
    steps: [
      { title: "Acepto participar", kind: "store", note: "", props: { phase: "join" }, hotspots: storeJoinHotspots },
      { title: "Se terminaron", kind: "store", note: "", props: { phase: "join", soldOut: true }, hotspots: storeSoldHotspots },
    ],
  },
  {
    id: "ctx-store-badge", group: "context", ctx: { area: "existing", screen: "rest-store", render: "Badge en header" },
    label: "Rest store detail", short: "Badge en header",
    description: "Badge Boleto Tesla sobre la portada de la tienda.",
    icon: <Ticket size={17} />,
    steps: [
      { title: "Único estado", kind: "store", note: "", props: { phase: "store", focus: "badge" }, hotspots: [{ label: "Badge Boleto Tesla", desc: "Abajo a la derecha de la portada. Marca que la tienda emite boleto hoy; es informativo, no abre nada. No tiene otros estados." }] },
    ],
  },
  {
    id: "ctx-store-offer", group: "context", ctx: { area: "existing", screen: "rest-store", render: "Offer card + pantalla interna" },
    label: "Rest store detail", short: "Offer card",
    description: "Offer card del beneficio en la tienda y la pantalla interna que abre.",
    icon: <Gift size={17} />,
    steps: [
      { title: "Offer card", kind: "store", note: "", props: { phase: "store", focus: "offer" }, hotspots: [{ label: "1 Boleto Tesla", desc: "Primera offer card de la tienda, con el mínimo y el progreso. Abre la pantalla interna del beneficio." }] },
      { title: "Pantalla interna", kind: "store", note: "", props: { phase: "offer" }, hotspots: storeOfferHotspots },
    ],
  },
  {
    id: "ctx-cart-bar-store", group: "context", ctx: { area: "existing", screen: "cart", render: "Barra en tienda" },
    label: "Canasta", short: "Barra en tienda",
    description: "Barra de progreso del boleto en el dock de la tienda.",
    icon: <ShoppingBag size={17} />,
    disclaimer: "El boleto se desbloquea al llegar al MOV de la tienda ($80).",
    steps: [
      { title: "Sin agregar producto", kind: "store", note: "", props: { phase: "store", focus: "bar", qty: 0 }, hotspots: [{ label: "Barra del boleto", desc: "Progreso en cero: 1 Boleto Tesla y Agrega $80 más para conseguirlo. Abre la pantalla interna de la barra." }] },
      { title: "A mitad de MOV", kind: "store", note: "", props: { phase: "store", focus: "bar", qty: 2 }, hotspots: [{ label: "Barra del boleto", desc: "Con $40 en canasta la barra va a la mitad y el copy actualiza cuánto falta." }] },
      { title: "MOV completado", kind: "store", note: "", props: { phase: "store", focus: "bar", qty: 4 }, hotspots: [{ label: "Barra del boleto", desc: "Al llegar a $80 la barra se llena, celebra y pasa a ¡Conseguiste tu beneficio!" }] },
    ],
  },
  {
    id: "ctx-cart-bar", group: "context", ctx: { area: "existing", screen: "cart", render: "Barra en canasta" },
    label: "Canasta", short: "Barra en canasta",
    description: "La misma barra de progreso dentro de la canasta.",
    icon: <ShoppingBag size={17} />,
    disclaimer: "El boleto se desbloquea al llegar al MOV de la tienda ($80).",
    steps: [
      { title: "Sin agregar producto", kind: "store", note: "", props: { phase: "cart", focus: "bar", qty: 0 }, hotspots: [{ label: "Barra del boleto", desc: "Progreso en cero: el pedido todavía no suma para el boleto." }] },
      { title: "A mitad de MOV", kind: "store", note: "", props: { phase: "cart", focus: "bar", qty: 2 }, hotspots: [{ label: "Barra del boleto", desc: "Con $40 en canasta la barra va a la mitad y el copy indica cuánto falta." }] },
      { title: "MOV completado", kind: "store", note: "", props: { phase: "cart", focus: "bar", qty: 4 }, hotspots: [{ label: "Barra del boleto", desc: "Con $80 el boleto queda asegurado para el pedido." }] },
    ],
  },
  {
    id: "ctx-cart-bar-detail", group: "context", ctx: { area: "existing", screen: "cart", render: "Pantalla interna de barra" },
    label: "Canasta", short: "Pantalla interna",
    description: "Completa y ahorra: el detalle de beneficios que abre la barra.",
    icon: <Gift size={17} />,
    steps: [
      { title: "A mitad de MOV", kind: "store", note: "", props: { phase: "store", focus: "bar", qty: 2, benefits: true }, hotspots: [{ label: "Beneficios por desbloquear", desc: "Lista de beneficios con el monto de cada uno: envío gratis Pro en $50 y 1 Boleto Tesla en $80." }] },
      { title: "MOV completado", kind: "store", note: "", props: { phase: "store", focus: "bar", qty: 4, benefits: true }, hotspots: [{ label: "Beneficios desbloqueados", desc: "Con $80 los dos beneficios quedan aplicados y el boleto confirmado." }] },
    ],
  },
  {
    id: "ctx-checkout-banner", group: "context", ctx: { area: "existing", screen: "checkout", render: "Banner" },
    label: "Checkout", short: "Banner",
    description: "Banner del concurso en el checkout, arriba del método de pago.",
    icon: <CreditCard size={17} />,
    steps: [
      { title: "Aceptó T&C previamente", kind: "store", note: "", props: { phase: "checkout", focus: "banner" }, hotspots: [{ label: "Beneficio activado", desc: "Ya aceptó las bases en la tienda: el banner solo confirma que al recibir el pedido gana 1 boleto. Es informativo, no abre nada." }] },
      { title: "No aceptó T&C previamente", kind: "store", note: "", props: { phase: "checkoutAsk", focus: "banner" }, hotspots: [{ label: "¿Quieres participar?", desc: "Toda la imagen es el CTA: acepta las bases y activa el boleto en esta orden. Sin aceptar, las vistas siguientes no muestran Tesla." }] },
    ],
  },
  {
    id: "ctx-tracking-card", group: "context", ctx: { area: "existing", screen: "tracking", render: "Banner" },
    label: "Order tracking", short: "Banner",
    description: "Banner del boleto en el tracking del pedido.",
    icon: <ShoppingBag size={17} />,
    disclaimer: "Único estado: el banner es igual en las dos pantallas del tracking.",
    steps: [
      { title: "OT - Creada", kind: "store", note: "", props: { phase: "created" }, hotspots: createdHotspots },
      { title: "OT - En camino", kind: "store", note: "", props: { phase: "transit" }, hotspots: transitHotspots },
    ],
  },
  {
    id: "ctx-tracking-rt", group: "context", ctx: { area: "existing", screen: "tracking", render: "RT en Tesla" },
    label: "Order tracking", short: "RT en Tesla",
    description: "Con el pedido en camino, el repartidor se muestra como un Tesla en el mapa.",
    icon: <MapPin size={17} />,
    steps: [
      { title: "Único estado", kind: "store", note: "", props: { phase: "transit", focus: "rt" }, hotspots: [{ label: "RT en Tesla", desc: "El marcador del RT en el mapa se reemplaza por un Tesla mientras el pedido va en camino. Es decorativo, no abre nada. No tiene otros estados." }] },
    ],
  },
  {
    id: "ctx-tracking-cancel", group: "context", ctx: { area: "existing", screen: "tracking", render: "Modal pedido cancelado" },
    label: "Order tracking", short: "Cancelado",
    description: "Si el pedido se cancela antes de entregarse, no se emite boleto.",
    icon: <X size={17} />,
    steps: [
      { title: "Pedido cancelado", kind: "cancelled", note: "", hotspots: [{ label: "Entendido", desc: "Cierra el aviso. Este pedido no da boleto." }] },
    ],
  },
  {
    id: "ctx-rescue", group: "context", ctx: { area: "existing", screen: "rescue", render: "Banner" },
    label: "Rescue screen", short: "Banner",
    description: "Banner del boleto ganado en la rescue screen del pedido entregado.",
    icon: <Gift size={17} />,
    steps: [
      { title: "Único estado", kind: "store", note: "", props: { phase: "delivered" }, hotspots: [{ label: "¡Ganaste 1 boleto Tesla!", desc: "Aparece al entregarse el pedido y abre la confirmación del boleto. No tiene otros estados." }] },
    ],
  },
  {
    id: "ctx-rescue-motion", group: "context", ctx: { area: "existing", screen: "rescue", render: "Animación" },
    label: "Rescue screen", short: "Animación",
    description: "Motion de la entrega del boleto: rescue screen, captura de datos y detalle del boleto.",
    icon: <Play size={17} />,
    disclaimer: "Grabación de diseño: muestra el motion real, no es la pantalla navegable del spec.",
    steps: [
      { title: "Entrega del boleto", kind: "video", note: "", props: { src: "assets/video/entrega-boleto.mp4", caption: "Pedido entregado, ¡Ganaste 1 boleto!, confirmación de nombre y teléfono, y el detalle del boleto emitido." }, hotspots: [] },
    ],
  },
  {
    id: "ctx-capture-form", group: "context", ctx: { area: "new", screen: "capture", render: "Formulario del ganador" },
    label: "Captura de datos", short: "Formulario",
    description: "Recolección de datos del ganador con los campos precargados.",
    icon: <User size={17} />,
    steps: [
      { title: "Recolección de datos", kind: "won", note: "", hotspots: wonHotspots },
    ],
  },
  {
    id: "ctx-capture-confirm", group: "context", ctx: { area: "new", screen: "capture", render: "Confirmación de datos" },
    label: "Captura de datos", short: "Confirmación",
    description: "Sheet de confirmación de los datos del ganador.",
    icon: <Check size={17} />,
    steps: [
      { title: "Confirmar datos", kind: "confirm", note: "", hotspots: confirmHotspots },
    ],
  },
  {
    id: "ctx-inapp-onboarding", group: "context", ctx: { area: "new", screen: "inapp", render: "Onboarding" },
    label: "Fullscreen Native InApp", short: "Onboarding",
    description: "In-app fullscreen que presenta el concurso al entrar a Rappi.",
    icon: <Sparkles size={17} />,
    steps: [
      {
        title: "Único estado", kind: "intro", note: "",
        hotspots: [
          { label: "Conocer más", desc: "Abre el hub del concurso." },
          { label: "Entendido", desc: "Cierra el in-app y deja el home con el banner. No tiene otros estados." },
        ],
      },
    ],
  },
  {
    id: "ctx-inapp-winner", group: "context", ctx: { area: "new", screen: "inapp", render: "Ganador" },
    label: "Fullscreen Native InApp", short: "Ganador",
    description: "In-app fullscreen que avisa al usuario que ganó el Tesla del día.",
    icon: <Gift size={17} />,
    steps: [
      {
        title: "Único estado", kind: "winintro", note: "",
        hotspots: [
          { label: "Cerrar", desc: "Cierra el in-app y va al home ganador." },
          { label: "Compartir", desc: "Cierra el in-app. El share es informativo por ahora. No tiene otros estados." },
        ],
      },
    ],
  },
  {
    id: "place-onboarding", group: "placements", label: "Onboarding / in-app", short: "Onboarding",
    description: "Estados de la pantalla de onboarding fullscreen.",
    icon: <Sparkles size={17} />,
    steps: [
      { title: "Onboarding fullscreen", kind: "intro", note: "", hotspots: [{ label: "Conocer más", desc: "Abre el hub / landing del concurso." }, { label: "Entendido", desc: "Cierra el in-app." }] },
      {
        title: "In-app ganaste el Tesla", kind: "winintro", note: "",
        hotspots: [
          { label: "Cerrar", desc: "Cierra el in-app y va al home ganador." },
          { label: "Compartir", desc: "Cierra el in-app. El share es informativo por ahora." },
        ],
      },
    ],
  },
  {
    id: "place-banner", group: "placements", label: "Banner home", short: "Banner",
    description: "Mismos estados del banner: grande y, si aplica, chico.",
    icon: <Home size={17} />,
    steps: [
      { title: "Grande · vacío", kind: "home2", note: "", props: { empty: true }, hotspots: [{ label: "Banner", desc: "Home grande, sin boletos." }] },
      { title: "Grande · boletos", kind: "home2", note: "", props: { tickets: true }, hotspots: homeTicketsNav },
      { title: "Grande · en vivo", kind: "home2", note: "", props: { live: true }, hotspots: homeLiveNav },
      { title: "Grande · resultados", kind: "home2", note: "", props: { results: true }, hotspots: homeResultsNav },
      { title: "Grande · primer sorteo", kind: "home2", note: "", props: { first: true }, hotspots: [{ label: "Banner", desc: "Próximo / primer sorteo." }] },
      { title: "Grande · último sorteo", kind: "home2", note: "", props: { last: true }, hotspots: [{ label: "Banner", desc: "Próximo sorteo cierra en:" }] },
      { title: "Grande · ganador", kind: "home2", note: "", props: { winner: true }, hotspots: [{ label: "Banner", desc: "¡Ganaste el Tesla del sorteo N°5!" }] },
      { title: "Grande · agotado", kind: "home2", note: "", props: { soldOut: true }, hotspots: [{ label: "Banner", desc: "Se terminaron los boletos." }] },
      { title: "Grande · sin cobertura", kind: "home2", note: "", props: { noCoverage: true }, hotspots: [{ label: "Banner", desc: "Sin tiendas en esta dirección." }] },
      { title: "Grande · terminada", kind: "home2", note: "", props: { ended: true }, hotspots: [{ label: "Banner", desc: "Los sorteos han terminado." }] },
      { title: "Chico · vacío", kind: "home2", note: "", props: { empty: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Cada día alguien se lleva un Tesla®." }] },
      { title: "Chico · boletos", kind: "home2", note: "", props: { tickets: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Tus boletos sorteo de mañana." }] },
      { title: "Chico · en vivo", kind: "home2", note: "", props: { live: true, small: true }, hotspots: [{ label: "Banner chico", desc: "¡El sorteo de hoy está en curso! Abre el hub." }] },
      { title: "Chico · resultados", kind: "home2", note: "", props: { results: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Resultados último sorteo." }] },
      { title: "Chico · primer sorteo", kind: "home2", note: "", props: { first: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Próximo / primer sorteo." }] },
      { title: "Chico · último", kind: "home2", note: "", props: { last: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Próximo sorteo cierra en:" }] },
      { title: "Chico · ganador", kind: "home2", note: "", props: { winner: true, small: true }, hotspots: [{ label: "Banner chico", desc: "¡Ganaste el Tesla del sorteo N°5!" }] },
      { title: "Chico · agotado", kind: "home2", note: "", props: { soldOut: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Se terminaron los boletos." }] },
      { title: "Chico · sin cobertura", kind: "home2", note: "", props: { noCoverage: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Aún no hay tiendas en esta dirección." }] },
      { title: "Chico · terminada", kind: "home2", note: "", props: { ended: true, small: true }, hotspots: [{ label: "Banner chico", desc: "Los sorteos han terminado." }] },
    ],
  },
  {
    id: "ctx-hub-hero", group: "context", ctx: { area: "new", screen: "hub", render: "Header" },
    label: "Hub", short: "Header",
    description: "Cabecera del hub: el Tesla, el timer y el estado de la campaña.",
    icon: <Sparkles size={17} />,
    steps: [
      { title: "Campaña activa", kind: "chub", note: "", props: { tickets: true, focus: "header" }, hotspots: [{ label: "Header", desc: "Un Tesla al día con el timer del próximo sorteo y el conteo de Teslas sorteados." }] },
      { title: "Primer sorteo", kind: "chub", note: "", props: { first: true, focus: "header" }, hotspots: [{ label: "Header", desc: "Antes de arrancar la campaña: primer sorteo el 16 de Octubre y aún no hay Teslas sorteados." }] },
      { title: "Último sorteo", kind: "chub", note: "", props: { last: true, tickets: true, focus: "header" }, hotspots: [{ label: "Header", desc: "Cierre de campaña: último sorteo cierra en y ya sorteamos 40 Teslas." }] },
      { title: "En vivo", kind: "chub", note: "", props: { live: true, tickets: true, focus: "header" }, hotspots: [{ label: "Header", desc: "Con el sorteo en curso el header se mantiene igual; el acceso al vivo vive en el render de resultados." }] },
      { title: "Agotado", kind: "chub", note: "", props: { soldOut: true, tickets: true, focus: "header" }, hotspots: [{ label: "Header", desc: "Se terminaron los boletos del día: el header cambia el copy y quita el CTA." }] },
      { title: "Campaña terminada", kind: "chub", note: "", props: { ended: true, tickets: true, focus: "header" }, hotspots: [{ label: "Header", desc: "Sin timer y con ¡Ya sorteamos este Tesla!: los sorteos han terminado." }] },
    ],
  },
  {
    id: "ctx-hub-results", group: "context", ctx: { area: "new", screen: "hub", render: "Resultados" },
    label: "Hub", short: "Resultados",
    description: "Fila de acceso a resultados y sorteos anteriores.",
    icon: <Trophy size={17} />,
    steps: [
      { title: "Normal", kind: "chub", note: "", props: { tickets: true, focus: "results" }, hotspots: [{ label: "Ver resultados y sorteos anteriores", desc: "Abre el listado de sorteos ya realizados. El subtítulo cuenta los Teslas sorteados." }] },
      {
        title: "Con sorteo en vivo", kind: "chub", note: "", props: { live: true, tickets: true, focus: "results" },
        hotspots: [
          { label: "Ver resultados y sorteos anteriores", desc: "Misma fila de acceso a los sorteos ya realizados." },
          { label: "Ver sorteo N°5 en VIVO", desc: "Solo mientras el sorteo está en curso: aparece debajo y abre el video del sorteo." },
        ],
      },
    ],
  },
  {
    id: "ctx-hub-stores", group: "context", ctx: { area: "new", screen: "hub", render: "Tiendas" },
    label: "Hub", short: "Tiendas",
    description: "Bloque de tiendas participantes del hub y sus vacíos.",
    icon: <Store size={17} />,
    steps: [
      {
        title: "Con contenido", kind: "chub", note: "", props: { tickets: true, focus: "stores" },
        hotspots: [
          { label: "Pide y gana boletos", desc: "Abre el listado completo de tiendas participantes de hoy." },
          { label: "Card de tienda", desc: "Cada card abre el storefront. Muestra el tag Boleto Tesla y el mínimo de compra." },
          { label: "Ver todas las tiendas participantes", desc: "Abre el listado completo de tiendas de hoy." },
        ],
      },
      { title: "Sin contenido disponible", kind: "chub", note: "", props: { noStoresDay: true, tickets: true, focus: "stores" }, hotspots: [{ label: "Vacío sin tiendas hoy", desc: "Hoy no hay tiendas participantes en tu zona, regresa mañana. El título deja de ser accionable y no hay carrusel." }] },
      { title: "Sin cobertura", kind: "chub", note: "", props: { noCoverage: true, tickets: true, focus: "stores" }, hotspots: [{ label: "Vacío sin cobertura", desc: "Aún no hay tiendas para ganar boletos en esta dirección, espéralo próximamente." }] },
    ],
  },
  {
    id: "ctx-hub-tickets", group: "context", ctx: { area: "new", screen: "hub", render: "Mis boletos" },
    label: "Hub", short: "Mis boletos",
    description: "Bloque de boletos del hub con los chips de sorteo de mañana y de hoy.",
    icon: <Ticket size={17} />,
    steps: [
      { title: "Primera vez: no se muestra", kind: "chub", note: "", props: { focus: "tickets" }, hotspots: [{ label: "Bloque no visible", desc: "La primera vez que entras, sin ningún boleto ganado, el bloque no existe: el hub pasa directo de resultados a tiendas." }] },
      {
        title: "Con boletos", kind: "chub", note: "", props: { tickets: true, focus: "tickets" },
        hotspots: [
          { label: "Mis boletos", desc: "Toda la fila abre el listado completo de tus boletos." },
          { label: "Chips de sorteo", desc: "Filtran los boletos entre sorteo de mañana y sorteo de hoy." },
          { label: "Cada boleto", desc: "Abre el detalle del boleto correspondiente." },
        ],
      },
      {
        title: "Sin boletos de ese sorteo", kind: "chub", note: "", props: { ticketsHoy: true, focus: "tickets" },
        hotspots: [
          { label: "Mis boletos", desc: "La fila sigue igual: el bloque ya existe porque el usuario tiene boletos de otro sorteo." },
          { label: "Chips de sorteo", desc: "El chip seleccionado no tiene boletos; el otro sí los lista." },
          { label: "Gana boletos", desc: "Empty del sorteo sin boletos: aún no tienes boletos para este sorteo, con CTA a las tiendas." },
        ],
      },
    ],
  },
  {
    id: "ctx-hub-cta", group: "context", ctx: { area: "new", screen: "hub", render: "Botón CTA" },
    label: "Hub", short: "Botón CTA",
    description: "CTA principal del hub para ir a ganar boletos.",
    icon: <Ticket size={17} />,
    steps: [
      { title: "Único estado", kind: "chub", note: "", props: { tickets: true, focus: "cta" }, hotspots: [{ label: "Gana boletos", desc: "Abre el listado de tiendas participantes de hoy. No tiene otros estados; desaparece solo si se terminaron los boletos o la campaña." }] },
    ],
  },
  {
    id: "ctx-stores-list", group: "context", ctx: { area: "new", screen: "stores", render: "Listado de tiendas" },
    label: "Tiendas participantes", short: "Listado",
    description: "Tiendas que emiten boleto hoy, agrupadas por vertical.",
    icon: <Store size={17} />,
    steps: [
      { title: "Con tiendas", kind: "stores", note: "", hotspots: [{ label: "Cada tienda", desc: "Abre el storefront." }] },
    ],
  },
  {
    id: "ctx-stores-coverage", group: "context", ctx: { area: "new", screen: "stores", render: "Zonas de cobertura" },
    label: "Tiendas participantes", short: "Sin cobertura",
    description: "Mapa de zonas donde sí hay tiendas participantes.",
    icon: <MapPin size={17} />,
    steps: [
      { title: "Zonas de cobertura", kind: "stores", note: "", props: { noCoverage: true }, hotspots: [{ label: "Atrás", desc: "Mapa de zonas donde sí hay cobertura." }] },
    ],
  },
  {
    id: "ctx-stores-none", group: "context", ctx: { area: "new", screen: "stores", render: "Vacío del día" },
    label: "Tiendas participantes", short: "Sin tiendas hoy",
    description: "Hoy no hay tiendas participantes en la zona del usuario.",
    icon: <Ban size={17} />,
    steps: [
      { title: "Sin tiendas hoy", kind: "stores", note: "", props: { noStoresDay: true }, hotspots: [{ label: "Regresa mañana", desc: "Hoy no hay tiendas en tu zona." }] },
    ],
  },
  {
    id: "place-store", group: "placements", label: "Store detail", short: "Store",
    description: "Tienda, checkout, tracking del pedido y boleto ganado.",
    icon: <Store size={17} />,
    steps: [
      { title: "Badge Boleto Tesla", kind: "store", note: "", props: { phase: "store" }, hotspots: [{ label: "Boleto Tesla", desc: "Abre el detalle del beneficio." }] },
      { title: "Modal T&C", kind: "store", note: "", props: { phase: "join" }, hotspots: storeJoinHotspots },
      { title: "Modal se terminaron", kind: "store", note: "", props: { phase: "join", soldOut: true }, hotspots: storeSoldHotspots },
      { title: "Pantalla internal global offer card", kind: "store", note: "", props: { phase: "offer" }, hotspots: storeOfferHotspots },
      { title: "Vista canasta", kind: "store", note: "", props: { phase: "cart" }, hotspots: cartHotspots },
      { title: "Vista checkout · ¿quieres participar?", kind: "store", note: "", props: { phase: "checkoutAsk" }, hotspots: checkoutAskHotspots },
      { title: "Checkout · se terminaron", kind: "store", note: "", props: { phase: "checkout", soldOut: true }, hotspots: checkoutSoldHotspots },
      ...orderFlowSteps,
    ],
  },
  {
    id: "place-order", group: "placements", label: "Pedido", short: "Pedido",
    description: "Tracking del pedido y boleto Tesla al entregar.",
    icon: <ShoppingBag size={17} />,
    steps: [
      ...orderFlowSteps,
      { title: "Pedido cancelado", kind: "cancelled", note: "", hotspots: [{ label: "Entendido", desc: "Este pedido no da boleto." }] },
    ],
  },
  {
    id: "ctx-boletos-list", group: "context", ctx: { area: "new", screen: "boletos", render: "Pantalla completa" },
    label: "Mis boletos", short: "Pantalla",
    description: "Boletos del usuario filtrados por sorteo.",
    icon: <Ticket size={17} />,
    disclaimer: "Pendiente: listar los renders en los que queramos dividir esta pantalla.",
    steps: [
      { title: "Con boletos", kind: "boletos", note: "", hotspots: boletosHotspots },
      { title: "Vacío", kind: "boletos", note: "", props: { emptyManana: true }, hotspots: boletosEmptyHotspots },
      { title: "Agotado", kind: "boletos", note: "", props: { soldOut: true }, hotspots: [{ label: "Atrás", desc: BACK_PREV }, { label: "Chips de sorteo", desc: "Filtran los boletos por sorteo. Sin CTA para ganar más: ya no se emiten boletos hoy." }, { label: "Cada boleto", desc: "Los boletos acumulados siguen participando en el sorteo." }] },
    ],
  },
  {
    id: "ctx-results-ticket", group: "context", ctx: { area: "new", screen: "results", render: "Boleto ganador" },
    label: "Resultados", short: "Boleto ganador",
    description: "Boleto ganador del sorteo y estado de la entrega del Tesla.",
    icon: <Trophy size={17} />,
    steps: [
      { title: "Ganó otra persona", kind: "prevresults", note: "", hotspots: resultsHotspots },
      { title: "Tú ganaste el Tesla", kind: "prevresults", note: "", props: { winner: true }, hotspots: [{ label: "3321-H", desc: "Rappi te contactará." }] },
      { title: "Tesla entregado", kind: "prevresults", note: "", props: { delivered: true }, hotspots: [{ label: "Gana boletos", desc: "¡Ya entregamos este Tesla!" }] },
    ],
  },
  {
    id: "ctx-results-live", group: "context", ctx: { area: "new", screen: "results", render: "Sorteo en vivo" },
    label: "Resultados", short: "En vivo",
    description: "Mientras el sorteo corre, el video va embebido en esta misma pantalla.",
    icon: <Play size={17} />,
    steps: [
      { title: "Video en vivo", kind: "prevresults", note: "", props: { live: true }, hotspots: liveResultsHotspots },
    ],
  },
];

const contextTree: { area: ContextArea; label: string; screens: { id: string; label: string }[] }[] = [
  {
    area: "existing", label: "Intervención en existentes",
    screens: [
      { id: "home", label: "Home" },
      { id: "rest-home", label: "Rest home" },
      { id: "search", label: "Search" },
      { id: "rest-store", label: "Rest store detail" },
      { id: "cart", label: "Canasta" },
      { id: "checkout", label: "Checkout" },
      { id: "tracking", label: "Order tracking" },
      { id: "rescue", label: "Rescue screen" },
    ],
  },
  {
    area: "new", label: "Nuevos contextos",
    screens: [
      { id: "hub", label: "Hub" },
      { id: "results", label: "Resultados" },
      { id: "boletos", label: "Mis boletos" },
      { id: "stores", label: "Tiendas participantes" },
      { id: "capture", label: "Captura de datos" },
      { id: "inapp", label: "Fullscreen Native InApp" },
    ],
  },
];

const ticketCodes = ["4311-A", "3762-J", "5362-P", "5212-O", "1232-M", "1232-L"];
const stores = [
  ["Nonna", "3"], ["Green Grass", "5"], ["Starbucks", "7"],
  ["Mora Mora Turbo", "8"], ["Massima", "9"], ["Green House", "10"],
  ["Tierra Garat", "11"], ["Shaka Café", "12"], ["Ice cream nation", "13"],
  ["Costco", "14"], ["Chedraui selecto", "15"], ["Green House", "17"],
];

function StatusBar() {
  return <div className="status"><b>9:41</b><div className="island" /><div className="signal">▮▮▮ ᯤ ▰</div></div>;
}

function TopBar({ title, back = true }: { title: string; back?: boolean }) {
  return <><StatusBar /><div className="topbar">
    {back ? <button className="icon-button" aria-label="Volver"><ChevronLeft /></button> : <div className="rappi-mark">R</div>}
    <strong>{title}</strong>
    <button className="icon-button" aria-label="Ayuda"><CircleHelp /></button>
  </div></>;
}

function TeslaVisual({ compact = false, winner = false }: { compact?: boolean; winner?: boolean }) {
  const source = winner ? "assets/figma/tesla-winner.png" : compact ? "assets/figma/tesla-white-side.png" : "assets/figma/tesla-black-front.png";
  return <div className={`tesla-visual ${compact ? "compact" : ""} ${winner ? "winner" : ""}`}>
    <img src={source} alt={winner ? "Tesla negro de frente" : compact ? "Tesla blanco de perfil" : "Tesla negro de frente"} />
    {!compact && !winner && <div className="blue-glow" />}
  </div>;
}

function Timer() {
  return <div className="timer">
    <div><b>05</b><small>HORAS</small></div><i>:</i>
    <div><b>11</b><small>MIN</small></div><i>:</i>
    <div><b>22</b><small>SEG</small></div>
  </div>;
}

function TicketCard({ code, dim = false, onClick }: { code: string; dim?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`ticket-card ${dim ? "dim" : ""} ${onClick ? "is-hotspot" : ""}`}>
    <span>Boleto N°</span><strong>{code}</strong><small>Sanamente gourmet</small>
    <em>Sorteo N°6</em><span className="ticket-tesla">T E S L A</span>
  </button>;
}

function PrimaryButton({ children, onClick, hotspot = true }: React.PropsWithChildren<{ onClick: () => void; hotspot?: boolean }>) {
  return <button className={`primary ${hotspot ? "is-hotspot" : ""}`} onClick={onClick}>
    {children}<ArrowRight size={18} />
  </button>;
}

function HomeScreen({ next, props }: { next: () => void; props?: Step["props"] }) {
  const empty = !!props?.empty, noStores = !!props?.noStores;
  return <div className="screen white">
    <StatusBar />
    <div className="home-nav"><div className="avatar">A</div><div><small>Entregar en</small><b>Casa <ChevronDown size={13} /></b></div><div className="home-actions"><Menu /><ShoppingBag /></div></div>
    <div className="search">¿Qué se te antoja hoy?</div>
    <div className="categories"><span>🍔<small>Restaurantes</small></span><span>🛒<small>Mercado</small></span><span>⚡<small>Turbo</small></span><span>💊<small>Farmacia</small></span></div>
    <button className="home-tesla is-hotspot" onClick={next}>
      <TeslaVisual compact />
      <div className="banner-copy">
        <span className="eyebrow">UN TESLA AL DÍA</span>
        {noStores ? <><b>Aún no hay tiendas para ganar boletos</b><small>en esta dirección</small></> :
          empty ? <><b>Tus boletos sorteo de mañana</b><small>Aún no tienes boletos para este sorteo</small></> :
          <><b>Tienes 6 boletos para mañana</b><small>Entre más pedidos, más oportunidades</small></>}
      </div>
      <ChevronRight size={18} />
    </button>
    <div className="section-title"><b>Lo mejor cerca de ti</b><span>Ver todos</span></div>
    <div className="food-cards"><div>🥗<b>Healthy</b><small>20–30 min</small></div><div>🍕<b>Pizza</b><small>15–25 min</small></div></div>
    <div className="bottom-nav"><span className="active"><Home />Inicio</span><span><Store />Tiendas</span><span><Ticket />Mis pedidos</span></div>
  </div>;
}

function HubScreen({ next, props }: { next: () => void; props?: Step["props"] }) {
  const empty = !!props?.empty, noStores = !!props?.noStores;
  return <div className="screen campaign">
    <TopBar title="Un Tesla al día" />
    <div className="hero">
      <TeslaVisual />
      <div className="hero-copy"><span>UN TESLA AL DÍA</span><h1>Todos los días.<br />Por el resto del año.</h1></div>
      <div className="countdown"><small>Próximo sorteo cierra en:</small><Timer /></div>
    </div>
    <div className="hub-body">
      <div className="segmented"><button className="active">Mis boletos</button><button>Resultados</button><button>Cómo funciona</button></div>
      {empty || noStores ? <div className="empty-card">
        <div className="empty-icon">{noStores ? <MapPin /> : <Ticket />}</div>
        <b>{noStores ? "Aún no hay tiendas para ganar boletos en esta dirección" : "Aún no tienes boletos para este sorteo"}</b>
        <small>{noStores ? "Prueba con otra ubicación para encontrar tiendas." : "Haz un pedido elegible y recibe tu primer boleto."}</small>
      </div> : <><h3>Mis boletos</h3><div className="ticket-row"><TicketCard code="4311-A" onClick={next} /><TicketCard code="3762-J" onClick={next} /></div></>}
      <PrimaryButton onClick={next}>{noStores ? "Cambiar dirección" : empty ? "Ver tiendas" : "Ver mis boletos"}</PrimaryButton>
    </div>
  </div>;
}

function TicketsScreen({ next, props }: { next: () => void; props?: Step["props"] }) {
  return <div className="screen white">
    <TopBar title="Mis boletos" />
    <div className="filter-row"><button className="selected">Sorteo de hoy</button><button>Mañana</button><button>Anteriores</button></div>
    <div className="tickets-header"><div><span>{props?.today ? "Tus boletos del sorteo de hoy" : "Tus boletos sorteo de mañana"}</span><b>{props?.capped ? "Estos boletos participarán en el sorteo" : "Sorteo hoy a las 14:00"}</b></div><div className="ticket-count">6</div></div>
    {props?.capped && <div className="warning"><Info /> No podrás ganar boletos adicionales hoy.</div>}
    <div className="ticket-grid">{ticketCodes.map(code => <TicketCard key={code} code={code} onClick={next} />)}</div>
    {!props?.capped && <div className="docked"><PrimaryButton onClick={next}>Explorar tiendas</PrimaryButton></div>}
  </div>;
}

function StoresScreen({ next, props }: { next: () => void; props?: Step["props"] }) {
  if (props?.location) return <div className="screen white"><TopBar title="Elige una dirección" />
    <div className="map-bg"><div className="map-pin"><MapPin /></div></div>
    <div className="location-sheet"><span className="handle" /><h2>¿Dónde quieres recibir?</h2><div className="address"><MapPin /><div><b>Casa</b><small>Av. Paseo de la Reforma 222</small></div><Check /></div><PrimaryButton onClick={next}>Usar ubicación actual</PrimaryButton></div>
  </div>;
  return <div className="screen white"><TopBar title="Tiendas participantes" />
    <div className="stores-intro"><TeslaVisual compact /><div><span>HOY</span><b>Gana boletos en estas tiendas</b><small>Pedido mínimo indicado en cada tienda</small></div></div>
    <div className="store-grid">{stores.map(([name, image]) => <button onClick={next} className="store-item is-hotspot" key={`${name}-${image}`}>
      <div><img src={`assets/figma/store-${image}.png`} alt={`Logo de ${name}`} /></div><b>{name}</b><small>Min: $80</small>
    </button>)}</div>
  </div>;
}

function DrawVideo({ playing, onPlay, live, n }: { playing?: boolean; onPlay?: () => void; live?: boolean; n: number }) {
  return <button type="button" className={`res-vid${live ? " is-live" : ""}${playing ? " is-on" : ""} is-hotspot`} onClick={onPlay} aria-label={live ? "Abrir sorteo en YouTube" : "Replay del sorteo"}>
    <img src="assets/figma/live-video.png" alt="" width={live ? 258 : 186} height={live ? 133 : 96} />
    {!playing && <span className="res-vid-play" aria-hidden="true"><Play size={live ? 20 : 16} fill="currentColor" /></span>}
    <HotNum n={n} />
  </button>;
}

function VideoScreen({ src }: { src: string }) {
  const el = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const toggle = () => {
    const v = el.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const replay = () => {
    const v = el.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setPlaying(true);
  };
  return <div className="screen video-screen">
    <video ref={el} src={src} autoPlay muted loop playsInline onClick={toggle} />
    <div className="video-controls">
      <button type="button" onClick={toggle}>{playing ? "Pausar" : "Reproducir"}</button>
      <button type="button" onClick={replay} aria-label="Volver a empezar"><RotateCcw size={14} /></button>
    </div>
  </div>;
}

function YoutubePlayerScreen({ back }: { back: () => void }) {
  return <div className="yt-player">
    <img className="yt-still" src="assets/figma/youtube/still.png" alt="" width={375} height={812} />
    <StatusBar />
    <div className="yt-top">
      <button type="button" className="yt-close is-hotspot" onClick={back} aria-label="Cerrar YouTube">
        <img src="assets/figma/youtube/close.svg" alt="" width={15} height={15} />
        <HotNum n={1} />
      </button>
      <img className="yt-pip" src="assets/figma/youtube/pip.svg" alt="" width={24} height={19} />
      <img className="yt-cast" src="assets/figma/youtube/airplay.svg" alt="" width={20} height={18} />
      <img className="yt-vol" src="assets/figma/youtube/volume.svg" alt="" width={25} height={19} />
    </div>
    <div className="yt-mid">
      <img src="assets/figma/youtube/rewind.svg" alt="" width={27} height={30} />
      <img className="yt-pause" src="assets/figma/youtube/pause.svg" alt="" width={32} height={38} />
      <img src="assets/figma/youtube/forward.svg" alt="" width={27} height={30} />
    </div>
    <div className="yt-bot">
      <img className="yt-more" src="assets/figma/youtube/more.svg" alt="" width={19} height={19} />
      <div className="yt-bar" aria-hidden="true"><i /></div>
      <div className="yt-time"><span>0.01</span><span>-1.23</span></div>
    </div>
  </div>;
}

function ResultsScreen({ next, delivered }: { next: () => void; delivered?: boolean }) {
  return <div className="screen white"><TopBar title="Resultados" />
    <div className="result-hero"><TeslaVisual winner /><span className="result-date">SORTEO N°6 · 15 AGO</span></div>
    <div className="result-body">
      {delivered ? <><span className="eyebrow dark">HISTORIA DEL GANADOR</span><h1>¡Ya entregamos este Tesla!</h1><p>Esto es todos los días, en serio puedes ser tú.</p>
        <button className="delivery-video is-hotspot" onClick={next}><div className="play"><Play fill="currentColor" /></div><span>Ver la entrega</span></button></> :
        <><span className="eyebrow dark">BOLETO GANADOR DEL TESLA</span><div className="winner-ticket"><small>FOLIO GANADOR</small><strong>2311-A</strong><div><span>Pedro Atuesta</span><span>CDMX</span></div></div><p>El ganador será contactado por nuestro equipo.</p></>}
      <PrimaryButton onClick={next}>{delivered ? "Participa en el próximo sorteo" : "Ver entrega del Tesla"}</PrimaryButton>
    </div>
  </div>;
}

function DeliveryScreen({ next }: { next: () => void }) {
  return <div className="screen tracking"><StatusBar /><div className="fake-map asset-map"><img src="assets/figma/delivery-map.png" alt="Mapa del pedido entregado" /><div className="route" /><div className="courier">🛵</div><MapPin className="destination" /></div>
    <div className="tracking-card"><b>Tu pedido fue entregado</b><small>Gracias por pedir con Rappi</small></div>
    <div className="sheet"><span className="handle" /><TeslaVisual compact /><h1>¡Ganaste 1 boleto!</h1><p>Para el sorteo de mañana</p><PrimaryButton onClick={next}>Ver mi boleto</PrimaryButton></div>
  </div>;
}

function WonScreen({ next }: { next: () => void }) {
  return <div className="screen won"><TopBar title="Tu boleto" />
    <div className="confetti">✦　·　✦　·　✦</div><h1>¡Ganaste 1 boleto!</h1><p>Para el sorteo de mañana</p>
    <button className="big-ticket is-hotspot" onClick={next}><div className="ticket-notch left" /><div className="ticket-notch right" />
      <span>UN TESLA AL DÍA</span><small>BOLETO N°</small><strong>4311-A</strong><em>Sorteo N°7</em><TeslaVisual compact />
      <div className="flip"><RotateCcw /> Toca para ver detalles</div>
    </button>
    <PrimaryButton onClick={next}>Continuar</PrimaryButton>
  </div>;
}

function ConfirmScreen({ next }: { next: () => void }) {
  return <div className="screen white"><TopBar title="Confirma tus datos" /><div className="form-wrap">
    <div className="success-icon"><Ticket /></div><h1>Confirma tu nombre en el boleto</h1><p>Estos datos se usarán si tu boleto resulta ganador.</p>
    <label>Nombre completo<input defaultValue="Amaury Ali" /></label><label>Teléfono<input defaultValue="+52 55 1234 5678" /></label>
    <div className="folio"><span>Folio asignado</span><b>4311-A</b><Check /></div>
  </div><div className="docked"><PrimaryButton onClick={next}>Confirmar nombre</PrimaryButton></div></div>;
}

function OptinScreen({ next }: { next: () => void }) {
  return <div className="screen optin"><StatusBar /><TeslaVisual /><div className="optin-gradient" />
    <div className="optin-copy"><span>RAPPI PRESENTA</span><h1>Un Tesla al día.<br />Todos los días.</h1><p>Haz pedidos en tiendas participantes y recibe boletos para ganar.</p></div>
    <div className="sheet optin-sheet"><span className="handle" /><h2>Participa en el sorteo de un Tesla diario</h2><p>Al tocar “Acepto participar” aceptas los Términos y Condiciones.</p><PrimaryButton onClick={next}>Acepto participar</PrimaryButton></div>
  </div>;
}

function RulesScreen({ next }: { next: () => void }) {
  const rules = [["1", "Haz un pedido", "Compra en una tienda participante del día."], ["2", "Recibe tu pedido", "El boleto se genera cuando el pedido es entregado."], ["3", "Participa", "Cada boleto tiene un número único para el sorteo diario."]];
  return <div className="screen white"><TopBar title="Cómo participar" /><div className="rules-hero"><TeslaVisual compact /><h1>Gana un Tesla<br />todos los días</h1></div>
    <div className="rules-list">{rules.map(([n, t, d]) => <div key={n}><i>{n}</i><span><b>{t}</b><small>{d}</small></span></div>)}</div>
    <div className="terms"><b>Ten en cuenta</b><p>Entre más pedidos hagas, más oportunidades tienes de ganar. Tienes 24 horas para ganar boletos de cada sorteo.</p></div>
    <div className="docked"><PrimaryButton onClick={next}>Ver tiendas participantes</PrimaryButton></div>
  </div>;
}

function PayScreen({ next, detail }: { next: () => void; detail?: boolean }) {
  return <div className="screen pay"><StatusBar /><div className="pay-nav"><ChevronLeft /><b>RappiPay</b><CircleHelp /></div>
    <div className="pay-balance"><small>Saldo disponible</small><h1>$12,450.00</h1><div><button>Ingresar</button><button>Transferir</button><button>Retirar</button></div></div>
    <button className="pay-promo is-hotspot" onClick={next}><TeslaVisual compact /><span><small>BENEFICIO EXCLUSIVO</small><b>{detail ? "Paga con RappiPay y gana boletos" : "Hoy un premio cambia tu vida para siempre"}</b><em>Conoce más <ArrowRight /></em></span></button>
    {detail && <div className="pay-detail"><h2>Un Tesla al día</h2><p>Compra en comercios participantes, recibe tu pedido y obtén un boleto.</p><PrimaryButton onClick={next}>Participar ahora</PrimaryButton></div>}
    <div className="transactions"><h3>Movimientos recientes</h3><div>🛒 <span><b>Rappi</b><small>Hoy, 12:30</small></span><strong>-$249</strong></div><div>↙ <span><b>Transferencia recibida</b><small>Ayer</small></span><strong className="green">+$500</strong></div></div>
  </div>;
}

function CancelledScreen({ next }: { next: () => void }) {
  return (
    <div className="screen cancelled">
      <div className="can-page" aria-hidden="true">
        <img className="can-page-x" src="assets/figma/cancel/page-close.svg" alt="" width={32} height={32} />
        <h1>Pedido cancelado</h1>
        <p className="can-page-lead">
          ¡Hola Ivan!, revisé tu solicitud y la cancelación de tu pedido fue debido a que <b>hemos tenido un problema técnico dentro de nuestro sistema. ¡ Lo sentimos!</b>
        </p>
        <img className="can-page-bag" src="assets/figma/cancel/bag.png" alt="" width={80} height={80} />
        <p className="can-page-charge">Aplicamos un cargo que cubre los gastos del estado actual de tu pedido. En caso de haber una diferencia haremos el reembolso en tu método seleccionado.</p>
        <div className="can-page-total"><span>Cargo total</span><strong>$115</strong></div>
        <p className="can-page-pay">Aplicamos el cobro en tu método de pago.</p>
        <div className="can-page-dock">Entendido</div>
      </div>
      <div className="can-dim" />
      <StatusBar />
      <div className="can-sheet">
        <i className="can-grab" />
        <div className="can-head">
          <img className="can-avatar" src="assets/figma/cancel/avatar.png" alt="" width={32} height={32} />
          <p className="can-store">Starbucks</p>
          <h2>Pedido cancelado</h2>
          <button type="button" className="can-close" onClick={next} aria-label="Cerrar">
            <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
          </button>
        </div>
        <div className="can-body">
          <img className="can-word" src="assets/figma/cancel/tesla-word.svg" alt="TESLA" width={65} height={8} />
          <p className="can-alert">No recibirás un boleto para el sorteo con este pedido.</p>
          <div className="can-car">
            <img src="assets/figma/cancel/tesla.png" alt="" width={153} height={86} />
          </div>
          <p className="can-sub">Solo recibirás boletos cuando tus pedidos sean entregados.</p>
          <button type="button" className="can-ok is-hotspot" onClick={next}>Entendido<HotNum n={1} /></button>
        </div>
      </div>
    </div>
  );
}

function CapScreen({ next }: { next: () => void }) {
  return <div className="screen campaign"><TopBar title="Un Tesla al día" /><div className="hero cap-hero"><TeslaVisual /><div className="hero-copy"><span>SORTEO DE HOY</span><h1>Se terminaron los boletos para el sorteo de hoy</h1></div></div>
    <div className="hub-body cap-body"><div className="cap-icon"><Clock3 /></div><h2>Tus boletos siguen participando</h2><p>Los boletos que tengas acumulados participarán en el sorteo, pero no podrás ganar boletos adicionales.</p>
    <div className="ticket-row"><TicketCard code="4311-A" dim /><TicketCard code="3762-J" dim /></div><PrimaryButton onClick={next}>Ver mis boletos</PrimaryButton></div>
  </div>;
}

function HotNum({ n }: { n: number }) {
  return <span className="hot-badge" aria-hidden="true">{n}</span>;
}

function CountdownBoxes({ dark = false }: { dark?: boolean }) {
  const units: [string, string][] = [["05", "HORAS"], ["11", "MIN"], ["22", "SEG"]];
  return <div className={`countdown-boxes ${dark ? "on-dark" : ""}`}>
    {units.map(([n, l], i) => <React.Fragment key={l}>
      <div className="cb-unit"><div className="cb-box">{n}</div><small>{l}</small></div>
      {i < 2 && <i className="cb-colon">:</i>}
    </React.Fragment>)}
  </div>;
}

type HomeVariant = "default" | "tickets" | "ticketsToday" | "empty" | "noStores" | "noCoverage" | "live" | "results" | "first" | "last" | "soldOut" | "winner" | "ended";
type HubVariant = "empty" | "tickets" | "ticketsHoy" | "live" | "noCoverage" | "noStoresDay" | "first" | "last" | "soldOut" | "ended";
type HubFocus = "header" | "cta" | "results" | "tickets" | "stores";
type StoresVariant = "normal" | "noCoverage" | "noStoresDay";
type StorePhase = "join" | "store" | "offer" | "cart" | "checkout" | "checkoutAsk" | "created" | "transit" | "delivered" | "won" | "confirm";
type BannerSize = "large" | "small";

function homeVariantFromProps(props?: Step["props"]): HomeVariant {
  if (!props) return "default";
  if (props.winner) return "winner";
  if (props.ended) return "ended";
  if (props.live) return "live";
  if (props.results) return "results";
  if (props.last) return "last";
  if (props.soldOut) return "soldOut";
  if (props.noCoverage) return "noCoverage";
  if (props.ticketsToday) return "ticketsToday";
  if (props.tickets) return "tickets";
  if (props.empty) return "empty";
  if (props.noStores) return "noCoverage";
  if (props.first) return "first";
  return "default";
}

function hubVariantFromProps(props?: Step["props"]): HubVariant {
  if (props?.live) return "live";
  if (props?.noCoverage) return "noCoverage";
  if (props?.noStoresDay) return "noStoresDay";
  if (props?.first) return "first";
  if (props?.last) return "last";
  if (props?.ended) return "ended";
  if (props?.soldOut) return "soldOut";
  if (props?.ticketsHoy) return "ticketsHoy";
  if (props?.tickets) return "tickets";
  return "empty";
}

function storePhaseFromProps(props?: Step["props"]): StorePhase {
  const p = typeof props?.phase === "string" ? props.phase : "";
  if (p === "join" || p === "store" || p === "offer" || p === "cart" || p === "checkout" || p === "checkoutAsk" || p === "created" || p === "transit" || p === "delivered" || p === "won" || p === "confirm") return p;
  return "join";
}

function BannerClock() {
  return <div className="rh-clock">
    {[["05", "HORAS"], ["11", "MIN"], ["22", "SEG"]].map(([n, l], i) => <React.Fragment key={l}>
      <div className="rh-box"><strong>{n}</strong><em>{l}</em></div>
      {i < 2 && <span>:</span>}
    </React.Fragment>)}
  </div>;
}

function LiveTickets({ extraTicket }: { extraTicket?: TicketInfo | null }) {
  return <div className="rh-mini-row">
    {[{ code: extraTicket?.code || "5321-A" }, { code: "1231-Z" }, { extra: "+6" }].map(t => (
      <span className="rh-mini-tix" key={t.code || t.extra}>
        <span className="rh-mini-card" aria-hidden="true">
          <img src="assets/figma/home/mini-tix.svg" alt="" width={68} height={94} />
        </span>
        {t.code ? <><small>Boleto N°</small><strong>{t.code}</strong></> : <><strong className="plus">{t.extra}</strong><em>Boletos</em></>}
      </span>
    ))}
  </div>;
}

function LiveWatchCta() {
  return <span className="rh-cta live">
    <img src="assets/figma/home/ico-video.svg" alt="" width={16} height={16} />
    <span>Ver sorteo en VIVO</span>
    <img src="assets/figma/home/ico-live-dot.svg" alt="" width={16} height={16} />
  </span>;
}

function WinnerBannerArt() {
  return <>
    <img className="rh-win-car" src="assets/figma/home/winner-car.png" alt="" width={396} height={224} />
    <img className="rh-win-confetti" src="assets/figma/home/winner-confetti.svg" alt="" width={510} height={445} />
    <b>¡Ganaste el Tesla del Sorteo N°5!</b>
    <span className="rh-win-tix">
      <span className="rh-win-tix-rot" aria-hidden="true">
        <img src="assets/figma/home/winner-tix.svg" alt="" width={60} height={144} />
      </span>
      <strong>3321-H</strong>
    </span>
    <span className="rh-win-bar"><span>El equipo de Rappi te contactará</span></span>
  </>;
}

function ResultsWinTicket() {
  return <span className="rh-res-tix" aria-hidden="true">
    <span className="rh-res-tix-rot">
      <img src="assets/figma/home/results-tix.svg" alt="" width={105} height={198} />
    </span>
    <img className="rh-res-tix-word" src="assets/figma/home/tesla-word.svg" alt="" width={59} height={10} />
    <img className="rh-res-tix-star left" src="assets/figma/home/results-star.svg" alt="" width={12} height={12} />
    <img className="rh-res-tix-star right" src="assets/figma/home/results-star.svg" alt="" width={12} height={12} />
    <strong>5312-*</strong>
    <em>Boleto ganador Tesla</em>
  </span>;
}

function HomeBannerFace({ variant, extraTicket, tickets, size, liveTimer, hot = 1, onPointerDown, onClick }: { variant: HomeVariant; extraTicket?: TicketInfo | null; tickets?: boolean; size: BannerSize; liveTimer?: boolean; hot?: number; onPointerDown: (e: React.PointerEvent) => void; onClick: (e: React.MouseEvent) => void }) {
  const small = size === "small";
  const clockLabel = "Próximo sorteo cierra en:";
  if (small) {
    if (variant === "winner") {
      return <button className="rh-banner rh-banner-sm rh-banner-winner is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Ganaste el Tesla">
        <WinnerBannerArt />
        <HotNum n={1} />
      </button>;
    }
    return <button className={`rh-banner rh-banner-sm${variant === "live" ? " rh-banner-live" : ""}${variant === "noCoverage" || variant === "noStores" ? " rh-banner-nocov" : ""}${variant === "soldOut" ? " rh-banner-sold" : ""}${variant === "ended" ? " rh-banner-ended" : ""} is-hotspot`} onPointerDown={onPointerDown} onClick={onClick} aria-label="Banner del concurso">
      {variant === "noCoverage" || variant === "noStores" ? <em className="rh-soon">Próximamente</em> : <b>{variant === "live" ? "¡El sorteo de hoy está en curso!" : "Cada día alguien se lleva un Tesla®"}</b>}
      {variant === "live" ? <LiveWatchCta /> : variant === "results" ? <>
        <small>Resultados último sorteo · Agosto 16</small>
        <span className="rh-cta mid">Ver resultados<ChevronRight size={14} /></span>
      </> : variant === "ended" ? <>
        <small>Los sorteos han terminado.</small>
        <span className="rh-cta mid">Ver resultados<ChevronRight size={14} /></span>
      </> : variant === "noCoverage" || variant === "noStores" ? <>
        <p className="rh-empty-msg">Aún no hay tiendas para ganar boletos en esta dirección</p>
        <div className="rh-car-clip">
          <img className="rh-car" src="assets/figma/home/nocov-tesla.png" alt="" width={183} height={103} />
          <img className="rh-word" src="assets/figma/home/nocov-word.svg" alt="" width={43} height={6} />
        </div>
      </> : variant === "soldOut" ? <>
        <small>Próximo sorteo cierra en:</small>
        <BannerClock />
        <span className="rh-sold-bar">Se terminaron los boletos para el sorteo de hoy</span>
      </> : variant === "tickets" ? <>
        <small>Tus boletos sorteo de mañana</small>
        <p className="rh-tix-time">5 h : 11 min : 22 seg</p>
      </> : variant === "empty" ? <>
        <small>Tus boletos sorteo de mañana</small>
        <p className="rh-empty-msg">Aún no tienes boletos para este sorteo</p>
      </> : <>
        <small>{clockLabel}</small>
        <BannerClock />
      </>}
      <HotNum n={1} />
    </button>;
  }
  if (variant === "tickets") {
    return <button className="rh-banner rh-banner-tix is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Tus boletos del sorteo de mañana">
      <b>Tus boletos del sorteo de mañana</b>
      <i className="rh-title-chevron"><ChevronRight size={16} /></i>
      <div className="rh-mini-row">
        {[{ code: extraTicket?.code || "5321-A" }, { code: "1231-Z" }, { extra: "+6" }].map(t => (
          <span className="rh-mini-tix" key={t.code || t.extra}>
            <span className="rh-mini-card" aria-hidden="true">
              <img src="assets/figma/home/mini-tix.svg" alt="" width={68} height={94} />
            </span>
            {t.code ? <><small>Boleto N°</small><strong>{t.code}</strong></> : <><strong className="plus">{t.extra}</strong><em>Boletos</em></>}
          </span>
        ))}
      </div>
      <p className="rh-tix-time">5 h : 11 min : 22 seg</p>
      <span className="rh-cta end">Gana más boletos</span>
      <HotNum n={hot} />
    </button>;
  }
  if (variant === "ticketsToday") {
    return <button className="rh-banner rh-banner-tix is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Tus boletos del sorteo de hoy">
      <b>Tus boletos del sorteo de hoy</b>
      <i className="rh-title-chevron"><ChevronRight size={16} /></i>
      <div className="rh-mini-row">
        {[{ code: extraTicket?.code || "5321-A" }, { code: "1231-Z" }, { extra: "+6" }].map(t => (
          <span className="rh-mini-tix" key={t.code || t.extra}>
            <span className="rh-mini-card" aria-hidden="true">
              <img src="assets/figma/home/mini-tix.svg" alt="" width={68} height={94} />
            </span>
            {t.code ? <><small>Boleto N°</small><strong>{t.code}</strong></> : <><strong className="plus">{t.extra}</strong><em>Boletos</em></>}
          </span>
        ))}
      </div>
      <p className="rh-tix-time">Sorteo hoy a las 14:00</p>
      <HotNum n={hot} />
    </button>;
  }
  if (variant === "empty") {
    return <button className="rh-banner rh-banner-empty is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Tus boletos sorteo de mañana">
      <b>Tus boletos sorteo de mañana</b>
      <p className="rh-empty-msg">Aún no tienes boletos para este sorteo</p>
      <span className="rh-cta mid">Gana boletos<ChevronRight size={14} /></span>
      <em className="rh-empty-time">5 h : 11 min : 22 seg</em>
      <HotNum n={1} />
    </button>;
  }
  if (variant === "live") {
    return <button className="rh-banner rh-banner-live is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Sorteo en vivo">
      <b>¡El sorteo de hoy está en curso!</b>
      {tickets ? <LiveTickets extraTicket={extraTicket} /> : null}
      <LiveWatchCta />
      <HotNum n={1} />
    </button>;
  }
  if (variant === "results") {
    return <button className="rh-banner rh-banner-res is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Resultados último sorteo">
      <b>Resultados último sorteo</b>
      <ResultsWinTicket />
      <span className="rh-res-side">
        <small>¡Revisa si ganaste!</small>
        <span className="rh-cta">Ver resultados</span>
      </span>
      <p className="rh-tix-time">Sorteado hoy a las 14:00</p>
      <HotNum n={hot} />
    </button>;
  }
  if (variant === "winner") {
    return <button className="rh-banner rh-banner-winner is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Ganaste el Tesla">
      <WinnerBannerArt />
      <HotNum n={1} />
    </button>;
  }
  if (variant === "noCoverage" || variant === "noStores") {
    return <button className="rh-banner rh-banner-nocov is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Sin cobertura">
      <em className="rh-soon">Próximamente</em>
      <p className="rh-empty-msg">Aún no hay tiendas para ganar boletos en esta dirección</p>
      <div className="rh-car-clip">
        <img className="rh-car" src="assets/figma/home/nocov-tesla.png" alt="" width={183} height={103} />
        <img className="rh-word" src="assets/figma/home/nocov-word.svg" alt="" width={43} height={6} />
      </div>
      <HotNum n={1} />
    </button>;
  }
  if (variant === "ended") {
    return <button className="rh-banner rh-banner-ended is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Los sorteos han terminado">
      <b>Un Tesla al día. Todos los días.</b>
      <i className="rh-title-chevron"><ChevronRight size={16} /></i>
      <p className="rh-empty-msg">Los sorteos han terminado.</p>
      <span className="rh-cta mid">Ver resultados<ChevronRight size={14} /></span>
      <div className="rh-car-clip">
        <img className="rh-car" src="assets/figma/home/tesla-a.png" alt="" />
        <img className="rh-word" src="assets/figma/home/tesla-word.svg" alt="" />
      </div>
      <HotNum n={1} />
    </button>;
  }
  if (variant === "soldOut") {
    return <button className="rh-banner rh-banner-sold is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Se terminaron los boletos">
      <b>Un Tesla al día. Todos los días.</b>
      <i className="rh-title-chevron"><ChevronRight size={16} /></i>
      <small>Próximo sorteo cierra en:</small>
      <BannerClock />
      <span className="rh-sold-bar">Se terminaron los boletos para el sorteo de hoy</span>
      <div className="rh-car-clip">
        <img className="rh-car" src="assets/figma/home/tesla-a.png" alt="" />
        <img className="rh-word" src="assets/figma/home/tesla-word.svg" alt="" />
      </div>
      <HotNum n={1} />
    </button>;
  }
  const cta = liveTimer ? "Gana boletos en estas tiendas hoy" : "Gana boletos";
  return <button className="rh-banner is-hotspot" onPointerDown={onPointerDown} onClick={onClick} aria-label="Banner del concurso">
    <b>Un Tesla al día. Todos los días.</b>
    {liveTimer ? <i className="rh-title-chevron"><ChevronRight size={16} /></i> : null}
    <small>{clockLabel}</small>
    <BannerClock />
    <span className={liveTimer ? "rh-cta wide" : "rh-cta mid"}>{cta}<ChevronRight size={14} /></span>
    <div className="rh-car-clip">
      <img className="rh-car" src="assets/figma/home/tesla-a.png" alt="" />
      <img className="rh-word" src="assets/figma/home/tesla-word.svg" alt="" />
    </div>
    <HotNum n={hot} />
  </button>;
}

function HomeRappiScreen({ next, variant = "default", size = "large", onRestaurants, onSearch, onTickets, onStores, onResults, extraTicket, tickets, storeTags, single, timerCta, navHot = true, tagFocus = false }: { next: () => void; variant?: HomeVariant; size?: BannerSize; onRestaurants?: () => void; onSearch?: () => void; onTickets?: () => void; onStores?: () => void; onResults?: () => void; extraTicket?: TicketInfo | null; tickets?: boolean; storeTags?: boolean; single?: boolean; timerCta?: boolean; navHot?: boolean; tagFocus?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const [page, setPage] = useState(0);
  const liveCarousel = !single && size === "large" && variant === "live";
  const ticketsCarousel = !single && size === "large" && variant === "tickets";
  const resultsCarousel = !single && size === "large" && variant === "results";
  const carousel = !single && size === "large" && (variant === "default" || variant === "first" || variant === "tickets" || variant === "empty" || liveCarousel || resultsCarousel);
  const cardCount = liveCarousel || ticketsCarousel || resultsCarousel ? 3 : carousel ? 2 : 1;
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setPage(Math.min(cardCount - 1, Math.max(0, Math.round(el.scrollLeft / 335))));
  };
  const go = (dest: "hub" | "tickets" | "stores" | "results" = "hub") => (e: React.MouseEvent) => {
    if (Math.abs(e.clientX - startX.current) > 8) return;
    if (dest === "tickets") { onTickets?.(); return; }
    if (dest === "stores") { onStores?.(); return; }
    if (dest === "results") { onResults?.(); return; }
    next();
  };
  const face = (v: HomeVariant, liveTimer?: boolean, dest: "hub" | "tickets" | "stores" | "results" = "hub", hot = 1) => <HomeBannerFace variant={v} extraTicket={extraTicket} tickets={tickets || liveCarousel} size={size} liveTimer={liveTimer} hot={hot} onPointerDown={e => { startX.current = e.clientX; }} onClick={go(dest)} />;
  const nocov = variant === "noCoverage" || variant === "noStores";
  const hideExplore = nocov || !navHot;
  const restN = ticketsCarousel || liveCarousel || resultsCarousel ? 4 : 2;
  const searchN = ticketsCarousel || liveCarousel || resultsCarousel ? 5 : 3;
  return <div className={`screen rappi-home${tagFocus ? " rh-tagfocus" : ""}`}>
    <StatusBar />
    <div className="rh-nav">
      <div className="rh-loc"><span>Casa de Mamá • Calle 92 # 11-72</span><i className="rh-expand"><ChevronDown size={12} /></i></div>
      <button className="rh-profile" aria-label="Perfil"><User size={16} /></button>
    </div>
    <div className={`rh-carousel${size === "small" ? " is-sm" : ""}${nocov ? " is-nocov" : ""}`}>
      <div className="rh-track" ref={track} onScroll={onScroll}>
        {liveCarousel ? <>{face("live", false, "hub", 1)}{face("default", true, "stores", 2)}{face("tickets", false, "tickets", 3)}</> : null}
        {resultsCarousel ? <>{face("results", false, "results", 1)}{face("default", true, "stores", 2)}{face("tickets", false, "tickets", 3)}</> : null}
        {carousel && !liveCarousel && !resultsCarousel && variant !== "tickets" && variant !== "empty" ? face(variant) : null}
        {carousel && !liveCarousel && variant === "tickets" ? <>{face("default", true, "hub", 1)}{face("tickets", false, "tickets", 2)}{face("ticketsToday", false, "stores", 3)}</> : null}
        {carousel && !liveCarousel && variant === "empty" ? <>{face("default")}{face("empty")}</> : null}
        {carousel && !liveCarousel && (variant === "default" || variant === "first") ? face("empty") : null}
        {!carousel ? face(variant, timerCta) : null}
      </div>
      {carousel ? <div className={`rh-dots${cardCount === 3 ? " is-3" : ""}`}>{Array.from({ length: cardCount }, (_, i) => <i key={i} className={page === i ? "on" : ""} />)}</div> : null}
    </div>
    <div className="rh-cats">
      <button className={`rh-cat rest${hideExplore ? "" : " is-hotspot"}`} onClick={hideExplore ? undefined : onRestaurants}><img src="assets/figma/home/burger.png" alt="" /><div className="rh-cat-txt"><b>Restaurantes</b><small>15 min</small></div>{hideExplore ? null : <HotNum n={restN} />}</button>
      <div className="rh-cat turbo"><img src="assets/figma/home/bag.png" alt="" /><div className="rh-cat-txt"><b>Turbo</b><small>10 min</small></div></div>
      <div className="rh-cat merc"><img src="assets/figma/home/bananas.png" alt="" /><div className="rh-cat-txt"><b>Mercado</b><small>45 min</small></div></div>
    </div>
    <div className="rh-chips">
      {([["taco", "Tacos"], ["bowl", "Saludable"], ["sushi", "Sushi"], ["popcorn", "Rápida"]] as const).map(([img, name]) =>
        <span className="rh-chip" key={name}><img src={`assets/figma/home/${img}.png`} alt="" />{name}</span>)}
    </div>
    <div className="rh-pay">
      <button><img className="rh-3d" src="assets/figma/home/card3d.png" alt="" /><img className="rh-logo" src="assets/figma/home/rappicard.svg" alt="RappiCard" /><ChevronRight size={14} color="#919aaa" /></button>
      <i />
      <button><img className="rh-3d" src="assets/figma/home/cuentacard.png" alt="" /><img className="rh-logo wide" src="assets/figma/home/rappicuenta.svg" alt="RappiCuenta" /><ChevronRight size={14} color="#919aaa" /></button>
    </div>
    <div className="rh-reorder">
      <div className="rh-reorder-h"><b>Cómpralo de nuevo Simón</b><ChevronRight size={16} color="#919aaa" /></div>
      <div className="rh-stores">
        <div className={`rh-store${tagFocus ? " is-hotspot" : ""}`}>
          <span className="rh-store-photo">
            <img src="assets/figma/home/sbux.png" alt="Starbucks Turbo" />
            {storeTags ? <TeslaTag /> : null}
          </span>
          <b>Starbucks Turbo</b>
          <small>10 min · 4.8</small>
          {tagFocus ? <HotNum n={1} /> : null}
        </div>
        <div className={`rh-store peek${tagFocus ? " is-hotspot" : ""}`}>
          <span className="rh-store-photo">
            <img src="assets/figma/home/pumpkin.png" alt="Mora Mora Turbo" />
            {storeTags ? <TeslaTag /> : null}
          </span>
          <b>Mora Mora Turbo</b>
          <small>10 min · 4.8</small>
          {tagFocus ? <HotNum n={1} /> : null}
        </div>
      </div>
    </div>
    <div className="rh-dock">
      <button className={`rh-search${hideExplore ? "" : " is-hotspot"}`} onClick={hideExplore ? undefined : onSearch}><img src="assets/figma/home/search.svg" alt="" /><span>¿Que quieres hoy?</span>{hideExplore ? null : <HotNum n={searchN} />}</button>
      <button className="rh-mic" aria-label="Voz"><img src="assets/figma/home/mic-ring.svg" alt="" /><img className="rh-mic-ico" src="assets/figma/home/mic.svg" alt="" /></button>
    </div>
  </div>;
}

function WinnerInappScreen({ onClose }: { onClose: () => void }) {
  return <div className="screen win-inapp">
    <StatusBar />
    <div className="win-inapp-glow" aria-hidden="true" />
    <button type="button" className="win-inapp-close is-hotspot" onClick={onClose} aria-label="Cerrar">
      <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
      <HotNum n={1} />
    </button>
    <img className="win-inapp-car" src="assets/figma/home/winner-inapp-car.png" alt="" width={701} height={382} />
    <img className="win-inapp-word" src="assets/figma/home/winner-inapp-word.svg" alt="TESLA" width={104} height={14} />
    <h1><span>GANASTE</span><span>EL TESLA</span></h1>
    <p className="win-inapp-sub">Tu boleto <b>3322-H</b> ganó en el<br />Sorteo N°5 · 17 Agosto</p>
    <div className="win-inapp-keys">
      <img src="assets/figma/home/winner-keys.png" alt="" width={40} height={40} />
      <div>
        <b>Ya estamos alistando tus llaves</b>
        <small>El equipo de Rappi te contactará en las para darte más detalles.</small>
      </div>
    </div>
    <div className="win-inapp-dock">
      <button type="button" className="btn-primary win-inapp-share is-hotspot" onClick={onClose}>Compartir<HotNum n={2} /></button>
    </div>
  </div>;
}

function IntroScreen({ onKnowMore, onGotIt, openLegal }: { onKnowMore: () => void; onGotIt: () => void; openLegal?: () => void }) {
  return <div className="screen intro2"><StatusBar />
    <div className="intro2-body">
      <h1 className="intro2-title">Un Tesla al día.<br />Todos los días.<br />Por el resto del año.</h1>
      <img className="intro2-car" src="assets/figma/tesla-white-side.png" alt="Tesla Model Y" />
      <img className="intro2-word" src="assets/figma/tesla-wordmark.svg" alt="TESLA" />
      <p className="intro2-label">Próximo sorteo cierra en:</p>
      <CountdownBoxes />
      <button className="intro2-bases" onClick={openLegal}>Consulta las bases</button>
    </div>
    <div className="intro2-docked">
      <button className="btn-tertiary is-hotspot" onClick={onGotIt}>Entendido<HotNum n={2} /></button>
      <button className="btn-primary is-hotspot" onClick={onKnowMore}>Conocer más<HotNum n={1} /></button>
    </div>
  </div>;
}

type HubStore = { name: string; photo: string; brand?: boolean; turbo?: boolean };

const hubRows: HubStore[][] = [
  [
    { name: "Turbo · 10 Min", photo: "hub/store-turbo.png", brand: true },
    { name: "Oakberry", photo: "hub/store-oakberry.png" },
    { name: "Hat Trick Burgers", photo: "hub/store-hattrick.png" },
  ],
  [
    { name: "Hat Trick Turbo", photo: "hub/store-hatturbo.png", turbo: true },
    { name: "Fougasse", photo: "hub/store-fougasse.png" },
    { name: "Hat Trick Burgers", photo: "hub/store-hattrick2.png" },
  ],
];

function HubStoreCard({ name, photo, brand, turbo, n, hot = true, onOpen }: HubStore & { n: number; hot?: boolean; onOpen?: () => void }) {
  return <button className={`chub-card${hot ? " is-hotspot" : ""}`} onClick={onOpen}>
    <div className={`chub-photo${brand ? " is-logo" : ""}`}>
      <img src={`assets/figma/${photo}`} alt="" />
      {turbo && <span className="chub-turbo"><img src="assets/figma/stores/turbo.svg" alt="" /></span>}
      <span className="chub-tag"><span className="chub-tag-label">BOLETO TESLA</span><i className="chub-tag-car"><img src="assets/figma/home/tesla-a.png" alt="" /></i></span>
    </div>
    <b>{name}</b>
    <small>Min: $80</small>
    {hot && <HotNum n={n} />}
  </button>;
}

const hubTicketsManana: { code: string; store: string }[] = [
  { code: "4312-A", store: "Sanamente gourmet" },
  { code: "3762-Z", store: "Los Tolucos" },
  { code: "276·24", store: "Bacy" },
];
const hubTicketsHoy: { code: string; store: string }[] = [
  { code: "8821-B", store: "Domino's" },
  { code: "5501-C", store: "Starbucks" },
  { code: "1190-D", store: "McDonald's" },
  { code: "7044-E", store: "Subway" },
];
const hubTicketsN3: { code: string; store: string }[] = [
  { code: "3321-H", store: "Green Gass" },
  { code: "2109-K", store: "Tierra Garat" },
];
const hubTickets = hubTicketsManana;

function TicketsEmpty({ onCta, n, hot = true }: { onCta: () => void; n?: number; hot?: boolean }) {
  return <div className="tix-empty">
    <img src="assets/figma/empty-ticket.svg" alt="" width={48} height={48} />
    <div className="tix-empty-copy">
      <b>Aún no tienes boletos para este sorteo</b>
      <small>Todavía tienes tiempo para ganar boletos y participar por el Tesla</small>
    </div>
    <button type="button" className={`tix-empty-cta${hot ? " is-hotspot" : ""}`} onClick={onCta}>Gana boletos{hot && n ? <HotNum n={n} /> : null}</button>
  </div>;
}

function TeslaTicket({ code, store, n, sorteo = "Sorteo N°6", onClick, gold, label, hot = true }: { code: string; store: string; n?: number; sorteo?: string; onClick?: (t: TicketInfo) => void; gold?: boolean; label?: string; hot?: boolean }) {
  return <button className={`tesla-tix${gold ? " gold" : ""}${onClick && hot ? " is-hotspot" : ""}`} onClick={() => onClick?.({ code, store, sorteo })}>
    <span className="tix-label">{label ?? "Boleto N°"}</span>
    <img className="tix-word" src="assets/figma/tesla-wordmark.svg" alt="" />
    <strong>{code}</strong>
    <em>{store}</em>
    <small>{sorteo}</small>
    {hot && n ? <HotNum n={n} /> : null}
  </button>;
}

function TicketCardShell({ children }: { children: React.ReactNode }) {
  return <>
    <div className="td-card-rot" aria-hidden="true">
      <span className="td-card-shadow">
        <img className="td-card-img" src="assets/figma/ticket/card.svg" alt="" />
      </span>
    </div>
    {children}
    <img className="td-dash" src="assets/figma/ticket/dash.svg" alt="" />
  </>;
}

function TicketDetailSheet({ ticket, onClose, openLegal }: { ticket: TicketInfo; onClose: () => void; openLegal?: (doc?: "bases" | "privacy") => void }) {
  const [flipped, setFlipped] = useState(false);
  return <div className="tix-detail" onClick={onClose} {...sheetDismiss(onClose)}>
    <div className="tix-detail-dim" />
    <div className="tix-detail-sheet" onClick={e => e.stopPropagation()}>
      <button className="tix-detail-close is-hotspot" onClick={onClose} aria-label="Cerrar">
        <img src="assets/figma/ticket/close.svg" alt="" width={24} height={24} />
        <HotNum n={1} />
      </button>
      <div className={`tix-flip${flipped ? " is-flipped" : ""}`}>
        <button
          className="tix-flip-inner is-hotspot"
          onClick={() => setFlipped(f => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? "Volver al frente del boleto" : "Voltear boleto"}
        >
          <div className="tix-face tix-face-front">
            <TicketCardShell>
              <div className="td-text">
                <span className="td-label">Boleto N°</span>
                <strong>{ticket.code}</strong>
              </div>
              <span className="td-word-wrap">
                <img className="td-word" src="assets/figma/ticket/wordmark.png" alt="TESLA" />
              </span>
              <em>{ticket.sorteo ?? "Sorteo N°[XX]"}</em>
              <p className="td-legal">
                <b>Denominación:</b> Sorteo “Un Tesla al día”. <b>Organizador:</b> Tecnologías Rappi, S.A.P.I. de C.V. <b>Día de Participación:</b> Día participación [XXX]. <b>Nombre del Participante:</b> [XXXXXXXXXXXXXXXXX]. <b>Número de orden:</b> [XXXXXXXXXXXXXXX]. <b>Premio:</b> Un Tesla Model Y RWD 2027, valor $804,000.00 M.N. <b>Permiso:</b> SEGOB/DGJS No. [XXX], vigencia [XXX] a [XXX]. Boleto gratuito. Valor nominal $0.00 M.N. Válido únicamente para el sorteo del Día de Participación indicado. Los premios serán entregados de conformidad con lo establecido en las bases del sorteo. Este boleto da derecho a que si su Folio resulta extraído en el sorteo se le considere persona ganadora, sujeto a las condiciones y requisitos establecidos en las bases.
              </p>
            </TicketCardShell>
          </div>
          <div className="tix-face tix-face-back">
            <TicketCardShell>
              <span className="td-word-back">
                <img src="assets/figma/ticket/wordmark.png" alt="TESLA" />
              </span>
              <span className="td-details-label">Detalles del boleto:</span>
              <p className="td-legal td-legal-back">
                <b>Número de boletos emitidos:</b> Hasta 240,000 boletos por Día de Participación; máximo 18'480,000 durante la Vigencia de la Promoción. <b>Valor nominal del boleto:</b> $0.00 M.N. (gratuito) Valor total de la emisión: $0.00 M.N. <b>Número de premios a entregar:</b> 1 (uno por sorteo diario). <b>Valor de premio mayor:</b> $804,000.00 M.N. <b>Número y vigencia del permiso:</b> SEGOB/DGJS No. [XXXX], del [XXX] al [XXX]. <b>Fecha, lugar y mecánica del sorteo:</b> Sorteo diario a las 14:00 hrs. en C. Montes Urales 505, Lomas - Virreyes, Lomas de Chapultepec III Secc, HM, 11000, CDMX. <b>Mecánica:</b> Formación de números (una esfera por cada dígito del Folio). <b>Medios y fechas de difusión de resultados:</b> [XXXX] y [XXXX], dentro de los 3 días naturales siguientes a cada sorteo. <b>Plazo y lugar de reclamación:</b> Máximo 20 días hábiles desde el sorteo; en C.Montes Urales 505, Lomas - Virreyes, Lomas de Chapultepec III Secc, HM, 11000, CDMX. <b>Aclaraciones:</b> Rappi: tel. [XXX XXX XXXX]. <b>Quejas:</b> Dirección General de Juegos y Sorteos, SEGOB: [XXX], tel. [XXX].
              </p>
            </TicketCardShell>
          </div>
          <HotNum n={2} />
        </button>
      </div>
      <p className={`tix-legal-links${flipped ? " is-on" : ""}`}>
        <button type="button" onClick={() => openLegal?.("bases")}>Bases del sorteo</button>
        <span> & </span>
        <button type="button" onClick={() => openLegal?.("privacy")}>Aviso de Privacidad</button>
      </p>
    </div>
  </div>;
}

function CampaignHubScreen({ next, prev, openStores, openTickets, openTicket, openResults, openStore, openLive, tickets = false, extraTicket, variant = "empty", focus }: { next: () => void; prev: () => void; openStores: () => void; openTickets?: () => void; openTicket?: (t: TicketInfo) => void; openResults?: () => void; openStore?: () => void; openLive?: () => void; tickets?: boolean; extraTicket?: TicketInfo | null; variant?: HubVariant; focus?: HubFocus }) {
  const noF = !focus;
  const hotCta = noF || focus === "cta";
  const hotRes = noF || focus === "results";
  const hotTix = noF || focus === "tickets";
  const hotSto = noF || focus === "stores";
  const v = tickets && variant === "empty" ? "tickets" : variant;
  const showTickets = v === "tickets" || v === "ticketsHoy" || v === "live" || v === "noCoverage" || v === "noStoresDay" || v === "last" || v === "soldOut" || v === "ended" || !!extraTicket;
  const hideStores = v === "noCoverage" || v === "noStoresDay" || v === "soldOut" || v === "ended";
  const soldOut = v === "soldOut";
  const ended = v === "ended";
  const pideN = showTickets ? 8 : 5;
  const storeN = showTickets ? 9 : 6;
  const allN = showTickets ? 10 : 7;
  const [sorteoFilter, setSorteoFilter] = useState<"manana" | "hoy">(v === "live" || v === "noCoverage" ? "hoy" : "manana");
  const filteredHubTickets = (() => {
    if (v === "ticketsHoy" && sorteoFilter === "manana" && !extraTicket) return [];
    const base = sorteoFilter === "hoy" ? hubTicketsHoy : v === "ticketsHoy" ? [] : hubTicketsManana;
    return extraTicket && sorteoFilter === "manana" ? [extraTicket, ...base] : base;
  })();
  const hubEmpty = showTickets && filteredHubTickets.length === 0;
  const countdownLabel = v === "last" ? "Últimos sorteo cierra en:" : "Próximo sorteo cierra en:";
  const teslasDone = v === "last" ? "40 Teslas" : "5 Teslas";
  const resultsSub = v === "first" ? "Primer sorteo el 16 de Octubre" : v === "ended" ? "¡Ya sorteamos este Tesla!" : <>Ya sorteamos <b style={{ display: "inline", fontSize: 12 }}>{teslasDone}</b></>;
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const go = () => {
      const top = !focus || focus === "header" || focus === "cta" || (focus === "tickets" && !showTickets);
      if (top) { root.scrollTop = 0; return; }
      const pides = Array.from(root.querySelectorAll<HTMLElement>(".chub-pide"));
      const el = focus === "results"
        ? root.querySelector<HTMLElement>(".chub-results")
        : focus === "tickets" ? pides[0] : root.querySelector<HTMLElement>(".chub-none") ?? pides[pides.length - 1];
      if (el) root.scrollTop = Math.max(0, el.offsetTop - 120);
    };
    go();
    const frame = requestAnimationFrame(() => { go(); requestAnimationFrame(go); });
    return () => cancelAnimationFrame(frame);
  }, [focus, v, showTickets]);
  return <div className="screen chub" data-scroll="chub" ref={scroller}>
    <div className={`chub-hero${soldOut || ended ? " is-sold" : ""}${focus === "header" ? " is-hotspot" : ""}`}>
      <StatusBar />
      {focus === "header" && <HotNum n={1} />}
      <div className="chub-top">
        <button className={`back${noF ? " is-hotspot" : ""}`} onClick={prev} aria-label="Atrás"><ChevronLeft size={18} />{noF && <HotNum n={1} />}</button>
        <button className={`chub-how${noF ? " is-hotspot" : ""}`} onClick={next}>¿Cómo funciona?{noF && <HotNum n={2} />}</button>
      </div>
      <div className="chub-carwrap"><img className="chub-car" src="assets/figma/hub-tesla-front.png" alt="Tesla Model Y" /></div>
      <h1 className="chub-title">Un Tesla al día. Todos los días. Por el resto del año.</h1>
      {!ended && <p className="chub-label">{countdownLabel}</p>}
      {!ended && <CountdownBoxes dark />}
      {ended ? <div className="chub-sold">
        <b>¡Ya sorteamos este Tesla!</b>
        <p>Esto es todos los días, en serio puedes ser tú.</p>
      </div> : soldOut ? <div className="chub-sold">
        <b>Se terminaron los boletos para el sorteo de hoy</b>
        <p>Los boletos que tengas acumulados para el sorteo participarán, pero no podrás ganar boletos adicionales.</p>
      </div> : <>
        <p className="chub-sub">Gana 1 boleto por cada compra en las tiendas participantes y concursa por ganar un Tesla diario</p>
        <button className={`btn-primary chub-cta${hotCta ? " is-hotspot" : ""}`} onClick={openStores}>Gana boletos{hotCta && <HotNum n={noF ? 3 : 1} />}</button>
      </>}
    </div>
    <div className="chub-sheet">
      <button className={`chub-results${hotRes ? " is-hotspot" : ""}`} onClick={openResults}><img src="assets/figma/tesla-white-side.png" alt="" /><div><b>Ver resultados y sorteos anteriores</b><small>{resultsSub}</small></div><ChevronRight size={18} color="#919aaa" />{hotRes && <HotNum n={noF ? 4 : 1} />}</button>
      {v === "live" && <button type="button" className={`chub-live${hotRes ? " is-hotspot" : ""}`} onClick={openLive}>
        <img src="assets/figma/hub-live-video.svg" alt="" width={16} height={16} />
        <span>Ver sorteo N°5 en VIVO</span>
        <img src="assets/figma/hub-live-dot.svg" alt="" width={16} height={16} />
        {hotRes && <HotNum n={noF ? 5 : 2} />}
      </button>}
      {showTickets && <>
        <button className={`chub-pide${hotTix ? " is-hotspot" : ""}`} onClick={openTickets}><div><b>Mis boletos</b></div><ChevronRight size={18} color="#919aaa" />{hotTix && <HotNum n={noF ? 5 : 1} />}</button>
        <div className="chub-chips" role="tablist" aria-label="Filtrar boletos por sorteo">
          <button type="button" role="tab" aria-selected={sorteoFilter === "manana"} className={`${hotTix ? "is-hotspot" : ""}${sorteoFilter === "manana" ? " on" : ""}`} onClick={() => setSorteoFilter("manana")}>Sorteo de mañana{hotTix && <HotNum n={noF ? 6 : 2} />}</button>
          <button type="button" role="tab" aria-selected={sorteoFilter === "hoy"} className={`${hotTix ? "is-hotspot" : ""}${sorteoFilter === "hoy" ? " on" : ""}`} onClick={() => setSorteoFilter("hoy")}>Sorteo de hoy{hotTix && <HotNum n={noF ? 6 : 2} />}</button>
        </div>
        {hubEmpty
          ? <TicketsEmpty onCta={openStores} n={noF ? 7 : 3} hot={hotTix} />
          : <div className="chub-tix">{filteredHubTickets.map(t => (
            <TeslaTicket
              key={`${sorteoFilter}-${t.code}`}
              {...t}
              n={noF ? 7 : 3}
              hot={hotTix}
              sorteo={sorteoFilter === "hoy" ? "Sorteo N°5" : "Sorteo N°6"}
              onClick={openTicket}
            />
          ))}</div>}
        {!hubEmpty && v !== "noStoresDay" && <p className="chub-more">{v === "live" ? "El sorteo está en curso" : v === "soldOut" ? "Estos boletos participarán en el sorteo" : v === "ended" ? "Los sorteos han terminado" : v === "noCoverage" ? "Sorteo hoy a las 14:00" : "Aún puedes ganar boletos"}</p>}
      </>}
      {v !== "soldOut" && v !== "ended" && (hideStores ? <div className="chub-pide"><div><b>Pide y gana boletos</b><small>Tiendas participantes de hoy</small></div></div> : <button className={`chub-pide${hotSto ? " is-hotspot" : ""}`} onClick={openStores}><div><b>Pide y gana boletos</b><small>Tiendas participantes de hoy</small></div><ChevronRight size={18} color="#919aaa" />{hotSto && <HotNum n={noF ? pideN : 1} />}</button>)}
      {v === "noCoverage" && <div className={`chub-none empty-coverage${focus === "stores" ? " is-hotspot" : ""}`}>
        <img src="assets/figma/empty-shop.svg" alt="" width={48} height={48} />
        <div>
          <b>Aún no hay tiendas para ganar boletos en esta dirección</b>
          <small>Espéralo próximamente</small>
        </div>
        {focus === "stores" && <HotNum n={1} />}
      </div>}
      {v === "noStoresDay" && <div className={`chub-none empty-coverage${focus === "stores" ? " is-hotspot" : ""}`}>
        <img src="assets/figma/empty-shop.svg" alt="" width={48} height={48} />
        <div>
          <b>Hoy no hay tiendas participantes<br />en tu zona</b>
          <small>Regresa mañana</small>
        </div>
        {focus === "stores" && <HotNum n={1} />}
      </div>}
      {v === "soldOut" && <div className="chub-none chub-sold-empty empty-coverage">
        <img src="assets/figma/empty-shop.svg" alt="" width={48} height={48} />
        <div>
          <b>Se terminaron los boletos<br />para el sorteo de hoy</b>
          <small>Los boletos que tengas acumulados para el sorteo participarán pero no podrás ganar boletos adicionales</small>
        </div>
      </div>}
      {v === "ended" && <div className="chub-none chub-sold-empty empty-coverage">
        <img src="assets/figma/empty-shop.svg" alt="" width={48} height={48} />
        <div>
          <b>Los sorteos han terminado</b>
          <small>Ya no se emiten boletos ni hay tiendas participantes</small>
        </div>
      </div>}
      {!hideStores && <>
        <div className="chub-rows">{hubRows.map((row, r) => <div className="chub-row" data-scroll={`chub-row-${r}`} key={r}>
          {row.map((store, i) => <HubStoreCard key={`${store.name}-${i}`} {...store} n={noF ? storeN : 2} hot={hotSto} onOpen={openStore} />)}
        </div>)}</div>
        <button className={`btn-tertiary chub-all${hotSto ? " is-hotspot" : ""}`} onClick={openStores}>Ver todas las tiendas participantes{hotSto && <HotNum n={noF ? allN : 3} />}</button>
      </>}
    </div>
  </div>;
}

const boletosList: { code: string; store: string }[] = [
  { code: "4311-A", store: "Sanamente gourmet" },
  { code: "3762-J", store: "Los Tolucos" },
  { code: "5362-P", store: "Bacu" },
  { code: "5212-O", store: "Green Gass" },
  { code: "1232-M", store: "Tierra Garat" },
  { code: "1232-L", store: "Shaka Café" },
];

function MisBoletosScreen({ back, openStores, openTicket, extraTicket, soldOut = false, live = false, emptyManana = false, openLive }: { back: () => void; openStores: () => void; openTicket?: (t: TicketInfo) => void; extraTicket?: TicketInfo | null; soldOut?: boolean; live?: boolean; emptyManana?: boolean; openLive?: () => void }) {
  const [sorteoFilter, setSorteoFilter] = useState<"manana" | "hoy" | "n3">("manana");
  const baseList = sorteoFilter === "n3" ? hubTicketsN3 : sorteoFilter === "hoy" ? hubTicketsHoy : emptyManana ? [] : boletosList;
  const list = extraTicket && sorteoFilter === "manana" ? [extraTicket, ...baseList] : baseList;
  const sorteoLabel = sorteoFilter === "hoy" ? "Sorteo N°5" : sorteoFilter === "n3" ? "Sorteo N°3" : "Sorteo N°6";
  const liveHoy = live && sorteoFilter === "hoy";
  const landingEmpty = !soldOut && !liveHoy && list.length === 0;
  const canEarnMore = !soldOut && !liveHoy && !landingEmpty && sorteoFilter === "manana";
  const copy = soldOut
    ? null
    : landingEmpty && sorteoFilter === "manana"
      ? "Aún puedes ganar boletos. El sorteo cierra hoy a las XX:XX pm."
      : sorteoFilter === "manana"
        ? "Aún puedes ganar más boletos. El sorteo cierra hoy a las XX:XX pm."
        : liveHoy
          ? "El sorteo está en curso..."
          : sorteoFilter === "hoy"
            ? "Sorteo hoy a las 14:00."
            : null;
  const chipClass = (on: boolean) => `is-hotspot${on ? " on" : ""}`;
  const ticketN = canEarnMore || liveHoy ? 4 : 3;
  return <div className={`screen boletos${soldOut ? " is-sold" : ""}`} data-scroll="boletos"><StatusBar />
    <div className="bol-head">
      <button className="stores-back is-hotspot" onClick={back} aria-label="Atrás"><ChevronLeft size={20} /><HotNum n={1} /></button>
      <h1>Mis boletos</h1>
    </div>
    <div className="bol-chips" role="tablist" aria-label="Filtrar boletos por sorteo">
      <button type="button" role="tab" aria-selected={sorteoFilter === "manana"} className={chipClass(sorteoFilter === "manana")} onClick={() => setSorteoFilter("manana")}>Sorteo de mañana<small>Agosto 16</small><HotNum n={2} /></button>
      <button type="button" role="tab" aria-selected={sorteoFilter === "hoy"} className={chipClass(sorteoFilter === "hoy")} onClick={() => setSorteoFilter("hoy")}>Sorteo de hoy<small>Agosto 15</small><HotNum n={2} /></button>
      <button type="button" role="tab" aria-selected={sorteoFilter === "n3"} className={chipClass(sorteoFilter === "n3")} onClick={() => setSorteoFilter("n3")}>Sorteo N°3<small>Agosto 14</small><HotNum n={2} /></button>
    </div>
    {soldOut ? <>
      <div className="bol-sold-bar">Se terminaron los boletos para el sorteo de hoy</div>
      <p className="bol-sold-copy">Estos boletos participarán en el sorteo, pero no podrás ganar boletos adicionales.</p>
    </> : <>
      {copy && <p className={`bol-copy${sorteoFilter === "hoy" ? " is-hoy" : ""}`}>{copy}</p>}
      {liveHoy && <button type="button" className="chub-live bol-live is-hotspot" onClick={openLive}>
        <img src="assets/figma/hub-live-video.svg" alt="" width={16} height={16} />
        <span>Ver sorteo N°5 en VIVO</span>
        <img src="assets/figma/hub-live-dot.svg" alt="" width={16} height={16} />
        <HotNum n={3} />
      </button>}
      {canEarnMore && <button className="bol-cta is-hotspot" onClick={openStores}>Gana más boletos<HotNum n={3} /></button>}
    </>}
    {landingEmpty
      ? <TicketsEmpty onCta={openStores} n={3} />
      : <div className="bol-grid">{list.map(t => <TeslaTicket key={`${sorteoFilter}-${t.code}`} {...t} n={ticketN} sorteo={sorteoLabel} onClick={openTicket} />)}</div>}
  </div>;
}

const faqSteps: { ico: string; text: React.ReactNode }[] = [
  { ico: "rules-ico-bag", text: "Haz un pedido en una de las tiendas participantes del día." },
  { ico: "rules-ico-ticket", text: "Al recibir tu pedido, ganarás 1 boleto para participar." },
  { ico: "rules-ico-car", text: <>Cada día se sortea un Tesla.<br />¡Si tienes el boleto con el folio exacto te lo llevas!</> },
  { ico: "rules-ico-trophy", text: "Entre más pedidos hagas en las tiendas participantes, más oportunidades tienes de ganar." },
];

const boletosAnswer = [
  "Gana 1 boleto por cada pedido que hagas del valor mínimo indicado en las tiendas participantes del día.",
  "Una vez el pedido sea entregado, recibirás un boleto con un número único para participar en el sorteo del Tesla Modelo Y RWD 2027.",
  "Entre más pedidos hagas en las tiendas participantes, más oportunidades tienes de ganar el Tesla que se sortea a diario.",
  "Tienes 24 horas para ganar los boletos de cada sorteo.",
];

type FaqEntry = { q: string; a?: string[]; button?: string; btnN?: number; muted?: boolean };
const faqItems: FaqEntry[] = [
  { q: "¿Cómo gano boletos?", a: boletosAnswer },
  { q: "¿Cuáles son las tiendas participantes?", a: ["Cada día hay un listado de tiendas participantes en las que podrás ganar boletos con al hacer pedidos. Las tiendas podrás encontrarlas en la experiencia del app marcadas con el tag “Boleto Tesla”.", "Encuentra aquí las tiendas participantes de hoy:"], button: "Ver tiendas participantes", btnN: 3, muted: true },
  { q: "¿Donde puedo ver los boletos que voy ganando?", a: ["Puedes ver tus boletos en el Home de la app o en la sección del concurso. Cada boleto tiene un número único. Podrás ver los boletos que tienes activos para el sorteo que juega cada día."], button: "Ver mis boletos activos", btnN: 4, muted: true },
  { q: "¿Cuanto tiempo tengo para ganar boletos en cada sorteo?" },
  { q: "¿Que vigencia tienen mis boletos?" },
  { q: "¿Hay límite de boletos para participar en cada sorteo?" },
  { q: "¿Cómo funciona el sorteo?", a: boletosAnswer },
  { q: "¿Donde y cuando se realiza cada sorteo?" },
  { q: "¿Donde puedo ver los resultados del sorteo?" },
  { q: "¿Si gano el sorteo, como puedo reclamar el Tesla?" },
  { q: "¿Si no me gano el Tesla, puedo ganar algo más?" },
  { q: "¿Si gano el sorteo y no quiero el Tesla puedo cambiarlo por dinero?" },
];

function FaqScreen({ back, openStores, openTickets, openLegal }: { back: () => void; openStores: () => void; openTickets?: () => void; openLegal?: (doc?: "bases" | "privacy") => void }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setOpen(o => ({ ...o, [i]: !o[i] }));
  return <div className="screen faq" data-scroll="faq"><StatusBar />
    <div className="faq-header">
      <button className="faq-back is-hotspot" onClick={back} aria-label="Cerrar">
        <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
        <HotNum n={1} />
      </button>
      <img className="faq-word" src="assets/figma/faq/wordmark.svg" alt="TESLA" width={94} height={11} />
    </div>
    <h2 className="faq-title">Participa por ganar un Tesla diario:</h2>
    <div className="faq-steps">{faqSteps.map((step, i) => <div className="faq-step" key={step.ico}>
      <span className="faq-ico"><img src={`assets/figma/${step.ico}.svg`} alt="" width={20} height={20} /></span>
      <span className="faq-num">{i + 1}</span>
      <p>{step.text}</p>
    </div>)}</div>
    <div className="faq-body">
      <h3>Preguntas Frecuentes</h3>
      {faqItems.map((item, i) => <div className={`faq-item${open[i] ? " open" : ""}`} key={item.q}>
        <button className="faq-q is-hotspot" onClick={() => toggle(i)}>
          <span>{item.q}</span>
          <i className="faq-exp">
            <img src="assets/figma/faq/expand-less.svg" alt="" width={16} height={16} className={open[i] ? undefined : "is-down"} />
          </i>
          {i === 0 && <HotNum n={2} />}
        </button>
        {open[i] && item.a && <div className="faq-a">
          <div className={`faq-copy${item.muted ? " muted" : ""}`}>{item.a.map((p, j) => <p key={j}>{p}</p>)}</div>
          {item.button && <button className="faq-inline is-hotspot" onClick={item.button.includes("tiendas") ? openStores : openTickets}>{item.button}{item.btnN && <HotNum n={item.btnN} />}</button>}
        </div>}
      </div>)}
    </div>
    <div className="faq-terms is-hotspot">
      <b>Términos y condiciones sorteo Tesla</b>
      <div className="faq-legal">
        <p>Consulta las <a onClick={() => openLegal?.("bases")}>Bases del sorteo</a>.</p>
        <p>Consulta la <a onClick={() => openLegal?.("privacy")}>Politica de privacidad.</a></p>
      </div>
      <HotNum n={5} />
    </div>
  </div>;
}

function LegalLandingScreen({ back, doc = "bases" }: { back: () => void; doc?: "bases" | "privacy" }) {
  const privacy = doc === "privacy";
  return <div className="legal-land" data-scroll="legal">
    <StatusBar />
    <div className="legal-chrome">
      <div className="legal-chrome-row">
        <button className="faq-back is-hotspot" onClick={back} aria-label="Cerrar">
          <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
          <HotNum n={1} />
        </button>
        <span className="legal-url">{privacy ? "rappi.com/aviso-de-privacidad" : "rappi.com/sorteo-tesla/bases"}</span>
      </div>
    </div>
    <article className="legal-article">
      {privacy ? <>
        <h1>Aviso de privacidad</h1>
        <p className="legal-kicker">Tecnologías Rappi, S.A.P.I. de C.V. · México</p>
        <h2>Responsable</h2>
        <p>Tecnologías Rappi, S.A.P.I. de C.V. (“Rappi”), con domicilio en C. Montes Urales 505, Lomas - Virreyes, Lomas de Chapultepec III Secc, Miguel Hidalgo, 11000, CDMX, es responsable del tratamiento de tus datos personales.</p>
        <h2>Datos que recabamos</h2>
        <p>Identificación y contacto (nombre, correo, teléfono), datos de la cuenta Rappi, historial de pedidos elegibles y el folio del boleto asignado para el sorteo “Un Tesla al día”.</p>
        <h2>Finalidades</h2>
        <p>Operar tu participación en el sorteo, emitir y validar boletos, contactarte si resultas ganador, prevenir fraude y cumplir obligaciones legales ante SEGOB y autoridades competentes.</p>
        <h2>Derechos ARCO</h2>
        <p>Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos, y revocar el consentimiento, a través de los canales de soporte Rappi o al correo de privacidad indicado en rappi.com.mx.</p>
        <h2>Transferencias</h2>
        <p>Tus datos podrán compartirse con proveedores que operan el sorteo, aseguradoras y autoridades cuando exista fundamento legal. No se venden a terceros con fines de mercadotecnia no relacionada.</p>
      </> : <>
        <h1>Bases del sorteo “Un Tesla al día”</h1>
        <p className="legal-kicker">Documento legal · Permiso SEGOB/DGJS No. [XXX]</p>
        <h2>1. Organizador</h2>
        <p>El sorteo es organizado por Tecnologías Rappi, S.A.P.I. de C.V., con domicilio en C. Montes Urales 505, Lomas - Virreyes, Lomas de Chapultepec III Secc, Miguel Hidalgo, 11000, Ciudad de México.</p>
        <h2>2. Denominación y vigencia</h2>
        <p>La promoción se denomina sorteo “Un Tesla al día”. Se realiza un sorteo diario durante la vigencia autorizada en el permiso SEGOB/DGJS No. [XXX], del [XXX] al [XXX]. Cada Día de Participación cierra a las 24 horas del periodo publicado en la app.</p>
        <h2>3. Premio</h2>
        <p>El premio mayor de cada sorteo diario es un Tesla Model Y RWD 2027, con valor de $804,000.00 M.N. Se entrega un (1) premio por sorteo. El premio no es canjeable por dinero en efectivo, salvo que las bases o la autoridad lo determinen.</p>
        <h2>4. Mecánica de participación</h2>
        <p>Pueden participar personas físicas mayores de edad, con cuenta Rappi activa en México. Se obtiene 1 boleto gratuito por cada pedido entregado que cumpla el monto mínimo indicado en las tiendas participantes del día, identificadas con el tag “Boleto Tesla”. El valor nominal del boleto es $0.00 M.N.</p>
        <h2>5. Emisión de boletos</h2>
        <p>Se podrán emitir hasta 240,000 boletos por Día de Participación y un máximo de 18’480,000 durante la vigencia. Cada boleto tiene un folio único. Los boletos quedan activos una vez que el pedido es entregado. Los pedidos cancelados no generan boleto.</p>
        <h2>6. Sorteo</h2>
        <p>El sorteo se realiza diariamente a las 14:00 hrs. en C. Montes Urales 505, Lomas - Virreyes, Lomas de Chapultepec III Secc, Miguel Hidalgo, 11000, CDMX, mediante formación de números (una esfera por cada dígito del folio). Resulta ganador el participante cuyo folio coincida exactamente con el extraído.</p>
        <h2>7. Resultados y reclamación</h2>
        <p>Los resultados se publican en la app y en los medios indicados en el permiso, dentro de los 3 días naturales siguientes. El ganador deberá reclamar el premio en un plazo máximo de 20 días hábiles en el domicilio del organizador, acreditando identidad y cumplimiento de estas bases.</p>
        <h2>8. Restricciones</h2>
        <p>No participan colaboradores de Rappi ni de Tesla, ni sus familiares en primer grado. Rappi podrá invalidar boletos obtenidos de forma fraudulenta. La participación implica la aceptación de estas bases y del aviso de privacidad.</p>
        <h2>9. Contacto</h2>
        <p>Aclaraciones Rappi: teléfono [XXX XXX XXXX]. Quejas: Dirección General de Juegos y Sorteos, SEGOB, tel. [XXX]. Este texto es la versión de producto para el mock; el documento oficial se publicará con el número de permiso definitivo.</p>
      </>}
    </article>
  </div>;
}

type StoreGlyph = "leaf" | "cup" | "berry" | "bun" | "burger" | "sun" | "fish" | "taco" | "bowl" | "ice" | "wheat" | "pizza" | "drop" | "moon" | "flame" | "star" | "bag" | "dot";
type StoreEntry = { name: string; layers?: string[]; turbo?: boolean; mark?: { bg: string; ink: string; glyph: StoreGlyph } };

const storeList: StoreEntry[] = [
  { name: "Nonna", layers: ["a0", "a1", "a2"] },
  { name: "Green Grass", layers: ["a3", "a4"] },
  { name: "Starbucks", layers: ["a5", "a6"] },
  { name: "Mora Mora Turbo", layers: ["a7"], turbo: true },
  { name: "Massima", layers: ["a8"] },
  { name: "Green House", layers: ["a9"] },
  { name: "Tierra Garat", layers: ["a10"] },
  { name: "Shaka Café", layers: ["a11"] },
  { name: "Ice cream nation", layers: ["a12"] },
  { name: "Costco", layers: ["a3", "a13"] },
  { name: "Chedraui selecto", layers: ["a14"] },
  { name: "Frutos Prohibidos", layers: ["a15", "a16"] },
  { name: "Sanamente", mark: { bg: "#E7F6EC", ink: "#146C36", glyph: "leaf" } },
  { name: "Los Tolucos", mark: { bg: "#FFF1D6", ink: "#9A4D00", glyph: "taco" } },
  { name: "Bacy", mark: { bg: "#F3E8FF", ink: "#6B21A8", glyph: "dot" } },
  { name: "Oakberry", mark: { bg: "#2B1240", ink: "#F4C6FF", glyph: "berry" } },
  { name: "Fougasse", mark: { bg: "#F8E7D4", ink: "#7A3E12", glyph: "wheat" } },
  { name: "Hat Trick", mark: { bg: "#111111", ink: "#F5C518", glyph: "burger" } },
  { name: "Panadería Luna", mark: { bg: "#E8EEF8", ink: "#1E3A8A", glyph: "moon" } },
  { name: "Poké Isla", mark: { bg: "#D9F3F0", ink: "#0F6B62", glyph: "bowl" } },
  { name: "Café Nube", mark: { bg: "#F4EFE6", ink: "#4A3424", glyph: "cup" } },
  { name: "Sushi Ichi", mark: { bg: "#FFE4E4", ink: "#9F1239", glyph: "fish" } },
  { name: "Tacos El Farol", mark: { bg: "#FFE8D6", ink: "#C2410C", glyph: "flame" } },
  { name: "Bowl Verde", mark: { bg: "#E4F7D9", ink: "#3F6212", glyph: "bowl" } },
  { name: "Helados Polar", mark: { bg: "#E4F2FF", ink: "#1D4ED8", glyph: "ice" } },
  { name: "Pan & Miel", mark: { bg: "#FFF4D6", ink: "#92400E", glyph: "bun" } },
  { name: "Mariscos Azul", mark: { bg: "#DCECFF", ink: "#1E40AF", glyph: "fish" } },
  { name: "Pizza Nido", mark: { bg: "#FFE4D6", ink: "#B42318", glyph: "pizza" } },
  { name: "Jugos Sol", mark: { bg: "#FFF7CC", ink: "#A16207", glyph: "sun" } },
  { name: "Empanada Sur", mark: { bg: "#FDE68A", ink: "#78350F", glyph: "bag" } },
  { name: "Matcha Bar", mark: { bg: "#DCFCE7", ink: "#166534", glyph: "leaf" } },
  { name: "Churros Fuego", mark: { bg: "#FEE2E2", ink: "#991B1B", glyph: "flame" }, turbo: true },
  { name: "Açaí Norte", mark: { bg: "#EDE9FE", ink: "#5B21B6", glyph: "berry" } },
  { name: "Ramen Kumo", mark: { bg: "#FFEDD5", ink: "#9A3412", glyph: "bowl" } },
  { name: "Café Estrella", mark: { bg: "#111827", ink: "#FDE68A", glyph: "star" } },
];

function StoreMark({ bg, ink, glyph }: { bg: string; ink: string; glyph: StoreGlyph }) {
  return <svg className="store-mark" viewBox="0 0 72 72" aria-hidden="true">
    <circle cx="36" cy="36" r="36" fill={bg} />
    {glyph === "leaf" && <path fill={ink} d="M36 16c10 8 16 18 16 28a16 16 0 0 1-32 0c0-10 6-20 16-28Zm0 14v18" />}
    {glyph === "cup" && <path fill={ink} d="M22 24h24v16a10 10 0 0 1-20 0h-4a6 6 0 0 1 0-12h4Zm4 30h16v4H26Z" />}
    {glyph === "berry" && <path fill={ink} d="M36 18c8 6 14 14 14 22a14 14 0 1 1-28 0c0-8 6-16 14-22Zm-6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />}
    {glyph === "bun" && <path fill={ink} d="M20 40c0-10 7-16 16-16s16 6 16 16v8H20Zm6 12h20v4H26Z" />}
    {glyph === "burger" && <path fill={ink} d="M20 32c0-8 7-12 16-12s16 4 16 12H20Zm0 6h32v5H20Zm2 9c0 5 6 8 14 8s14-3 14-8H22Z" />}
    {glyph === "sun" && <path fill={ink} d="M36 24a12 12 0 1 1 0 24 12 12 0 0 1 0-24Zm0-10v6m0 32v6m22-22h-6M20 36h-6m31.5-15.5-4.2 4.2M24.7 47.3l-4.2 4.2m31.8 0-4.2-4.2M24.7 24.7 20.5 20.5" />}
    {glyph === "fish" && <path fill={ink} d="M18 36c10-12 20-14 30-8 4 2 7 5 8 8-1 3-4 6-8 8-10 6-20 4-30-8Zm30 0-8-7v14Z" />}
    {glyph === "taco" && <path fill={ink} d="M18 42c0-12 8-20 18-20s18 8 18 20H18Zm8-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />}
    {glyph === "bowl" && <path fill={ink} d="M18 34h36c-1 12-8 20-18 20S19 46 18 34Zm8-10 6 8 4-10 4 10 6-8" />}
    {glyph === "ice" && <path fill={ink} d="M36 16l10 18H26L36 16Zm-8 22h16l-8 18Z" />}
    {glyph === "wheat" && <path fill={ink} d="M36 16c8 8 8 16 0 22-8-6-8-14 0-22Zm0 10c8 8 8 16 0 22-8-6-8-14 0-22Zm0 10v20" />}
    {glyph === "pizza" && <path fill={ink} d="M20 48 36 16l16 32H20Zm10-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />}
    {glyph === "drop" && <path fill={ink} d="M36 16c10 14 14 20 14 28a14 14 0 1 1-28 0c0-8 4-14 14-28Z" />}
    {glyph === "moon" && <path fill={ink} d="M42 18a18 18 0 1 0 8 28 16 16 0 0 1-8-28Z" />}
    {glyph === "flame" && <path fill={ink} d="M36 16c8 10 14 16 14 26a14 14 0 1 1-28 0c4-6 8-8 8-16 4 4 6 8 6 14 0-10 0-18 0-24Z" />}
    {glyph === "star" && <path fill={ink} d="M36 16l5 14h15l-12 9 5 15-13-9-13 9 5-15-12-9h15Z" />}
    {glyph === "bag" && <path fill={ink} d="M26 28h20l2 24H24l2-24Zm4 0c0-4 3-7 6-7s6 3 6 7" />}
    {glyph === "dot" && <circle cx="36" cy="36" r="12" fill={ink} />}
  </svg>;
}

const TICKET_MIN = 80;
const ITEM_PRICE = 20;
const PRO_MIN = 50;
const storeProducts = [
  { img: "p1", price: "$20" },
  { img: "p2", price: "$20" },
  { img: "p3", price: "$20" },
];
const storeGrid = [
  { img: "p4", price: "$20" },
  { img: "p5", price: "$20" },
  { img: "p6", price: "$20" },
  { img: "p2", price: "$20" },
];

function StoreProductCard({ img, price, wide, onAdd, hot, hotN = 2 }: { img: string; price: string; wide?: boolean; onAdd: () => void; hot?: boolean; hotN?: number }) {
  return <div className={`sd-prod${wide ? " wide" : ""}`}>
    <div className="sd-prod-img">
      <img src={`assets/figma/store/${img}.png`} alt="" />
      <button className={`sd-plus${hot ? " is-hotspot" : ""}`} onClick={onAdd} aria-label="Agregar">
        <img src="assets/figma/store/plus.svg" alt="" width={40} height={40} />
        {hot && <HotNum n={hotN} />}
      </button>
    </div>
    <b>{price}</b>
    <p>Nombre de producto</p>
  </div>;
}

function money(n: number) {
  return `$${n}`;
}

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

function StoreOfferCards({ teslaPct, promoPct, onTesla, hot = true, tesla = true, hotN = 1 }: { teslaPct: number; promoPct: number; onTesla: () => void; hot?: boolean; tesla?: boolean; hotN?: number }) {
  return <div className="sd-offers">
    {tesla ? <button className={`sd-offer tesla${hot ? " is-hotspot" : ""}`} onClick={onTesla}>
      <img className="sd-offer-bg" src="assets/figma/store/offer-tesla.svg" alt="" width={151} height={72} />
      <img className="sd-offer-word" src="assets/figma/store/offer-word.svg" alt="TESLA" width={42} height={5} />
      <span className="sd-offer-copy"><p>1 Boleto Tesla</p><small>Min: $80</small></span>
      <i className="sd-bar"><i style={{ width: `${teslaPct}%` }} /></i>
      <em>Aplica T&C</em>
      {hot && <HotNum n={hotN} />}
    </button> : null}
    <div className="sd-offer promo">
      <img className="sd-offer-bg" src="assets/figma/store/offer-promo.svg" alt="" width={151} height={72} />
      <img className="sd-moto" src="assets/figma/store/moto.svg" alt="" width={16} height={16} />
      <span className="sd-offer-copy"><p>Envío gratis Pro</p><small>Min: $100</small></span>
      <span className="sd-offer-tcrow">
        <i className="sd-bar"><i style={{ width: `${promoPct}%` }} /></i>
        <em>Aplica T&C</em>
      </span>
    </div>
  </div>;
}

function DockOfferIcon({ unlocked }: { unlocked: boolean }) {
  return <span className={`sd-dock-ico${unlocked ? " check" : ""}`}>
    {unlocked
      ? <img src="assets/figma/store/ico-check.svg" alt="" width={16} height={16} />
      : <img src="assets/figma/store/ico-tesla.svg" alt="" width={28} height={16} />}
  </span>;
}

function StoreBasketDock({
  qty, total, remain, unlocked, onBenefits, onCart, cta = "Ver canasta", bare = false, tesla = true, hot = true, hotN = 4, offerN = 3, barFocus = false,
}: {
  qty: number; total: number; remain: number; unlocked: boolean;
  onBenefits: () => void; onCart: () => void; cta?: string; bare?: boolean; tesla?: boolean; hot?: boolean; hotN?: number; offerN?: number; barFocus?: boolean;
}) {
  const pct = Math.min(100, (total / TICKET_MIN) * 100);
  const thumbs = qty > 1 ? ["assets/figma/store/p2.png", "assets/figma/store/p1.png"] : ["assets/figma/store/p1.png"];
  return <div className={`sd-dock${bare ? " in-flow" : ""}${!bare && tesla && unlocked ? " is-celeb" : ""}`}>
    {!bare && tesla && <div className={`sd-game${unlocked ? " on" : ""}`}>
      {unlocked && <div className="sd-celeb" aria-hidden="true">
        <div className="sd-celeb-grad" />
        <div className="sd-celeb-copy">
          <span className="sd-confetti left" />
          <div className="sd-celeb-text">
            <p>1 Boleto</p>
            <img src="assets/figma/tesla-wordmark.svg" alt="TESLA" width={96} height={12} />
          </div>
          <span className="sd-confetti right" />
        </div>
      </div>}
      <div className={`sd-dock-bar${barFocus ? " is-hotspot" : ""}`}>
        {barFocus && <HotNum n={1} />}
        <button type="button" className={`sd-dock-offer${hot ? " is-hotspot" : ""}`} onClick={onBenefits}>
          <DockOfferIcon unlocked={unlocked} />
          <div>
            <b className={unlocked ? "ok" : ""}>{unlocked ? "¡Conseguiste tu beneficio!" : "1 Boleto Tesla"}</b>
            {!unlocked && <small>Agrega {money(remain)} más para conseguirlo</small>}
          </div>
          <span className="sd-chip">{tesla ? "2 beneficios" : "1 beneficio"}{unlocked ? <ChevronUp size={14} /> : <ChevronRight size={14} />}</span>
          {hot && <HotNum n={offerN} />}
        </button>
        <div className={`sd-dock-track${unlocked ? " full" : ""}`}><i><i style={{ width: `${pct}%` }} /></i></div>
      </div>
    </div>}
    {qty > 0 && <div className="sd-dock-buy">
      <button type="button" className="sd-dock-thumbs" onClick={onBenefits} aria-label="Productos en canasta">
        <span className={`sd-dock-pics n-${thumbs.length}`}>
          {thumbs.map((src, i) => (
            <span className="sd-dock-pic" key={src + i}>
              <img src={src} alt="" />
              {i === thumbs.length - 1 && <b>{qty}</b>}
            </span>
          ))}
        </span>
      </button>
      <span className="sd-dock-total">{money(total)}</span>
      <button type="button" className={`sd-cta lg${hot ? " is-hotspot" : ""}`} onClick={onCart}>{cta}{hot && <HotNum n={hotN} />}</button>
    </div>}
  </div>;
}

type StoreView = "join" | "sold" | "store" | "offer" | "cart" | "checkout" | "checkoutAsk" | "checkoutSold" | "created" | "createdClean" | "transit" | "transitClean" | "delivered" | "deliveredClean" | "won" | "confirm";

type StoreFocus = "badge" | "offer" | "bar" | "banner" | "rt";

function storePhaseFromView(view: StoreView): StorePhase {
  if (view === "createdClean") return "created";
  if (view === "transitClean") return "transit";
  if (view === "deliveredClean") return "delivered";
  if (view === "checkoutSold") return "checkout";
  if (view === "sold") return "join";
  if (view === "store") return "store";
  return view;
}

function StoreDestScreen({ back, openLegal, onTicketWon, onGoHub, onView, startPhase = "join", soldOut = false, focus, startQty, startBenefits = false }: { back: () => void; openLegal?: (doc?: "bases" | "privacy") => void; onTicketWon?: (t: TicketInfo) => void; onGoHub?: () => void; onView?: (v: StoreView) => void; startPhase?: StorePhase; soldOut?: boolean; focus?: StoreFocus; startQty?: number; startBenefits?: boolean }) {
  const [joinOpen, setJoinOpen] = useState(startPhase === "join");
  const [joined, setJoined] = useState(startPhase !== "join" && startPhase !== "checkoutAsk");
  const [offerOpen, setOfferOpen] = useState(startPhase === "offer");
  const [benefitsOpen, setBenefitsOpen] = useState(startBenefits);
  const [cartOpen, setCartOpen] = useState(startPhase === "cart");
  const overlayPhase = startPhase === "join" || startPhase === "confirm" || startPhase === "offer" || startPhase === "cart";
  const initialPhase = startPhase === "checkoutAsk" ? "checkout" : overlayPhase ? "store" : startPhase;
  const [phase, setPhase] = useState<"store" | "checkout" | "created" | "transit" | "delivered" | "won">(initialPhase);
  const [countryOpen, setCountryOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(startPhase === "confirm");
  const [toast, setToast] = useState(false);
  const [fullName, setFullName] = useState("Pedro Atuesta Gomez");
  const [phone, setPhone] = useState("312 1231-2312");
  const [dial, setDial] = useState("+52");
  const seededCart = startPhase === "cart" || startPhase === "checkout" || startPhase === "checkoutAsk" || startPhase === "created" || startPhase === "transit" || startPhase === "delivered" || startPhase === "won" || startPhase === "confirm";
  const [qty, setQty] = useState(startQty ?? (seededCart ? 4 : 0));
  const total = qty * ITEM_PRICE;
  const remain = Math.max(0, TICKET_MIN - total);
  const unlocked = total >= TICKET_MIN;
  const teslaPct = qty === 0 ? 17 : Math.min(100, (total / TICKET_MIN) * 100);
  const promoPct = qty === 0 ? 6 : Math.min(100, (total / 100) * 100);
  const proApplied = total >= PRO_MIN;
  const add = () => setQty(q => q + 1);
  const dec = () => setQty(q => {
    const next = Math.max(0, q - 1);
    if (next === 0) { setCartOpen(false); setBenefitsOpen(false); }
    return next;
  });
  const clear = () => { setQty(0); setCartOpen(false); setBenefitsOpen(false); };
  const acceptJoin = () => {
    console.log({ loc: "store:acepto_participar", store: "Nombre de la tienda", ts: Date.now() });
    setJoined(true);
    setJoinOpen(false);
  };
  useEffect(() => {
    onView?.(confirmOpen ? "confirm" : phase === "created" ? (joined ? "created" : "createdClean") : phase === "transit" ? (joined ? "transit" : "transitClean") : phase === "delivered" ? (joined ? "delivered" : "deliveredClean") : phase === "won" ? "won" : phase === "checkout" ? (soldOut ? "checkoutSold" : joined ? "checkout" : "checkoutAsk") : cartOpen ? "cart" : offerOpen ? "offer" : joinOpen ? (soldOut ? "sold" : "join") : "store");
  }, [phase, offerOpen, joinOpen, cartOpen, confirmOpen, joined, soldOut, onView]);
  const openCart = () => { setBenefitsOpen(false); setCartOpen(true); };
  const benTop = total <= PRO_MIN
    ? 12 + (total / PRO_MIN) * 72
    : 84 + (Math.min(total, TICKET_MIN) - PRO_MIN) / (TICKET_MIN - PRO_MIN) * 72;

  const teslaOn = joined && !soldOut;
  const storeHot = phase === "store" && !joinOpen && !offerOpen && !benefitsOpen && !cartOpen;
  const barFocus = focus === "bar";
  const badgeHot = storeHot && !soldOut && focus === "badge";
  const offerHot = storeHot && !soldOut && (!focus || focus === "offer");
  const plusHot = storeHot && !focus;
  const nOffer = offerHot ? (badgeHot ? 2 : 1) : 0;
  const nPlus = Math.max(badgeHot ? 1 : 0, nOffer) + 1;
  const nDockOffer = plusHot ? nPlus + 1 : nPlus;
  const nDockCta = soldOut || !joined ? nDockOffer : nDockOffer + 1;
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scroller.current;
    if (!root || !focus) return;
    const go = () => { root.scrollTop = 0; };
    go();
    const frame = requestAnimationFrame(() => { go(); requestAnimationFrame(go); });
    return () => cancelAnimationFrame(frame);
  }, [focus]);

  return <div className="screen store-dest">
    <div className={`sd-scroll${qty > 0 && !cartOpen ? ` has-dock${unlocked ? " celeb" : ""}` : ""}`} data-scroll="store-dest" ref={scroller}>
      <div className="sd-hero">
        <img className="sd-hero-img" src="assets/figma/store/hero.png" alt="" />
        <StatusBar />
        <div className="sd-nav">
          <button className="sd-ico" onClick={back} aria-label="Cerrar">
            <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
          </button>
          <span className="sd-nav-grow" />
          <span className="sd-ico" aria-hidden="true"><Search size={18} /></span>
          <span className="sd-ico" aria-hidden="true"><Share size={18} /></span>
          <span className="sd-ico" aria-hidden="true"><Bookmark size={18} /></span>
        </div>
        {soldOut ? null : <span className={`sd-tag${badgeHot ? " is-hotspot" : ""}`}><span className="chub-tag-label">BOLETO TESLA</span><i className="chub-tag-car"><img src="assets/figma/home/tesla-a.png" alt="" /></i>{badgeHot && <HotNum n={1} />}</span>}
      </div>
      <div className="sd-id">
        <div className="sd-logo" aria-hidden="true"><Store size={14} /><span>Tienda</span></div>
        <h1>Nombre de la tienda</h1>
      </div>
      <div className="sd-info">
        <div><small>Entrega</small><b>30 min</b></div>
        <div><small>Envío</small><b>$14.00</b></div>
        <div>
          <small>Calificación</small>
          <b><img src="assets/figma/store/star.svg" alt="" width={12} height={12} />4.5 <em>(1240)</em></b>
        </div>
      </div>
      <StoreOfferCards teslaPct={teslaPct} promoPct={promoPct} onTesla={() => { if (!soldOut) setOfferOpen(true); }} hot={offerHot} hotN={nOffer} tesla={!soldOut} />
      <div className="sd-tabs">
        <button className="on">Favoritos</button>
        <button>Novedades</button>
        <button>Categoría</button>
        <button>Categoría</button>
      </div>
      <div className="sd-sec">
        <div className="sd-sec-h"><b>Tus Favoritos</b><ChevronRight size={18} color="#919aaa" /></div>
        <div className="sd-row">{storeProducts.map((p, i) => <StoreProductCard key={p.img + p.price} {...p} onAdd={add} hot={plusHot && i === 0} hotN={nPlus} />)}</div>
      </div>
      <div className="sd-sec">
        <div className="sd-sec-h"><b>Novedades</b><ChevronRight size={18} color="#919aaa" /></div>
        <div className="sd-grid">{storeGrid.map((p, i) => <StoreProductCard key={p.img + i} {...p} wide onAdd={add} />)}</div>
      </div>
    </div>

    {(qty > 0 || barFocus) && phase === "store" && !cartOpen && !benefitsOpen && (
      <StoreBasketDock qty={qty} total={total} remain={remain} unlocked={unlocked} tesla={teslaOn} onBenefits={() => setBenefitsOpen(true)} onCart={openCart} hot={!focus} hotN={nDockCta} offerN={nDockOffer} barFocus={barFocus} />
    )}

    {joinOpen && soldOut && <div className="sd-layer" {...sheetDismiss(() => setJoinOpen(false))}>
      <button className="sd-dim is-hotspot" aria-label="Cerrar" onClick={() => setJoinOpen(false)}>
        <HotNum n={2} />
      </button>
      <div className="sd-sheet sd-sold-sheet">
        <h2>Se terminaron los boletos para el sorteo de hoy</h2>
        <div className="sd-sold-mid">
          <img className="sd-sold-word" src="assets/figma/home/tesla-word.svg" alt="" width={65} height={8} />
          <p>No recibirás un boleto para el sorteo con este pedido.</p>
          <div className="sd-sold-car">
            <img src="assets/figma/home/tesla-a.png" alt="" width={153} height={86} />
          </div>
        </div>
        <button type="button" className="sd-sold-ok is-hotspot" onClick={() => setJoinOpen(false)}>Entendido<HotNum n={1} /></button>
      </div>
    </div>}

    {joinOpen && !soldOut && <div className="sd-layer" {...sheetDismiss(() => setJoinOpen(false))}>
      <button className="sd-dim is-hotspot" aria-label="Cerrar" onClick={() => setJoinOpen(false)}>
        <HotNum n={4} />
      </button>
      <div className="sd-sheet sd-join-sheet">
        <h2>Participa en el sorteo<br />de un Tesla diario</h2>
        <img className="sd-join-car" src="assets/figma/tesla-white-side.png" alt="" width={341} height={191} />
        <p className="sd-join-legal">Al tocar “Acepto participar” aceptas los <button type="button" className="sd-join-tc is-hotspot" onClick={() => openLegal?.("bases")}>T&C<HotNum n={3} /></button></p>
        <button className="sd-join-accept is-hotspot" onClick={acceptJoin}>Acepto participar<ArrowRight size={18} /><HotNum n={1} /></button>
        <button className="sd-join-skip is-hotspot" onClick={() => { setJoined(false); setJoinOpen(false); }}>No quiero participar<HotNum n={2} /></button>
      </div>
    </div>}

    {offerOpen && !soldOut && <div className="sd-layer sd-offer-layer" {...sheetDismiss(() => setOfferOpen(false))}>
      <button type="button" className="sd-dim is-hotspot" aria-label="Cerrar" onClick={() => setOfferOpen(false)}>
        <HotNum n={3} />
      </button>
      <div className="sd-popup">
        <div className="sd-offer-sheet-head">
          <img className="sd-offer-id" src="assets/figma/store/offer-id.png" alt="TESLA" width={159} height={30} />
          <button type="button" className="sd-close is-hotspot" onClick={() => setOfferOpen(false)} aria-label="Cerrar">
            <img src="assets/figma/store/offer-close.svg" alt="" width={24} height={24} />
            <HotNum n={1} />
          </button>
        </div>
        <div className="sd-offer-main">
          <div className="sd-offer-copy-wrap">
            <h2>Pide y gana 1 boleto para el sorteo de un Tesla</h2>
            <div className="sd-offer-copy-body">
              <p>Cada pedido que hagas de mínimo: $80 en esta tienda te da 1 boleto para participar.</p>
              <p>Cada día se sortea 1 Tesla: si tu boleto tienes el número exacto te lo ganas.</p>
              <p>Tus boleto estarán disponibles una vez el pedido sea entregado.</p>
            </div>
          </div>
          <button type="button" className="sd-offer-tc" onClick={() => openLegal?.("bases")}>Términos & Condiciones.</button>
          <div className="sd-offer-prog">
            <div className="sd-offer-prog-row">
              <div className="sd-offer-prog-track">
                <i className="sd-offer-prog-fill" style={{ width: `${Math.min(100, (total / TICKET_MIN) * 100)}%` }} />
              </div>
              <span>$80</span>
            </div>
            <div className="sd-offer-pointer" style={{ left: `${Math.min(246, Math.max(20, (total / TICKET_MIN) * 278))}px` }}>
              <img className="sd-offer-dots" src="assets/figma/store/line-dots.svg" alt="" />
              <span className="sd-offer-bubble">{money(total)}</span>
            </div>
          </div>
        </div>
        <div className="sd-offer-div" aria-hidden="true" />
        <div className="sd-offer-bottom">
          <button type="button" className="sd-cta full is-hotspot" onClick={() => setOfferOpen(false)}>Entendido<HotNum n={2} /></button>
        </div>
      </div>
    </div>}

    {benefitsOpen && <div className="sd-layer" {...sheetDismiss(() => setBenefitsOpen(false))}>
      <button className="sd-dim" aria-label="Cerrar" onClick={() => setBenefitsOpen(false)} />
      <div className="sd-sheet sd-ben-sheet">
        <div className="sd-ben-head">
          <h2>Completa y ahorra</h2>
          <button className="sd-close" onClick={() => setBenefitsOpen(false)} aria-label="Cerrar">
            <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
          </button>
        </div>
        <div className={`sd-ben-list${barFocus ? " is-hotspot" : ""}`}>
          {barFocus && <HotNum n={1} />}
          <div className="sd-ben-rail" />
          <div className="sd-ben-line"><i style={{ height: `${Math.min(100, (total / TICKET_MIN) * 100)}%` }} /></div>
          <div className="sd-ben-steps">
            <div className="sd-ben-row">
              <div className="sd-ben-amt"><span>$0</span><span className="sd-ben-dot"><Check size={10} strokeWidth={3} /></span></div>
              <p className="sd-ben-hint">{teslaOn ? "Tienes 2 beneficios por desbloquear" : "Tienes 1 beneficio por desbloquear"}</p>
            </div>
            <div className="sd-ben-row">
              <div className="sd-ben-amt"><span>$50</span><span className={`sd-ben-dot${proApplied ? "" : " lock"}`}>{proApplied ? <Check size={10} strokeWidth={3} /> : <img src="assets/figma/store/moto.svg" alt="" width={10} height={10} />}</span></div>
              <div className="sd-ben-txt">
                <b>Envío gratis por ser Pro</b>
                <small className={proApplied ? "ok" : ""}>{proApplied ? "Aplicado" : `Te faltan ${money(Math.max(0, PRO_MIN - total))}`}</small>
              </div>
            </div>
            {teslaOn && <div className="sd-ben-row">
              <div className="sd-ben-amt"><span>$80</span><span className={`sd-ben-dot${unlocked ? "" : " lock"}`}>{unlocked ? <Check size={10} strokeWidth={3} /> : <Ticket size={10} />}</span></div>
              <div className="sd-ben-txt">
                <img src="assets/figma/tesla-wordmark.svg" alt="TESLA" />
                <b>1 Boleto Tesla</b>
                <small className={unlocked ? "ok" : ""}>{unlocked ? "¡Conseguiste el beneficio!" : `Te faltan ${money(remain)}`}</small>
              </div>
            </div>}
          </div>
          <div className="sd-ben-pin" style={{ top: `${benTop}px` }}><b>{money(total)}</b><i /></div>
        </div>
        <StoreBasketDock qty={qty} total={total} remain={remain} unlocked={unlocked} tesla={teslaOn} onBenefits={() => {}} onCart={openCart} bare hot={!focus} hotN={nDockCta} offerN={nDockOffer} />
      </div>
    </div>}

    {cartOpen && <div className="sd-cart">
      <StatusBar />
      <div className="sd-cart-nav">
        <div className="sd-cart-nav-row">
          <button className="sd-close" onClick={() => setCartOpen(false)} aria-label="Cerrar">
            <img src="assets/figma/store/close.svg" alt="" width={24} height={24} />
          </button>
          <h1>Nombre de la tienda</h1>
          <button className="sd-cart-store" onClick={() => setCartOpen(false)}>Ver tienda<ChevronRight size={14} /></button>
        </div>
        <span className="sd-cart-tag">Envío gratis</span>
      </div>
      <div className="sd-cart-scroll">
        {qty > 0 && <div className="sd-cart-line">
          <img src="assets/figma/store/p1.png" alt="" />
          <div>
            <p>Nombre de producto</p>
            <b>{money(ITEM_PRICE)}</b>
          </div>
          <div className="sd-stepper">
            <button onClick={dec} aria-label="Quitar"><Minus size={16} /></button>
            <span>{qty}</span>
            <button onClick={add} aria-label="Agregar">+</button>
          </div>
        </div>}
        <button className="sd-empty-cart" onClick={clear}>Vaciar canasta</button>
        <div className="sd-upsell">
          <h3>Completa tu pedido</h3>
          <div className="sd-upsell-row">
            {storeGrid.slice(0, 3).map(p => <div className="sd-up" key={p.img}>
              <img className="pic" src={`assets/figma/store/${p.img}.png`} alt="" />
              <button className="sd-plus" onClick={add} aria-label="Agregar"><img src="assets/figma/store/plus.svg" alt="" width={40} height={40} /></button>
              <b>$20</b>
              <p>Nombre de producto</p>
            </div>)}
          </div>
        </div>
      </div>
      <div className="sd-dock">
        <div className="sd-dock-main">
        {teslaOn && <div className={`sd-dock-bar${barFocus ? " is-hotspot" : ""}`}>
          {barFocus && <HotNum n={1} />}
          <button className="sd-dock-offer" onClick={() => { setCartOpen(false); setBenefitsOpen(true); }}>
            <DockOfferIcon unlocked={unlocked} />
            <div>
              <b className={unlocked ? "ok" : ""}>{unlocked ? "¡Conseguiste tu beneficio!" : "1 Boleto Tesla"}</b>
              {!unlocked && <small>Agrega {money(remain)} más para conseguirlo</small>}
            </div>
            <span className="sd-chip">{teslaOn ? "2 beneficios" : "1 beneficio"}<ChevronRight size={14} /></span>
          </button>
          <div className={`sd-dock-track${unlocked ? " full" : ""}`}><i><i style={{ width: `${Math.min(100, (total / TICKET_MIN) * 100)}%` }} /></i></div>
        </div>}
        <div className="sd-dock-buy">
          <span className="sd-dock-total">{money(total)}</span>
          <button className={`sd-cta lg${focus ? "" : " is-hotspot"}`} onClick={() => setPhase("checkout")}>Continuar{focus ? null : <HotNum n={1} />}</button>
        </div>
        </div>
      </div>
    </div>}

    {phase === "checkout" && <CheckoutScreen back={() => setPhase("store")} joined={joined} soldOut={soldOut} total={total || 80} onJoin={() => setJoined(true)} onContinue={() => setPhase("created")} focusBanner={focus === "banner"} />}
    {phase === "created" && <OrderCreatedScreen joined={joined} onNext={() => setPhase("transit")} onHub={onGoHub} />}
    {phase === "transit" && <OrderTransitScreen joined={joined} onNext={() => setPhase("delivered")} onHub={onGoHub} focusRt={focus === "rt"} />}
    {phase === "delivered" && <OrderDeliveredScreen joined={joined} onTicket={() => setPhase("won")} toast={toast} onToast={() => { onTicketWon?.(WON_TICKET); onGoHub?.(); }} />}
    {phase === "won" && <TicketWonScreen name={fullName} phone={phone} dial={dial} onName={setFullName} onPhone={setPhone} onDial={setDial} onCountry={() => setCountryOpen(true)} onConfirm={() => setConfirmOpen(true)} />}
    {countryOpen && <CountryPicker onClose={() => setCountryOpen(false)} onPick={d => { setDial(d); setCountryOpen(false); }} />}
    {confirmOpen && <ConfirmDataSheet name={fullName} phone={phone} dial={dial} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); setPhase("delivered"); setToast(true); onTicketWon?.(WON_TICKET); }} />}
  </div>;
}

function StoresListScreen({ back, openStore, variant = "normal" }: { back: () => void; openStore?: () => void; variant?: StoresVariant }) {
  const [collapsed, setCollapsed] = useState(false);
  const mapCoverage = variant === "noCoverage";
  const empty = variant === "noStoresDay";
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setCollapsed(!empty && !mapCoverage && el.scrollTop > 36);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [empty, mapCoverage]);
  return <div
    ref={scroller}
    className={`screen stores-list${collapsed ? " is-collapsed" : ""}${mapCoverage ? " is-map" : ""}${empty ? " is-empty" : ""}`}
    data-scroll="stores-list"
  >
    {empty && <div className="stores-tesla" aria-hidden="true">
      <img src="assets/figma/home/tesla-a.png" alt="" width={165} height={92} />
    </div>}
    <div className="stores-sticky">
      <StatusBar />
      <div className="stores-nav">
        <button className="stores-back is-hotspot" onClick={back} aria-label="Atrás">
          <img src="assets/figma/stores/arrow-back-ios.svg" alt="" width={24} height={24} />
          <HotNum n={1} />
        </button>
        <h1 className="stores-compact">{mapCoverage ? "Zonas de cobertura" : "Tiendas participantes hoy"}</h1>
      </div>
    </div>
    <div className="stores-head">
      {!mapCoverage && !empty && <div className="stores-tesla" aria-hidden="true">
        <img src="assets/figma/home/tesla-a.png" alt="" width={165} height={92} />
      </div>}
      <h1 className="stores-title">{mapCoverage ? "Zonas de cobertura" : <>Tiendas<br />participantes HOY</>}</h1>
      <p className="stores-sub">{mapCoverage ? "En estas zonas hay cobertura de tiendas donde puedes ganar boletos Tesla" : "Gana 1 boleto por cada pedido que hagas en estas tiendas el día de hoy."}</p>
    </div>
    {mapCoverage ? <div className="stores-map" aria-label="Zonas de cobertura">
      <img className="stores-map-img" src="assets/figma/map/cover.png" alt="" width={375} height={620} />
      <img className="stores-map-zone a" src="assets/figma/map/zone-a.svg" alt="" width={303} height={315} />
      <img className="stores-map-zone b" src="assets/figma/map/zone-b.svg" alt="" width={256} height={130} />
      <img className="stores-map-pin" src="assets/figma/map/gps.svg" alt="" width={38} height={38} />
      <button type="button" className="stores-map-locate" aria-label="Mi ubicación">
        <img src="assets/figma/map/locate.svg" alt="" width={24} height={24} />
      </button>
    </div> : empty ? <div className="stores-none empty-coverage">
      <img src="assets/figma/empty-shop.svg" alt="" width={48} height={48} />
      <div>
        <b>Hoy no hay tiendas participantes<br />en tu zona</b>
        <small>Regresa mañana</small>
      </div>
    </div> : <div className="stores-grid">
      {storeList.map((s, i) => <button className="store-cell is-hotspot" key={s.name + i} onClick={openStore}>
        <div className={`store-avatar${s.turbo ? " has-turbo" : ""}`}>
          {s.layers?.map((l, j) => <img key={j} src={`assets/figma/stores/${l}.png`} alt="" />)}
          {s.mark && <StoreMark {...s.mark} />}
          {s.turbo && <span className="store-turbo"><img src="assets/figma/stores/turbo.svg" alt="Turbo" /></span>}
        </div>
        <b>{s.name}</b>
        <small>Min: $80</small>
        <HotNum n={2} />
      </button>)}
    </div>}
  </div>;
}

type ResultDraw = {
  n: string;
  date: string;
  dateLong: string;
  winner: string;
  city: string;
  winCode: string;
  lead: string;
  tickets: { code: string; store: string }[];
};

const resultDraws: ResultDraw[] = [
  {
    n: "Sorteo N°5", date: "Agosto 16", dateLong: "Agosto 16 de 2026",
    winner: "Pedro Atuesta", city: "CDMX", winCode: "5312-A",
    lead: "Hoy se lo ganó Pedro Atuesta. Mañana puedes ser tú.",
    tickets: [
      { code: "4311-A", store: "Sanamente gourmet" },
      { code: "3762-J", store: "Los Tolucos" },
      { code: "276·24", store: "Bacy" },
    ],
  },
  {
    n: "Sorteo N°4", date: "Agosto 15", dateLong: "Agosto 15 de 2026",
    winner: "Ana García", city: "GDL", winCode: "8842-K",
    lead: "Hoy se lo ganó Ana García. Mañana puedes ser tú.",
    tickets: [
      { code: "5120-B", store: "Starbucks" },
      { code: "1188-C", store: "Nonna" },
    ],
  },
  {
    n: "Sorteo N°3", date: "Agosto 14", dateLong: "Agosto 14 de 2026",
    winner: "Luis Ortega", city: "MTY", winCode: "1094-M",
    lead: "Hoy se lo ganó Luis Ortega. Mañana puedes ser tú.",
    tickets: [
      { code: "7001-D", store: "Green Grass" },
      { code: "7008-E", store: "Massima" },
      { code: "7022-F", store: "Tierra Garat" },
    ],
  },
  {
    n: "Sorteo N°2", date: "Agosto 13", dateLong: "Agosto 13 de 2026",
    winner: "María López", city: "CUN", winCode: "3307-P",
    lead: "Hoy se lo ganó María López. Mañana puedes ser tú.",
    tickets: [],
  },
];

function PrevResultsScreen({ back, openStores, openTicket, openYoutube, winner = false, delivered = false, live = false }: { back: () => void; openStores: () => void; openTicket?: (t: TicketInfo) => void; openYoutube?: () => void; winner?: boolean; delivered?: boolean; live?: boolean }) {
  const [chip, setChip] = useState(0);
  const [playing, setPlaying] = useState(false);
  const draw = resultDraws[chip];
  const liveNow = live && chip === 0 && !winner && !delivered;
  const replay = !liveNow && !winner && !delivered;
  const openVideo = () => { if (openYoutube) openYoutube(); else setPlaying(true); };
  return <div className="screen prev-results" data-scroll="prev-results"><StatusBar />
    <div className="res-head">
      <button className="stores-back is-hotspot" onClick={back} aria-label="Atrás">
        <img src="assets/figma/stores/arrow-back-ios.svg" alt="" width={24} height={24} />
        <HotNum n={1} />
      </button>
      <h1>Resultados</h1>
    </div>
    <div className="res-chips">
      {resultDraws.map((c, i) => (
        <button key={c.n} className={i === chip ? "on is-hotspot" : "is-hotspot"} onClick={() => { setChip(i); setPlaying(false); }}>
          {c.n}<small>{c.date}</small>
          {i === 0 && <HotNum n={2} />}
        </button>
      ))}
    </div>
    {liveNow ? <>
      <p className="res-lead">El sorteo está en curso...<br />¡Pronto tendremos un nuevo ganador!</p>
      <DrawVideo live playing={playing} onPlay={openVideo} n={3} />
      <p className="res-live-title">¡Mira el sorteo en vivo!</p>
      <p className="res-live-when">Agosto 16 de 2026 · 14:00 hrs</p>
      <i className="res-live-line" />
      <p className="res-played">Boletos con los que estas participando:</p>
      <div className="res-tix is-grid">{boletosList.map(t => <TeslaTicket key={t.code} {...t} sorteo="Sorteo N°5" n={4} onClick={openTicket} />)}</div>
    </> : <>
      <p className="res-lead">{winner ? "¡Hoy eres el ganador del Tesla!" : delivered ? "¡Ya entregamos este Tesla!" : draw.lead}</p>
      <div className="res-winner-h">
        <b>{winner ? "Ganador Sorteo N°5" : `Ganador ${draw.n}`}</b>
        <small>Sorteado en {winner ? "Agosto 16 de 2026" : draw.dateLong}</small>
      </div>
      <div className={`res-win${winner ? " is-you" : ""}${replay ? " has-replay" : ""}`}>
        <img className="res-win-car" src="assets/figma/results/tesla-front.png" alt="" />
        <p className="res-win-label">{winner ? "Tu Boleto ganador" : "Boleto ganador del Tesla"}</p>
        <div className={`res-win-tix${winner ? " gold" : ""}`}><strong>{winner ? "3321-H" : draw.winCode}</strong></div>
        <div className={`res-win-bar${winner ? " contact" : delivered ? " contact" : ""}${replay ? " is-replay" : ""}`}>
          {winner ? <b>El equipo de Rappi te contactará</b> : delivered ? <b>Esto es todos los días, en serio puedes ser tú.</b> : <>
            <div className="res-win-who"><b>{draw.winner}</b><small>{draw.city}</small></div>
            <DrawVideo playing={playing} onPlay={openVideo} n={3} />
            <div className="res-win-foot"><b>¡Ya sorteamos este Tesla!</b><small>Esto es todos los días, enserio puedes ser tú.</small></div>
          </>}
        </div>
      </div>
      <p className="res-played">{liveNow ? "Boletos con los que estas participando:" : "Boletos con los que participaste"}</p>
      {winner
        ? <div className="res-tix">
            <TeslaTicket code="3321-H" store="Sanamente gourmet" sorteo="Sorteo N°5" gold label="Boleto Ganador" n={5} onClick={openTicket} />
            <TeslaTicket code="3762-L" store="Los Tolucos" sorteo="Sorteo N°5" n={5} onClick={openTicket} />
          </div>
        : draw.tickets.length
          ? <div className="res-tix">{draw.tickets.map(t => <TeslaTicket key={t.code} {...t} sorteo={draw.n} n={5} onClick={openTicket} />)}</div>
          : <p className="res-empty">No participaste en este sorteo.</p>}
      {!winner && <>
        <p className="res-next">Participa en el próximo sorteo</p>
        <button className="btn-primary res-cta is-hotspot" onClick={openStores}>Gana boletos<HotNum n={replay ? 4 : 3} /></button>
      </>}
    </>}
  </div>;
}

function scrollerKey(el: HTMLElement, root: Element) {
  const parts: string[] = [];
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    const parent: HTMLElement | null = node.parentElement;
    const i = parent ? Array.prototype.indexOf.call(parent.children, node) : 0;
    parts.unshift(`${node.classList[0] || node.tagName}:${i}`);
    node = parent;
  }
  return parts.join("/");
}

function isScroller(el: HTMLElement) {
  const s = getComputedStyle(el);
  return /(auto|scroll)/.test(s.overflowY) || /(auto|scroll)/.test(s.overflowX);
}

function scrollId(el: HTMLElement, root: Element) {
  return el.dataset.scroll || scrollerKey(el, root);
}

function capturePhoneScroll() {
  const root = document.querySelector(".phone-screen");
  if (!root) return {};
  const map: Record<string, { top: number; left: number }> = {};
  root.querySelectorAll("*").forEach(node => {
    if (!(node instanceof HTMLElement) || !isScroller(node)) return;
    if (!node.scrollTop && !node.scrollLeft) return;
    map[scrollId(node, root)] = { top: node.scrollTop, left: node.scrollLeft };
  });
  return map;
}

function restorePhoneScroll(map?: Record<string, { top: number; left: number }>) {
  if (!map) return;
  const root = document.querySelector(".phone-screen");
  if (!root) return;
  const apply = () => {
    root.querySelectorAll("*").forEach(node => {
      if (!(node instanceof HTMLElement) || !isScroller(node)) return;
      const saved = map[scrollId(node, root)];
      if (!saved) return;
      node.scrollTop = saved.top;
      node.scrollLeft = saved.left;
    });
  };
  apply();
  requestAnimationFrame(apply);
}

function usePhoneScrollMemory(key: string) {
  const memory = useRef<Record<string, Record<string, { top: number; left: number }>>>({});
  const remember = () => { memory.current[key] = capturePhoneScroll(); };
  useLayoutEffect(() => { restorePhoneScroll(memory.current[key]); }, [key]);
  return remember;
}

function storesVariantFromProps(props?: Step["props"]): StoresVariant {
  if (props?.noCoverage) return "noCoverage";
  if (props?.noStoresDay) return "noStoresDay";
  return "normal";
}

function storesVariantForFlow(flowSteps: Step[], step: Step): StoresVariant {
  const fromStep = storesVariantFromProps(step.props);
  if (fromStep !== "normal") return fromStep;
  return storesVariantFromProps(flowSteps.find(s => s.kind === "stores")?.props);
}

function ScreenRenderer({ step, next, prev, goTo, goBack, jumpKind, openStores, openResults, openLiveResults, openTicket, openBoletos, openFaq, openStore, openLegal, extraTicket, onTicketWon, onRestaurants, onSearch, onStoreView, openYoutube }: { step: Step; next: () => void; prev: () => void; goTo: (kind: StepKind) => boolean; goBack: () => boolean; jumpKind: (kind: StepKind) => boolean; openStores: () => void; openResults: () => void; openLiveResults: () => void; openTicket: (t: TicketInfo) => void; openBoletos: () => void; openFaq: () => void; openStore: () => void; openLegal: (doc?: "bases" | "privacy") => void; extraTicket?: TicketInfo | null; onTicketWon?: (t: TicketInfo) => void; onRestaurants?: () => void; onSearch?: () => void; onStoreView?: (v: StoreView) => void; openYoutube?: () => void }) {
  const toHub = () => { if (!goTo("chub") && !goTo("hub")) next(); };
  const backTo = (...kinds: StepKind[]) => {
    if (goBack()) return;
    for (const k of kinds) if (jumpKind(k)) return;
    prev();
  };
  const toTickets = () => { if (!goTo("boletos")) openBoletos(); };
  const toLive = () => { if (!goTo("prevresults")) openLiveResults(); };
  const homeVar = homeVariantFromProps(step.props);
  const shownHome = extraTicket && (homeVar === "default" || homeVar === "empty") ? "tickets" : homeVar;
  const homeTickets = !!step.props?.live || !!step.props?.tickets || !!extraTicket;
  switch (step.kind) {
    case "home2": return <HomeRappiScreen next={shownHome === "winner" ? () => { if (!goTo("prevresults")) next(); } : toHub} variant={shownHome} size={step.props?.small ? "small" : "large"} onRestaurants={() => { if (!goTo("rest")) onRestaurants?.(); }} onSearch={() => { if (!goTo("search")) onSearch?.(); }} onTickets={toTickets} onStores={openStores} onResults={() => { if (!goTo("prevresults")) openResults(); }} extraTicket={extraTicket} tickets={homeTickets} storeTags={!!step.props?.tags && !step.props?.soldOut} single={!!step.props?.single} timerCta={!!step.props?.timerCta} navHot={!step.props?.single && !step.props?.tags} tagFocus={!!step.props?.tags} />;
    case "intro": return <IntroScreen onKnowMore={toHub} onGotIt={() => { if (!goTo("home2") && !goTo("home")) next(); }} openLegal={openLegal} />;
    case "winintro": return <WinnerInappScreen onClose={() => { if (!goTo("home2") && !goTo("home")) next(); }} />;
    case "video": return <VideoScreen key={String(step.props?.src)} src={String(step.props?.src ?? "")} />;
    case "rest": return <RestaurantsHome back={() => backTo("home2")} openHub={toHub} openStore={openStore} openSearch={() => { if (!goTo("search")) onSearch?.(); }} soldOut={!!step.props?.soldOut} focus={step.props?.focus as RestFocus | undefined} />;
    case "search": return <SearchScreen back={() => backTo("rest", "home2")} openHub={toHub} openStore={openStore} soldOut={!!step.props?.soldOut} />;
    case "chub": return <CampaignHubScreen key={`${hubVariantFromProps(step.props)}-${step.props?.focus ?? ""}`} next={openFaq} prev={() => backTo("home2", "home")} openStores={openStores} openTickets={toTickets} openTicket={openTicket} openResults={openResults} openStore={openStore} openLive={toLive} tickets={!!step.props?.tickets} extraTicket={extraTicket} variant={hubVariantFromProps(step.props)} focus={step.props?.focus as HubFocus | undefined} />;
    case "prevresults": return <PrevResultsScreen back={() => backTo("chub")} openStores={openStores} openTicket={openTicket} openYoutube={openYoutube} winner={!!step.props?.winner} delivered={!!step.props?.delivered} live={!!step.props?.live} />;
    case "faq": return <FaqScreen back={() => backTo("chub")} openStores={openStores} openTickets={toTickets} openLegal={openLegal} />;
    case "boletos": return <MisBoletosScreen back={() => backTo("chub")} openStores={openStores} openTicket={openTicket} extraTicket={extraTicket} soldOut={!!step.props?.soldOut} live={!!step.props?.live} emptyManana={!!step.props?.emptyManana || !!step.props?.ticketsHoy} openLive={toLive} />;
    case "optin": return <OptinScreen next={next} />;
    case "rules": return <RulesScreen next={next} />;
    case "home": return <HomeRappiScreen next={toHub} variant={shownHome} />;
    case "hub": return <HubScreen next={next} props={step.props} />;
    case "tickets": return <TicketsScreen next={next} props={step.props} />;
    case "stores": return step.props?.location ? <StoresScreen next={next} props={step.props} /> : <StoresListScreen back={() => backTo("chub")} openStore={openStore} variant={storesVariantFromProps(step.props)} />;
    case "store": return <StoreDestScreen key={`${storePhaseFromProps(step.props)}-${!!step.props?.soldOut}-${step.props?.focus ?? ""}-${step.props?.qty ?? ""}-${!!step.props?.benefits}`} startPhase={storePhaseFromProps(step.props)} soldOut={!!step.props?.soldOut} focus={step.props?.focus as StoreFocus | undefined} startQty={typeof step.props?.qty === "number" ? step.props.qty : undefined} startBenefits={!!step.props?.benefits} back={() => backTo("stores", "rest", "chub")} openLegal={openLegal} onTicketWon={onTicketWon} onGoHub={toHub} onView={onStoreView} />;
    case "live": return <PrevResultsScreen back={() => backTo("chub")} openStores={openStores} openTicket={openTicket} live />;
    case "results": return <ResultsScreen next={next} delivered={!!step.props?.delivered} />;
    case "delivery": return <OrderDeliveredScreen onTicket={next} />;
    case "won": return <TicketWonScreen name="Pedro Atuesta Gomez" phone="312 1231-2312" dial="+52" onName={() => {}} onPhone={() => {}} onDial={() => {}} onCountry={() => {}} onConfirm={next} />;
    case "confirm": return <ConfirmDataSheet name="Pedro Atuesta Gomez" phone="312 1231-2312" dial="+52" onClose={next} onConfirm={next} />;
    case "pay": return <PayScreen next={next} detail={!!step.props?.detail} />;
    case "cancelled": return <CancelledScreen next={next} />;
    case "cap": return <CapScreen next={next} />;
  }
}

function sectionOfFlow(f: Flow): "flujos" | "contextos" | "renders" {
  if (f.group === "context") return "contextos";
  if (f.group === "render") return "renders";
  return "flujos";
}

function MenuSection({ label, hint, open, onToggle, children }: { label: string; hint?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <div className={`menu-sec${open ? " is-open" : ""}`}>
    <button type="button" className="menu-sec-h" onClick={onToggle}>
      <span>{label}</span>
      <ChevronDown size={15} />
    </button>
    {open ? <div className="menu-sec-body">
      {hint ? <p className="menu-hint">{hint}</p> : null}
      {children}
    </div> : null}
  </div>;
}

function AsideMenu({ flowIndex, stepIndex, chooseFlow, jumpTo }: { flowIndex: number; stepIndex: number; chooseFlow: (i: number) => void; jumpTo: (i: number) => void }) {
  const active = flows[flowIndex];
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const sec = sectionOfFlow(active);
    return { flujos: sec === "flujos", contextos: sec === "contextos", renders: sec === "renders" };
  });
  const [screen, setScreen] = useState<string | null>(active.ctx?.screen ?? "home");
  useEffect(() => {
    const sec = sectionOfFlow(flows[flowIndex]);
    setOpen(o => (o[sec] ? o : { ...o, [sec]: true }));
    const ctx = flows[flowIndex].ctx;
    if (ctx) setScreen(ctx.screen);
  }, [flowIndex]);
  const toggle = (k: string) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const chips = (flow: Flow, i: number) => i !== flowIndex || flow.steps.length < 2 ? null : <div className="menu-chips">
    {flow.steps.map((s, si) => <button type="button" key={`${s.title}-${si}`} className={si === stepIndex ? "on" : ""} onClick={() => jumpTo(si)}>{s.title}</button>)}
  </div>;

  const renderRow = (flow: Flow, i: number) => <React.Fragment key={flow.id}>
    <button type="button" className={`menu-render${i === flowIndex ? " active" : ""}`} onClick={() => chooseFlow(i)}>
      <span>{flow.ctx?.render ?? flow.label}</span>
      <small>{flow.steps.length}</small>
    </button>
    {chips(flow, i)}
  </React.Fragment>;

  const indexed = flows.map((flow, i) => ({ flow, i }));

  return <>
    <MenuSection label="Flujos" open={!!open.flujos} onToggle={() => toggle("flujos")} hint="journey completo, paso a paso">
      <nav>{indexed.filter(({ flow }) => sectionOfFlow(flow) === "flujos" && flow.group !== "placements").map(({ flow, i }) =>
        <button type="button" className={i === flowIndex ? "active" : ""} key={flow.id} onClick={() => chooseFlow(i)}>
          <span><b>{flow.label}</b></span><ChevronRight />
        </button>)}</nav>
    </MenuSection>

    <MenuSection label="Contextos y renders" open={!!open.contextos} onToggle={() => toggle("contextos")} hint="dónde vive cada render y sus estados">
      {contextTree.map(area => <div className="menu-area" key={area.area}>
        <p className="menu-area-h">{area.label}</p>
        {area.screens.map(sc => {
          const list = indexed.filter(({ flow }) => flow.ctx?.area === area.area && flow.ctx.screen === sc.id);
          const isOpen = screen === sc.id;
          return <div className={`menu-ctx${isOpen ? " is-open" : ""}`} key={sc.id}>
            <button type="button" className="menu-ctx-h" onClick={() => setScreen(isOpen ? null : sc.id)}>
              <ChevronRight size={13} />
              <b>{sc.label}</b>
              {list.length ? <small>{list.length}</small> : <em>pendiente</em>}
            </button>
            {isOpen ? <div className="menu-ctx-body">
              {list.length ? list.map(({ flow, i }) => renderRow(flow, i)) : <p className="menu-empty">Sin renders definidos todavía.</p>}
            </div> : null}
          </div>;
        })}
      </div>)}
    </MenuSection>
  </>;
}

function App() {
  const [flowIndex, setFlowIndex] = useState(() => {
    const id = location.hash.replace(/^#/, "");
    const i = flows.findIndex(f => f.id === id);
    return i >= 0 ? i : 0;
  });
  useEffect(() => {
    const applyHash = () => {
      const id = location.hash.replace(/^#/, "");
      const i = flows.findIndex(f => f.id === id);
      if (i >= 0) { setNavStack([]); setFlowIndex(i); setStepIndex(0); }
    };
    window.addEventListener("hashchange", applyHash);
    applyHash();
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [hotspots, setHotspots] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsLive, setResultsLive] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [showBoletos, setShowBoletos] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [showStore, setShowStore] = useState(false);
  const [legalDoc, setLegalDoc] = useState<"bases" | "privacy" | null>(null);
  const [earnedTicket, setEarnedTicket] = useState<TicketInfo | null>(null);
  const [showRest, setShowRest] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [storeView, setStoreView] = useState<StoreView>("join");
  const [navStack, setNavStack] = useState<NavFrame[]>([]);
  const flow = flows[flowIndex];
  const step = flow.steps[stepIndex];
  const overlayKey = [
    showRest && "rest",
    showSearch && "search",
    showStores && "stores",
    showResults && (resultsLive ? "results-live" : "results"),
    showBoletos && "boletos",
    showFaq && "faq",
    showStore && "store",
    legalDoc,
    ticket?.code,
    showYoutube && "youtube",
  ].filter(Boolean).join("|");
  const rememberScroll = usePhoneScrollMemory(`${flowIndex}:${step.kind}:${overlayKey}`);
  const closeOverlays = () => { setShowStores(false); setShowResults(false); setResultsLive(false); setShowBoletos(false); setShowFaq(false); setTicket(null); setShowStore(false); setLegalDoc(null); setShowRest(false); setShowSearch(false); setShowYoutube(false); };
  const snapshot = (): NavFrame => ({ stepIndex, showRest, showSearch, showStores, showResults, showBoletos, showFaq, showStore, legalDoc, storeView, ticket, resultsLive, showYoutube });
  const applyFrame = (f: NavFrame) => {
    setStepIndex(f.stepIndex);
    setShowRest(f.showRest);
    setShowSearch(f.showSearch);
    setShowStores(f.showStores);
    setShowResults(f.showResults);
    setShowBoletos(f.showBoletos);
    setShowFaq(f.showFaq);
    setShowStore(f.showStore);
    setLegalDoc(f.legalDoc);
    setStoreView(f.storeView);
    setTicket(f.ticket);
    setResultsLive(f.resultsLive);
    setShowYoutube(f.showYoutube);
  };
  const pushNav = () => {
    rememberScroll();
    setNavStack(s => [...s, snapshot()]);
  };
  const openOverlay = (already: boolean, apply: () => void) => {
    if (already) return;
    pushNav();
    apply();
  };
  const resetNav = () => { closeOverlays(); setNavStack([]); };
  const next = () => { rememberScroll(); resetNav(); setStepIndex(i => i < flow.steps.length - 1 ? i + 1 : 0); };
  const prev = () => { rememberScroll(); resetNav(); setStepIndex(i => Math.max(0, i - 1)); };
  const goTo = (kind: StepKind) => {
    const i = flow.steps.findIndex(s => s.kind === kind);
    if (i < 0) return false;
    const frame = snapshot();
    const idle = !frame.showRest && !frame.showSearch && !frame.showStores && !frame.showResults && !frame.showBoletos && !frame.showFaq && !frame.showStore && !frame.legalDoc && !frame.showYoutube;
    if (i === frame.stepIndex && idle) return true;
    rememberScroll();
    setNavStack(s => [...s, frame]);
    closeOverlays();
    setStepIndex(i);
    return true;
  };
  const jumpKind = (kind: StepKind) => {
    const i = flow.steps.findIndex(s => s.kind === kind);
    if (i < 0) return false;
    rememberScroll();
    closeOverlays();
    setStepIndex(i);
    return true;
  };
  const goBack = () => {
    if (navStack.length === 0) return false;
    rememberScroll();
    const frame = navStack[navStack.length - 1];
    setNavStack(s => s.slice(0, -1));
    applyFrame(frame);
    return true;
  };
  const openStores = () => openOverlay(showStores || step.kind === "stores", () => setShowStores(true));
  const openResults = () => openOverlay(showResults || step.kind === "prevresults", () => { setResultsLive(false); setShowResults(true); });
  const openLiveResults = () => openOverlay(showResults || step.kind === "prevresults", () => { setResultsLive(true); setShowResults(true); });
  const openYoutube = () => openOverlay(showYoutube, () => setShowYoutube(true));
  const openBoletos = () => openOverlay(showBoletos || step.kind === "boletos" || step.kind === "tickets", () => setShowBoletos(true));
  const openFaq = () => openOverlay(showFaq || step.kind === "faq", () => setShowFaq(true));
  const openStore = () => {
    if (goTo("store")) return;
    if (showStore) return;
    pushNav();
    setShowSearch(false);
    setShowRest(false);
    setShowStore(true);
  };
  const openLegal = (doc: "bases" | "privacy" = "bases") => openOverlay(legalDoc === doc, () => setLegalDoc(doc));
  const openTicket = (t: TicketInfo) => openOverlay(ticket?.code === t.code, () => setTicket(t));
  const openRestOverlay = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    openOverlay(showRest, () => setShowRest(true));
  };
  const openSearchOverlay = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    openOverlay(showSearch, () => setShowSearch(true));
  };
  const syncStoreView = (s: Step) => {
    if (s.kind === "store") setStoreView(storePhaseFromProps(s.props));
  };
  const chooseFlow = (i: number) => { rememberScroll(); resetNav(); setFlowIndex(i); setStepIndex(0); setMobileMenu(false); setEarnedTicket(null); syncStoreView(flows[i].steps[0]); };
  const jumpTo = (i: number) => { rememberScroll(); resetNav(); setStepIndex(i); syncStoreView(flow.steps[i]); };
  useEffect(() => {
    if (step.kind !== "store") return;
    const p = storePhaseFromProps(step.props);
    setStoreView(p);
  }, [flowIndex, stepIndex, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const root = document.querySelector(".phone-screen");
    if (!root) return;
    let x = window.scrollX;
    let y = window.scrollY;
    const save = () => { x = window.scrollX; y = window.scrollY; };
    const restore = () => window.scrollTo(x, y);
    const onPointerDown = () => save();
    const onFocusIn = () => {
      restore();
      requestAnimationFrame(restore);
    };
    root.addEventListener("pointerdown", onPointerDown, true);
    root.addEventListener("focusin", onFocusIn, true);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("focusin", onFocusIn, true);
    };
  }, []);

  const progress = useMemo(() => ((stepIndex + 1) / flow.steps.length) * 100, [flow, stepIndex]);
  const inStore = step.kind === "store" || showStore;
  const storePanelTitle: Partial<Record<StoreView, string>> = {
    confirm: "Recolección de datos",
    won: "Recolección de datos",
    delivered: "Rescue screen",
    deliveredClean: "Pedido entregado",
    transit: "Vista order tracking - En camino",
    transitClean: "Pedido en camino",
    created: "Vista order tracking - Creado",
    createdClean: "Pedido creado",
    checkout: "Vista checkout",
    checkoutAsk: "Vista checkout",
    checkoutSold: "Checkout · se terminaron",
    offer: "Pantalla internal global offer card",
    cart: "Vista canasta",
    store: "Vista store detail",
    join: storeJoinStep.title,
    sold: "Modal se terminaron",
  };
  const storePanelHotspots: Partial<Record<StoreView, Hotspot[]>> = {
    confirm: confirmHotspots,
    won: wonHotspots,
    delivered: deliveredHotspots,
    deliveredClean: [{ label: "Pedido entregado", desc: "Sin Tesla: no aceptó participar. Vista limpia, sin boleto ni banner." }],
    transit: transitHotspots,
    transitClean: [{ label: "Pedido en camino", desc: "Sin Tesla: no aceptó participar. Vista limpia. Avanza el tracking." }],
    created: createdHotspots,
    createdClean: [{ label: "Pedido creado", desc: "Sin Tesla: no aceptó participar. Vista limpia. Avanza el tracking." }],
    checkout: checkoutHotspots,
    checkoutAsk: checkoutAskHotspots,
    checkoutSold: checkoutSoldHotspots,
    offer: storeOfferHotspots,
    cart: cartHotspots,
    join: storeJoinHotspots,
    sold: storeSoldHotspots,
  };
  const boletosLive = !!step.props?.live;
  const section = sectionOfFlow(flow);
  const sectionKicker = section === "contextos" ? "CONTEXTO" : section === "renders" ? "RENDER" : "FLUJO";
  const sectionPeers = flows.filter(f => sectionOfFlow(f) === section && (section !== "flujos" || f.group !== "placements"));
  const stageKicker = `${sectionKicker} ${String(sectionPeers.findIndex(f => f.id === flow.id) + 1).padStart(2, "0")}`;
  const storesVariant = storesVariantForFlow(flow.steps, step);
  const storeFocused = step.kind === "store" && !!step.props?.focus;
  const panelTitle = showYoutube ? "YouTube · sorteo en vivo" : legalDoc ? (legalDoc === "privacy" ? "Aviso de privacidad" : "Bases del sorteo") : inStore && !storeFocused && storePanelTitle[storeView] ? storePanelTitle[storeView] : showSearch ? "Búsqueda" : showRest ? "Home restaurantes" : showStore ? storeJoinStep.title : showStores ? (storesVariant === "noCoverage" ? "Zonas de cobertura" : storesListStep.title) : showFaq ? faqStep.title : showResults ? (resultsLive ? "Resultados · en vivo" : resultsStep.title) : showBoletos ? (boletosLive ? "Mis boletos · en vivo" : boletosStep.title) : step.title;
  const panelHotspots = showYoutube ? youtubeHotspots : legalDoc ? legalHotspots : inStore && !storeFocused && storePanelHotspots[storeView] ? storePanelHotspots[storeView] : showSearch ? searchHotspots : showRest ? restHotspots : showStore ? storeJoinHotspots : showStores ? (storesVariant === "noCoverage" ? [{ label: "Atrás", desc: BACK_PREV }] : storesListHotspots) : showFaq ? faqHotspots : showResults ? (resultsLive ? liveResultsHotspots : (storesVariant === "noCoverage" ? resultsCoverageHotspots : resultsHotspots)) : showBoletos ? (boletosLive ? liveBoletosHotspots : boletosHotspots) : step.hotspots;

  return <main className={hotspots ? "show-hotspots" : ""}>
    <header className="workspace-header">
      <div className="brand"><div><b>Un Tesla al día</b><span>Flows por product specs. Interactions and placements visual</span></div></div>
      <div className="header-actions"><button onClick={() => setHotspots(!hotspots)}>{hotspots ? <Eye size={17} /> : <EyeOff size={17} />}{hotspots ? "Zonas activas" : "Mostrar zonas"}</button><button className="mobile-flow-menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button></div>
    </header>

    <div className="workspace">
      <aside className={mobileMenu ? "open" : ""}>
        <div className="aside-title"><span>PRODUCT SPECS</span><button onClick={() => setMobileMenu(false)}><X /></button></div>
        <AsideMenu flowIndex={flowIndex} stepIndex={stepIndex} chooseFlow={chooseFlow} jumpTo={jumpTo} />
      </aside>

      <section className="stage">
        <div className="stage-heading"><div><span>{stageKicker}</span><h1>{flow.ctx ? `${flow.label} · ${flow.ctx.render}` : flow.label}</h1><p>{flow.description}</p></div>
          <div className="step-count"><b>{String(stepIndex + 1).padStart(2, "0")}</b><span>/ {String(flow.steps.length).padStart(2, "0")}</span></div></div>

        {section === "flujos" ? null : <div className="state-chips">
          <span>ESTADOS</span>
          <div>{flow.steps.map((s, i) => <button type="button" key={`${s.kind}-${s.title}-${i}`} className={i === stepIndex ? "on" : ""} onClick={() => jumpTo(i)}>{s.title}</button>)}</div>
        </div>}

        <div className={`demo-area${section === "flujos" ? "" : " no-funnel"}`}>
          {section === "flujos" ? <div className="step-dots">{flow.steps.map((s, i) => <button key={`${s.kind}-${s.title}-${i}`} className={i === stepIndex ? "active" : i < stepIndex ? "done" : ""} onClick={() => jumpTo(i)}><i>{i < stepIndex ? <Check /> : i + 1}</i><span>{s.title}</span></button>)}</div> : null}
          <div className="phone-slot">
          <div className="phone-shell">
            <div className="phone-buttons" />
            <div className="phone-screen">
              <ScreenRenderer step={step} next={next} prev={prev} goTo={goTo} goBack={goBack} jumpKind={jumpKind} openStores={openStores} openResults={openResults} openLiveResults={openLiveResults} openTicket={openTicket} openBoletos={openBoletos} openFaq={openFaq} openStore={openStore} openLegal={openLegal} extraTicket={earnedTicket} onTicketWon={setEarnedTicket} onStoreView={setStoreView} onRestaurants={openRestOverlay} onSearch={openSearchOverlay} openYoutube={openYoutube} />
              {showBoletos && <MisBoletosScreen back={() => { if (!goBack()) setShowBoletos(false); }} openStores={openStores} openTicket={openTicket} extraTicket={earnedTicket} soldOut={!!step.props?.soldOut} live={!!step.props?.live} emptyManana={!!step.props?.emptyManana || !!step.props?.ticketsHoy} openLive={openLiveResults} />}
              {showResults && <PrevResultsScreen back={() => { if (!goBack()) { setShowResults(false); setResultsLive(false); } }} openStores={openStores} openTicket={openTicket} openYoutube={openYoutube} winner={!!step.props?.winner} delivered={!!step.props?.delivered || !!step.props?.ended} live={resultsLive} />}
              {showYoutube && <YoutubePlayerScreen back={() => { if (!goBack()) setShowYoutube(false); }} />}
              {showFaq && <FaqScreen back={() => { if (!goBack()) setShowFaq(false); }} openStores={openStores} openTickets={openBoletos} openLegal={openLegal} />}
              {showStores && <StoresListScreen back={() => { if (!goBack()) setShowStores(false); }} openStore={openStore} variant={storesVariantForFlow(flow.steps, step)} />}
              {showStore && <StoreDestScreen startPhase={storePhaseFromView(storeView)} back={() => { if (!goBack()) setShowStore(false); }} soldOut={!!step.props?.soldOut} openLegal={openLegal} onTicketWon={setEarnedTicket} onView={setStoreView} onGoHub={() => { if (!goTo("chub")) { if (!goBack()) setShowStore(false); } }} />}
              {showRest && <RestaurantsHome back={() => { if (!goBack()) setShowRest(false); }} openHub={() => { if (!goTo("chub")) openOverlay(showBoletos, () => setShowBoletos(true)); }} openStore={openStore} openSearch={() => { if (!goTo("search")) openSearchOverlay(); }} />}
              {showSearch && <SearchScreen back={() => { if (!goBack()) setShowSearch(false); }} openHub={() => { if (!goTo("chub")) openOverlay(showBoletos, () => setShowBoletos(true)); }} openStore={openStore} />}
              {ticket && <TicketDetailSheet ticket={ticket} onClose={() => { if (!goBack()) setTicket(null); }} openLegal={openLegal} />}
              {legalDoc && <LegalLandingScreen back={() => { if (!goBack()) setLegalDoc(null); }} doc={legalDoc} />}
            </div>
            <div className="home-indicator" />
          </div>
          </div>

          <div className="explanation">
            <div className="explanation-top"><span>PANTALLA ACTUAL</span><b>{panelTitle}</b></div>
            <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            {panelHotspots
              ? <ol className="action-list">{panelHotspots.map((h, i) => <li className="action-item" key={h.label}><span className="num">{i + 1}</span><div><b>{h.label}</b><small>{h.desc}</small></div></li>)}</ol>
              : <div className="action-card"><div className="tap-icon"><span>●</span></div><div><b>Contenido accionable</b></div></div>}
            {showYoutube && <p className="spec-note">El video del sorteo —en vivo o el replay ya guardado— se abre en un webview de YouTube. No se reproduce dentro de Rappi. Cerrar vuelve a Resultados.</p>}
            {(!!step.props?.ticketsHoy || !!step.props?.emptyManana) && !showYoutube && <p className="spec-note">El usuario ya tiene boletos del sorteo de hoy, pero no de mañana. Mañana es el chip default y muestra el mismo empty de la landing de Mis boletos. Hoy sí lista los boletos.</p>}
            {inStore && storeView === "won" && <p className="spec-note">Se abre proactivamente después de la Rescue screen. Sale sola y no hay manera de cerrarla si el usuario no confirma sus datos. Tap en el campo de nombre o de teléfono abre el teclado automáticamente.</p>}
            {step.kind === "cancelled" && <p className="spec-note">El pedido se canceló antes de entregarse. Esta modal es el único estado del caso: no se emite boleto.</p>}
            {step.kind === "video" && step.props?.caption && <p className="spec-note">{String(step.props.caption)}</p>}
            {flow.disclaimer && <p className="spec-note is-rule">*{flow.disclaimer}</p>}
            <p className="disclaimer">Lo que no está marcado en morado, es solo informativo.</p>
            <div className="nav-buttons"><button onClick={prev} disabled={stepIndex === 0}><ArrowLeft />Anterior</button><button onClick={next}>{stepIndex === flow.steps.length - 1 ? (section === "flujos" ? "Reiniciar flujo" : "Volver al primero") : "Siguiente"}<ArrowRight /></button></div>
            <small className="hint">También puedes usar ← → en el teclado</small>
          </div>
        </div>
      </section>
    </div>
  </main>;
}

createRoot(document.getElementById("root")!).render(<AccessGate><App /></AccessGate>);
