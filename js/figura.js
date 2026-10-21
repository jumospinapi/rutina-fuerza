// js/figura.js
// Generador e interpolador de la figura SVG animada del personaje.
// Sigue fielmente la muestra de referencia docs/referencia/personaje-muestra.html.

import { COLORES, ANATOMIA, POSES_EJERCICIOS, suave, interpolarPose, rad } from './poses.js';

const seg = (p, q, ancho, color) =>
  `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${color}" stroke-width="${ancho}"/>`;

const mueve = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];

/**
 * Genera el SVG de la utilería según el tipo de ejercicio.
 */
function dibujarUtileria(tipo, vb) {
  const x1 = vb ? vb[0] - 15 : 10;
  const x2 = vb ? vb[0] + vb[2] + 15 : 190;
  let s = `<line x1="${x1}" y1="191" x2="${x2}" y2="191" stroke="${COLORES.suelo}" stroke-width="3" stroke-linecap="round"/>`;

  if (tipo === 'silla-sentado' || tipo === 'silla-sentado-mancuernas' || tipo === 'silla-sentado-pesa') {
    s += `<g fill="${COLORES.silla}">
      <rect x="34" y="126" width="64" height="9" rx="3"/>
      <rect x="34" y="60" width="9" height="131" rx="3"/>
      <rect x="88" y="135" width="7" height="56" rx="2"/>
    </g>`;
  } else if (tipo === 'silla-apoyo-frente' || tipo === 'silla-apoyo-mancuerna' || tipo === 'silla-apoyo-mancuerna-grande') {
    s += `<g fill="${COLORES.silla}">
      <rect x="142" y="72" width="8" height="119" rx="3"/>
      <rect x="145" y="126" width="44" height="8" rx="2"/>
      <rect x="181" y="134" width="7" height="57" rx="2"/>
    </g>`;
  } else if (tipo === 'pared') {
    s += `<rect x="175" y="15" width="16" height="176" rx="2" fill="${COLORES.pared}" stroke="#C0BAAE" stroke-width="1.5"/>`;
    s += `<line x1="175" y1="15" x2="175" y2="191" stroke="#B0AAA0" stroke-width="2"/>`;
  } else if (tipo === 'meson') {
    s += `<g fill="#D2C8BA" stroke="#AFA597">
      <rect x="142" y="118" width="54" height="12" rx="2" stroke-width="1.5"/>
      <rect x="146" y="130" width="46" height="61" rx="1" stroke-width="1.5"/>
      <line x1="142" y1="118" x2="142" y2="191" stroke="#8E8578" stroke-width="2"/>
    </g>`;
  }

  return s;
}

/**
 * Dibuja una mancuerna centrada en la mano.
 */
function dibujarMancuerna(mano, lejana = false, grande = false) {
  const c = lejana ? '#3A3A3A' : COLORES.mancuerna;
  const x = mano[0];
  const y = mano[1];
  if (grande) {
    return `<g stroke="${c}" stroke-linecap="round">
      <line x1="${(x - 9).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 9).toFixed(1)}" y2="${y.toFixed(1)}" stroke-width="6.5"/>
      <line x1="${(x - 9).toFixed(1)}" y1="${(y - 7).toFixed(1)}" x2="${(x - 9).toFixed(1)}" y2="${(y + 7).toFixed(1)}" stroke-width="7"/>
      <line x1="${(x + 9).toFixed(1)}" y1="${(y - 7).toFixed(1)}" x2="${(x + 9).toFixed(1)}" y2="${(y + 7).toFixed(1)}" stroke-width="7"/>
    </g>`;
  }
  return `<g stroke="${c}" stroke-linecap="round">
    <line x1="${(x - 6).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 6).toFixed(1)}" y2="${y.toFixed(1)}" stroke-width="5"/>
    <line x1="${(x - 6).toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${(x - 6).toFixed(1)}" y2="${(y + 4).toFixed(1)}" stroke-width="4.5"/>
    <line x1="${(x + 6).toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${(x + 6).toFixed(1)}" y2="${(y + 4).toFixed(1)}" stroke-width="4.5"/>
  </g>`;
}

