// js/agarre.js
// Dibujo fijo, de frente, de cómo se agarra la pesa en "Pararse con la pesa" (agarre "copa"):
// la mancuerna de pie contra el pecho y las dos manos debajo del disco de arriba.
// Usa los mismos colores del personaje (js/poses.js).

import { COLORES } from './poses.js';

const C = COLORES;

export const SVG_AGARRE_PESA = `
<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="De frente: la pesa de pie contra el pecho, con las dos manos debajo del disco de arriba">
  <path d="M20 120 L23 62 Q25 46 40 44 L60 44 Q75 46 77 62 L80 120 Z" fill="${C.camiseta}"/>
  <rect x="44" y="33" width="12" height="13" rx="4" fill="${C.piel}"/>
  <circle cx="36" cy="25" r="3.2" fill="${C.pielLejos}"/>
  <circle cx="64" cy="25" r="3.2" fill="${C.pielLejos}"/>
  <circle cx="50" cy="24" r="14" fill="${C.piel}"/>
  <path d="M36 23 Q36 8 50 8 Q64 8 64 23 Q61 14 50 14 Q39 14 36 23 Z" fill="${C.pelo}"/>
  <circle cx="45" cy="24" r="1.7" fill="${C.rasgo}"/>
  <circle cx="55" cy="24" r="1.7" fill="${C.rasgo}"/>
  <path d="M45 30 Q50 34 55 30" stroke="${C.rasgo}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <g stroke-linecap="round" fill="none">
    <line x1="30" y1="52" x2="29" y2="64" stroke="${C.camiseta}" stroke-width="13"/>
    <line x1="29" y1="63" x2="28" y2="84" stroke="${C.piel}" stroke-width="10"/>
    <line x1="28" y1="84" x2="43" y2="69" stroke="${C.piel}" stroke-width="10"/>
    <line x1="70" y1="52" x2="71" y2="64" stroke="${C.camiseta}" stroke-width="13"/>
    <line x1="71" y1="63" x2="72" y2="84" stroke="${C.piel}" stroke-width="10"/>
    <line x1="72" y1="84" x2="57" y2="69" stroke="${C.piel}" stroke-width="10"/>
  </g>
  <rect x="47" y="60" width="6" height="22" fill="${C.mancuerna}"/>
  <rect x="36" y="51" width="28" height="10" rx="2.5" fill="${C.mancuerna}"/>
  <rect x="36" y="81" width="28" height="10" rx="2.5" fill="${C.mancuerna}"/>
  <ellipse cx="44" cy="66" rx="6.5" ry="5.5" fill="${C.piel}"/>
  <ellipse cx="56" cy="66" rx="6.5" ry="5.5" fill="${C.piel}"/>
</svg>`;

// Ejercicios que muestran el recuadro "Así se agarra"
export const EJERCICIOS_CON_AGARRE = new Set(['sentarse-pesa']);