/**
 * Mancuerna de pie contra el pecho (agarre "copa"), vista de perfil.
 * La mano queda justo debajo del disco de arriba; se inclina con el torso.
 */
function dibujarMancuernaVertical(mano, inclinacion = 0) {
  const c = COLORES.mancuerna;
  const [x, y] = mano;
  return `<g stroke="${c}" stroke-linecap="round" transform="rotate(${inclinacion.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">
    <line x1="${x.toFixed(1)}" y1="${(y - 6).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 13).toFixed(1)}" stroke-width="5"/>
    <line x1="${(x - 7).toFixed(1)}" y1="${(y - 7).toFixed(1)}" x2="${(x + 7).toFixed(1)}" y2="${(y - 7).toFixed(1)}" stroke-width="6.5"/>
    <line x1="${(x - 7).toFixed(1)}" y1="${(y + 14).toFixed(1)}" x2="${(x + 7).toFixed(1)}" y2="${(y + 14).toFixed(1)}" stroke-width="6.5"/>
  </g>`;
}

/**
 * Renderiza el cuerpo completo del personaje a partir de una pose interpolada.
 */
function dibujarCuerpo(p, utileria) {
  const tieneMancuernaCerca = utileria === 'silla-apoyo-mancuerna' ||
    utileria === 'silla-apoyo-mancuerna-grande' ||
    utileria === 'silla-sentado-mancuernas' ||
    utileria === 'silla-sentado-pesa' ||
    utileria === 'caminar-mancuernas';
  const tieneMancuernaLejos = utileria === 'silla-sentado-mancuernas' ||
    utileria === 'caminar-mancuernas';
  const esMancuernaGrande = utileria === 'silla-apoyo-mancuerna-grande' ||
    utileria === 'caminar-mancuernas';

  // Puntos lejanos (si no están explícitos, usar desplazamiento L=-7)
  const L = -7;
  const caderaL = p.caderaLejos || mueve(p.cadera, L);
  const rodillaL = p.rodillaLejos || mueve(p.rodilla, L);
  const tobilloL = p.tobilloLejos || mueve(p.tobillo, L);
  const pieL = p.pieLejos || mueve(p.pie, L);
  const hombroL = p.hombroLejos || mueve(p.hombro, -3);
  const codoL = p.codoLejos || mueve(p.codo, -5, 2);
  const manoL = p.manoLejos || mueve(p.mano, -5, 2);

  let s = '';

  // 1. Extremidades del fondo (lejanas, tono más claro)
  s += seg(caderaL, rodillaL, 17, COLORES.pantalonLejos);
  s += seg(rodillaL, tobilloL, 15, COLORES.pantalonLejos);
  s += seg(mueve(tobilloL, 0, 1), pieL, 10, COLORES.zapato);

  // Brazo lejano
  const puntoMangaL = [
    hombroL[0] + (codoL[0] - hombroL[0]) * 0.45,
    hombroL[1] + (codoL[1] - hombroL[1]) * 0.45
  ];
  s += seg(hombroL, puntoMangaL, 14, COLORES.camisetaLejos);
  s += seg(puntoMangaL, codoL, 10, COLORES.pielLejos);
  s += seg(codoL, manoL, 10, COLORES.pielLejos);
  s += `<circle cx="${manoL[0].toFixed(1)}" cy="${manoL[1].toFixed(1)}" r="5.5" fill="${COLORES.pielLejos}" stroke="none"/>`;

  if (tieneMancuernaLejos) {
    s += dibujarMancuerna(manoL, true);
  }

  // 2. Pierna cercana
  s += seg(p.cadera, p.rodilla, 18, COLORES.pantalon);
  s += seg(p.rodilla, p.tobillo, 16, COLORES.pantalon);
  s += seg(mueve(p.tobillo, -1, 1), p.pie, 11, COLORES.zapato);

  // 3. Cuello y Torso
  s += seg(p.cuello, p.cuello, 10, COLORES.piel);
  s += seg(p.cadera, p.hombro, 26, COLORES.camiseta);

  // 4. Brazo cercano
  const puntoManga = [
    p.hombro[0] + (p.codo[0] - p.hombro[0]) * 0.45,
    p.hombro[1] + (p.codo[1] - p.hombro[1]) * 0.45
  ];
  s += seg(p.hombro, puntoManga, 15, COLORES.camiseta); // Manga
  s += seg(mueve(p.hombro, (p.codo[0] - p.hombro[0]) * 0.4, (p.codo[1] - p.hombro[1]) * 0.4), p.codo, 11, COLORES.piel);
  s += seg(p.codo, p.mano, 10, COLORES.piel);
  s += `<circle cx="${p.mano[0].toFixed(1)}" cy="${p.mano[1].toFixed(1)}" r="6" fill="${COLORES.piel}" stroke="none"/>`;

  if (tieneMancuernaCerca) {
    s += (utileria === 'silla-sentado-pesa')
      ? dibujarMancuernaVertical(p.mano, p.t || 0)
      : dibujarMancuerna(p.mano, false, esMancuernaGrande);
  }

  // 5. Cabeza de perfil mirando a la derecha
  const [cx, cy] = p.cabeza;
  const anguloRot = (p.t * 0.4).toFixed(1);
  s += `<g stroke="none" transform="rotate(${anguloRot} ${cx.toFixed(1)} ${cy.toFixed(1)})">
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="13" fill="${COLORES.piel}"/>
    <!-- Pelo canoso -->
    <path d="M${(cx - 13).toFixed(1)} ${(cy + 1).toFixed(1)} A13 13 0 0 1 ${(cx + 9).toFixed(1)} ${(cy - 9).toFixed(1)} L${(cx + 4).toFixed(1)} ${(cy - 5).toFixed(1)} Q${(cx - 6).toFixed(1)} ${(cy - 4).toFixed(1)} ${(cx - 9).toFixed(1)} ${(cy + 5).toFixed(1)} Z" fill="${COLORES.pelo}"/>
    <!-- Oreja -->
    <ellipse cx="${(cx - 3).toFixed(1)}" cy="${(cy + 1).toFixed(1)}" rx="2.6" ry="3.4" fill="${COLORES.pielLejos}"/>
    <!-- Ojo -->
    <circle cx="${(cx + 7).toFixed(1)}" cy="${(cy - 1).toFixed(1)}" r="1.7" fill="${COLORES.rasgo}"/>
    <!-- Nariz -->
    <path d="M${(cx + 12).toFixed(1)} ${cy.toFixed(1)} l3 3.5 l-3 0.8" fill="${COLORES.piel}"/>
    <!-- Sonrisa leve -->
    <path d="M${(cx + 5).toFixed(1)} ${(cy + 6).toFixed(1)} q3 2.5 6 0" stroke="${COLORES.rasgo}" stroke-width="1.4" fill="none"/>
  </g>`;

  return s;
}

/**
 * Calcula la pose interpolada en un instante ms dentro del ciclo.
 */
export function obtenerPoseEnInstante(ejercicioDef, ms) {
  const { poses, secuencia, duracionCiclo } = ejercicioDef;
  const tNormalizado = ms % duracionCiclo;

  for (let i = 0; i < secuencia.length - 1; i++) {
    const [nombreA, ta] = secuencia[i];
    const [nombreB, tb] = secuencia[i + 1];

    if (tNormalizado <= tb) {
      const duracionTransicion = (tb - ta) || 1;
      const progreso = Math.min(1, Math.max(0, (tNormalizado - ta) / duracionTransicion));
      const tSuave = suave(progreso);
      return interpolarPose(poses[nombreA], poses[nombreB], tSuave);
    }
  }

  const primerNombre = secuencia[0][0];
  return poses[primerNombre];
}

/**
 * Genera el string SVG completo para un ejercicio en el instante ms (o estático si reducido).
 */
export function renderizarSVG(ejercicioId, ms = 0, opciones = {}) {
  const ejDef = POSES_EJERCICIOS[ejercicioId];
  if (!ejDef) return '';

  const esReducido = opciones.reducido || false;
  const vb = ejDef.viewBox || [0, -14, 200, 212];

  if (esReducido) {
    // Si prefiere movimiento reducido, muestra las dos poses (inicio y pico) lado a lado
    const secuencia = ejDef.secuencia;
    const poseInicio = ejDef.poses[secuencia[0][0]];
    const mitadSec = secuencia[Math.floor(secuencia.length / 2)][0];
    const posePico = ejDef.poses[mitadSec];

    const gap = 12;
    const anchoDoble = vb[2] * 2 + gap;
    const despX = vb[2] + gap;

    return `<svg viewBox="${vb[0]} ${vb[1]} ${anchoDoble} ${vb[3]}" width="100%" height="100%" role="img" aria-label="Poses del ejercicio">
      <g transform="translate(0, 0)">
        ${dibujarUtileria(ejDef.utileria, vb)}
        <g stroke-linecap="round" stroke-linejoin="round" fill="none">
          ${dibujarCuerpo(poseInicio, ejDef.utileria)}
        </g>
      </g>
      <g transform="translate(${despX}, 0)">
        ${dibujarUtileria(ejDef.utileria, vb)}
        <g stroke-linecap="round" stroke-linejoin="round" fill="none">
          ${dibujarCuerpo(posePico, ejDef.utileria)}
        </g>
      </g>
    </svg>`;
  }

  const poseActual = obtenerPoseEnInstante(ejDef, ms);

  return `<svg viewBox="${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}" width="100%" height="100%" role="img" aria-label="Animación del ejercicio">
    ${dibujarUtileria(ejDef.utileria, vb)}
    <g stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${dibujarCuerpo(poseActual, ejDef.utileria)}
    </g>
  </svg>`;
}

/**
 * Crea un animador vinculado a un contenedor DOM.
 * Controla requestAnimationFrame, pausa con visibilidad de pestaña y respeta prefers-reduced-motion.
 */
export function crearAnimador(contenedor, ejercicioId, opciones = {}) {
  let animId = null;
  let corriendo = false;
  let tiempoInicio = null;
  let tiempoPausado = 0;
  let ultimoMs = 0;

  const ejDef = POSES_EJERCICIOS[ejercicioId];
  const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function actualizarCuadro(ahora) {
    if (!corriendo) return;

    if (tiempoInicio === null) {
      tiempoInicio = ahora - tiempoPausado;
    }

    const transcurrido = ahora - tiempoInicio;
    ultimoMs = transcurrido;

    contenedor.innerHTML = renderizarSVG(ejercicioId, transcurrido, { reducido: false });
    animId = requestAnimationFrame(actualizarCuadro);
  }

  function alCambiarVisibilidad() {
    if (document.hidden) {
      pausar();
    } else if (corriendo) {
      reanudar();
    }
  }

  document.addEventListener('visibilitychange', alCambiarVisibilidad);

  function iniciar() {
    if (prefiereReducido) {
      contenedor.innerHTML = renderizarSVG(ejercicioId, 0, { reducido: true });
      return;
    }

    if (corriendo) return;
    corriendo = true;
    tiempoInicio = null;
    animId = requestAnimationFrame(actualizarCuadro);
  }

  function pausar() {
    if (!corriendo) return;
    corriendo = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    tiempoPausado = ultimoMs;
  }

  function reanudar() {
    if (prefiereReducido) return;
    if (corriendo) return;
    corriendo = true;
    tiempoInicio = null;
    animId = requestAnimationFrame(actualizarCuadro);
  }

  function destruir() {
    pausar();
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    contenedor.innerHTML = '';
  }

  function setEjercicio(nuevoId) {
    ejercicioId = nuevoId;
    tiempoPausado = 0;
    tiempoInicio = null;
    if (corriendo) {
      pausar();
      iniciar();
    } else {
      contenedor.innerHTML = renderizarSVG(ejercicioId, 0, { reducido: prefiereReducido });
    }
  }

  // Render inicial estático hasta que se inicie
  contenedor.innerHTML = renderizarSVG(ejercicioId, 0, { reducido: prefiereReducido });

  return {
    iniciar,
    pausar,
    reanudar,
    destruir,
    setEjercicio,
    getEjercicioId: () => ejercicioId
  };
}
