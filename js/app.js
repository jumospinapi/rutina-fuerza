// js/app.js
// Arranque, navegacion entre pantallas, temporizador, persistencia y eventos de la rutina.

import {
  EJERCICIOS,
  obtenerEjercicio,
  obtenerEjerciciosPorNivel,
  formatoEtiquetaPesa,
  formatoPreparaPesa
} from './rutina.js';
import {
  armarSesion,
  duracionEstimada,
  nivelActual,
  semana,
  hechasEstaSemana,
  marcarDia,
  desmarcarDia,
  registrarSesion,
  consejoPeso,
  registrarPrueba,
  pruebaPendiente,
  resumenPrueba
} from './logica.js';
import { Temporizador, activarAudio, formatearTiempo, reproducirPitido } from './temporizador.js';
import { crearAnimador } from './figura.js';
import { cargarRegistro, guardarRegistro, borrarRegistro, obtenerHoy } from './registro.js';

// Estado de la aplicacion en memoria
let estado = cargarRegistro();
let hoy = obtenerHoy();

let pasos = [];
let indicePaso = 0;
let temporizador = new Temporizador();
let temporizadorCorriaAlAbrirModal = false;
let animadorEjercicio = null;
let animadorDescanso = null;
let animadorPrueba = null;
let temporizadorPrueba = new Temporizador();
let origenPrueba = 'inicio';
let valorConteoPrueba = 10;
let cuentaRegresivaTimerId = null;
let wakeLock = null;

/**
 * Solicita Wake Lock de pantalla para evitar que se apague durante la rutina.
 */
async function solicitarWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      wakeLock = null;
    }
  }
}

/**
 * Libera el Wake Lock activo.
 */
async function liberarWakeLock() {
  if (wakeLock) {
    try {
      await wakeLock.release();
    } catch (err) {
      // Silencioso
    } finally {
      wakeLock = null;
    }
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (pantallas.ejercicio.classList.contains('activa') || pantallas.descanso.classList.contains('activa'))) {
    solicitarWakeLock();
  }
});
const pantallas = {
  inicio: document.getElementById('pantalla-inicio'),
  ejercicio: document.getElementById('pantalla-ejercicio'),
  descanso: document.getElementById('pantalla-descanso'),
  fin: document.getElementById('pantalla-fin'),
  ajustes: document.getElementById('pantalla-ajustes'),
  aviso: document.getElementById('pantalla-aviso'),
  prueba: document.getElementById('pantalla-prueba')
};

const dom = {
  // Inicio
  semanaFila: document.getElementById('semana-fila'),
  semanaTexto: document.getElementById('semana-texto'),
  semanaMeta: document.getElementById('semana-meta'),
  btnEmpezar: document.getElementById('btn-empezar'),
  btnEmpezarTexto: document.getElementById('btn-empezar-texto'),
  inicioDetalleNivel: document.getElementById('inicio-detalle-nivel'),
  btnAbrirSeguridad: document.getElementById('btn-abrir-seguridad'),
  btnAbrirAjustes: document.getElementById('btn-abrir-ajustes'),
  cajaConsejoPeso: document.getElementById('caja-consejo-peso'),
  inicioPruebaResumen: document.getElementById('inicio-prueba-resumen'),
  tarjetaPruebaMes: document.getElementById('tarjeta-prueba-mes'),
  btnHacerPruebaMes: document.getElementById('btn-hacer-prueba-mes'),

  // Ejercicio
  barraProgreso: document.getElementById('barra-progreso'),
  textoProgreso: document.getElementById('texto-progreso'),
  btnCerrarEjercicio: document.getElementById('btn-cerrar-ejercicio'),
  ejercicioTitulo: document.getElementById('ejercicio-titulo'),
  ejercicioEtiquetaPesa: document.getElementById('ejercicio-etiqueta-pesa'),
  cajaAnimacion: document.getElementById('caja-animacion'),
  ejercicioInstruccion: document.getElementById('ejercicio-instruccion'),
  ejercicioOjo: document.getElementById('ejercicio-ojo'),
  ejercicioOjoTexto: document.getElementById('ejercicio-ojo-texto'),
  contadorReps: document.getElementById('ejercicio-contador-reps'),
  contadorTiempo: document.getElementById('ejercicio-contador-tiempo'),
  contadorLado: document.getElementById('ejercicio-contador-lado'),
  btnPrincipalEjercicio: document.getElementById('btn-principal-ejercicio'),
  btnAtrasEjercicio: document.getElementById('btn-atras-ejercicio'),
  btnSaltarEjercicio: document.getElementById('btn-saltar-ejercicio'),

  // Descanso
  btnCerrarDescanso: document.getElementById('btn-cerrar-descanso'),
  descansoReloj: document.getElementById('descanso-reloj'),
  descansoMiniFigura: document.getElementById('descanso-mini-figura'),
  descansoSiguienteNombre: document.getElementById('descanso-siguiente-nombre'),
  descansoPreparaPesa: document.getElementById('descanso-prepara-pesa'),
  btnSeguirYa: document.getElementById('btn-seguir-ya'),
  btnAtrasDescanso: document.getElementById('btn-atras-descanso'),

  // Fin
  btnSensacionFacil: document.getElementById('btn-sensacion-facil'),
  btnSensacionBien: document.getElementById('btn-sensacion-bien'),
  btnSensacionDificil: document.getElementById('btn-sensacion-dificil'),
  btnVolverInicio: document.getElementById('btn-volver-inicio'),

  // Ajustes
  btnVolverAjustes: document.getElementById('btn-volver-ajustes'),
  btnNivelAuto: document.getElementById('btn-nivel-auto'),
  btnNivel1: document.getElementById('btn-nivel-1'),
  btnNivel2: document.getElementById('btn-nivel-2'),
  btnNivel3: document.getElementById('btn-nivel-3'),
  btnNivel4: document.getElementById('btn-nivel-4'),
  btnNivel5: document.getElementById('btn-nivel-5'),
  btnAbrirPruebaAjustes: document.getElementById('btn-abrir-prueba-ajustes'),
  btnBorrarRegistro: document.getElementById('btn-borrar-registro'),

  // Aviso
  btnEntendidoAviso: document.getElementById('btn-entendido-aviso'),

  // Pantalla de prueba
  pruebaPasoExplicacion: document.getElementById('prueba-paso-explicacion'),
  pruebaPasoCuenta: document.getElementById('prueba-paso-cuenta'),
  pruebaPasoTemporizador: document.getElementById('prueba-paso-temporizador'),
  pruebaPasoConteo: document.getElementById('prueba-paso-conteo'),
  pruebaPasoResultado: document.getElementById('prueba-paso-resultado'),

  btnEmpezarPrueba: document.getElementById('btn-empezar-prueba'),
  btnAhoraNoPrueba: document.getElementById('btn-ahora-no-prueba'),
  btnCerrarPruebaExplicacion: document.getElementById('btn-cerrar-prueba-explicacion'),

  pruebaCuentaNumero: document.getElementById('prueba-cuenta-numero'),
  btnCerrarPruebaCuenta: document.getElementById('btn-cerrar-prueba-cuenta'),

  btnCerrarPruebaTemporizador: document.getElementById('btn-cerrar-prueba-temporizador'),
  pruebaCajaAnimacion: document.getElementById('prueba-caja-animacion'),
  pruebaReloj: document.getElementById('prueba-reloj'),
  btnPausaPrueba: document.getElementById('btn-pausa-prueba'),

  btnCerrarPruebaConteo: document.getElementById('btn-cerrar-prueba-conteo'),
  btnConteoMenos: document.getElementById('btn-conteo-menos'),
  btnConteoMas: document.getElementById('btn-conteo-mas'),
  pruebaValorConteo: document.getElementById('prueba-valor-conteo'),
  btnPruebaSinManos: document.getElementById('btn-prueba-sin-manos'),
  btnGuardarPrueba: document.getElementById('btn-guardar-prueba'),

  pruebaResultadoHoy: document.getElementById('prueba-resultado-hoy'),
  pruebaResultadoComparativa: document.getElementById('prueba-resultado-comparativa'),
  pruebaResultadoEsperado: document.getElementById('prueba-resultado-esperado'),
  pruebaResultadoNivel: document.getElementById('prueba-resultado-nivel'),
  btnListoPrueba: document.getElementById('btn-listo-prueba'),

  // Modales
  modalConfirmar: document.getElementById('modal-confirmar'),
  btnConfirmarSi: document.getElementById('btn-confirmar-si'),
  btnConfirmarNo: document.getElementById('btn-confirmar-no'),

  modalDia: document.getElementById('modal-dia'),
  modalDiaTitulo: document.getElementById('modal-dia-titulo'),
  btnDiaSi: document.getElementById('btn-dia-si'),
  btnDiaNo: document.getElementById('btn-dia-no'),

  modalBorrar1: document.getElementById('modal-borrar-1'),
  btnBorrar1Si: document.getElementById('btn-borrar-1-si'),
  btnBorrar1No: document.getElementById('btn-borrar-1-no'),

  modalBorrar2: document.getElementById('modal-borrar-2'),
  btnBorrar2Si: document.getElementById('btn-borrar-2-si'),
  btnBorrar2No: document.getElementById('btn-borrar-2-no')
};

// Nombres legibles para el modal de marcado de dia
const NOMBRES_DIAS = {
  L: 'el lunes',
  M: 'el martes',
  X: 'el miércoles',
  J: 'el jueves',
  V: 'el viernes',
  S: 'el sábado',
  D: 'el domingo'
};

let diaModalSeleccionado = null;

/**
 * Muestra una pantalla especifica y oculta las demas.
 * @param {'inicio'|'ejercicio'|'descanso'|'fin'|'ajustes'|'aviso'} nombre
 */
function mostrarPantalla(nombre) {
  Object.entries(pantallas).forEach(([clave, elemento]) => {
    if (elemento) {
      if (clave === nombre) {
        elemento.classList.add('activa');
      } else {
        elemento.classList.remove('activa');
      }
    }
  });

  if (nombre !== 'ejercicio' && animadorEjercicio) {
    animadorEjercicio.pausar();
  }
  if (nombre !== 'descanso' && animadorDescanso) {
    animadorDescanso.pausar();
  }
  if (nombre !== 'prueba' && animadorPrueba) {
    animadorPrueba.pausar();
  }
  if (nombre !== 'prueba' && temporizadorPrueba.estaCorriendo()) {
    temporizadorPrueba.detener();
  }
  if (nombre !== 'prueba' && cuentaRegresivaTimerId) {
    clearInterval(cuentaRegresivaTimerId);
    cuentaRegresivaTimerId = null;
  }

  if (nombre === 'inicio') {
    actualizarInicio();
  } else if (nombre === 'ajustes') {
    actualizarAjustes();
  }
}

/**
 * Actualiza todos los elementos de la pantalla Inicio segun el estado actual.
 */
function actualizarInicio() {
  const nivel = nivelActual(estado);
  const minutos = duracionEstimada(nivel);
  dom.inicioDetalleNivel.textContent = `Nivel ${nivel} · unos ${minutos} minutos`;

  // Verificar si hoy ya se entreno
  const entrenoHoy = Array.isArray(estado.sesiones) && estado.sesiones.some(s => s.fecha === hoy);
  dom.btnEmpezarTexto.textContent = entrenoHoy ? 'Hacer otra vez' : 'Empezar';

  // Semana actual
  const diasSemana = semana(estado, hoy);
  dom.semanaFila.innerHTML = '';

  for (const d of diasSemana) {
    const btnDia = document.createElement('button');
    btnDia.type = 'button';
    btnDia.className = 'dia-circulo';
    if (d.hecho) btnDia.classList.add('hecho');
    if (d.esHoy) btnDia.classList.add('hoy');
    if (d.esFuturo) {
      btnDia.classList.add('futuro');
      btnDia.disabled = true;
      btnDia.setAttribute('aria-disabled', 'true');
    }

    btnDia.textContent = d.hecho ? '✓' : d.diaCorto;
    const estadoTexto = d.hecho ? 'entrenado' : 'pendiente';
    btnDia.setAttribute('aria-label', `${d.diaCorto}: ${estadoTexto}`);

    if (!d.esFuturo) {
      btnDia.onclick = () => abrirModalDia(d);
    }

    dom.semanaFila.appendChild(btnDia);
  }

  // Resumen de la semana
  const completadas = hechasEstaSemana(estado, hoy);
  dom.semanaTexto.textContent = `Esta semana: ${completadas} de 3`;
  if (completadas >= 3) {
    dom.semanaMeta.style.display = 'block';
  } else {
    dom.semanaMeta.style.display = 'none';
  }

  // Consejo de peso en nivel 3
  const mostrarConsejo = consejoPeso(estado);
  dom.cajaConsejoPeso.style.display = mostrarConsejo ? 'block' : 'none';

  // Prueba mensual pendiente (docs/04 T-06)
  const tienePruebaMes = pruebaPendiente(estado, hoy);
  if (dom.tarjetaPruebaMes) {
    dom.tarjetaPruebaMes.style.display = tienePruebaMes ? 'block' : 'none';
  }

  // Resumen de ultima prueba (docs/04 T-06)
  const resumen = resumenPrueba(estado);
  if (dom.inicioPruebaResumen) {
    if (resumen) {
      const antes = (resumen.anterior !== null) ? ` (antes ${resumen.anterior})` : '';
      dom.inicioPruebaResumen.textContent = `Prueba de la silla: ${resumen.ultima} veces${antes}`;
      dom.inicioPruebaResumen.style.display = 'block';
    } else {
      dom.inicioPruebaResumen.style.display = 'none';
    }
  }
}

/**
 * Actualiza la seleccion de nivel en la pantalla de Ajustes.
 */
function actualizarAjustes() {
  const botonesNivel = [dom.btnNivelAuto, dom.btnNivel1, dom.btnNivel2, dom.btnNivel3, dom.btnNivel4, dom.btnNivel5];
  botonesNivel.forEach(btn => btn && btn.classList.remove('activo'));

  if (estado.nivelManual === null) {
    dom.btnNivelAuto.classList.add('activo');
  } else if (estado.nivelManual === 1) {
    dom.btnNivel1.classList.add('activo');
  } else if (estado.nivelManual === 2) {
    dom.btnNivel2.classList.add('activo');
  } else if (estado.nivelManual === 3) {
    dom.btnNivel3.classList.add('activo');
  } else if (estado.nivelManual === 4) {
    dom.btnNivel4.classList.add('activo');
  } else if (estado.nivelManual === 5) {
    dom.btnNivel5.classList.add('activo');
  }
}

/**
 * Abre el modal de confirmacion para marcar o desmarcar un dia.
 * @param {object} diaInfo
 */
function abrirModalDia(diaInfo) {
  diaModalSeleccionado = diaInfo;
  const nombreDia = NOMBRES_DIAS[diaInfo.diaCorto] || 'este día';

  if (diaInfo.hecho) {
    dom.modalDiaTitulo.textContent = `¿Quitar la marca de ${nombreDia}?`;
  } else {
    dom.modalDiaTitulo.textContent = `¿Hiciste la rutina ${nombreDia}?`;
  }

  dom.modalDia.classList.add('abierto');
}

/**
 * Confirma o cancela la accion del modal de dia.
 * @param {boolean} confirmar
 */
function resolverModalDia(confirmar) {
  dom.modalDia.classList.remove('abierto');
  if (confirmar && diaModalSeleccionado) {
    if (diaModalSeleccionado.hecho) {
      estado = desmarcarDia(estado, diaModalSeleccionado.fecha);
    } else {
      estado = marcarDia(estado, diaModalSeleccionado.fecha);
    }
    guardarRegistro(estado);
    actualizarInicio();
  }
  diaModalSeleccionado = null;
}

/**
 * Inicia la rutina desde el principio.
 */
function iniciarRutina() {
  activarAudio();
  solicitarWakeLock();
  const nivel = nivelActual(estado);
  pasos = armarSesion(nivel);
  indicePaso = 0;
  renderPaso(indicePaso);
}

/**
 * Avanza al siguiente paso de la rutina o pasa a Fin al completar todos.
 */
function avanzarPaso() {
  temporizador.detener();
  indicePaso++;
  if (indicePaso >= pasos.length) {
    // Al llegar a Fin, el dia queda marcado inmediatamente
    completarRutina();
  } else {
    renderPaso(indicePaso);
  }
}

/**
 * Accion al completar la rutina: registra sesion en el estado y muestra pantalla Fin.
 */
function completarRutina() {
  liberarWakeLock();
  const nivel = nivelActual(estado);
  estado = registrarSesion(estado, hoy, null, nivel);
  guardarRegistro(estado);

  // Desmarcar botones de sensacion anteriores
  [dom.btnSensacionFacil, dom.btnSensacionBien, dom.btnSensacionDificil].forEach(btn => {
    if (btn) btn.classList.remove('seleccionado');
  });

  mostrarPantalla('fin');
}

/**
 * Guarda la sensacion seleccionada y regresa a Inicio.
 * @param {'facil'|'bien'|'dificil'} sensacion
 */
function registrarSensacionFin(sensacion) {
  const nivel = nivelActual(estado);
  estado = registrarSesion(estado, hoy, sensacion, nivel);
  guardarRegistro(estado);
  mostrarPantalla('inicio');
}

/**
 * Retrocede al paso anterior de la rutina.
 */
function retrocederPaso() {
  temporizador.detener();
  if (indicePaso > 0) {
    indicePaso--;
    renderPaso(indicePaso);
  }
}

/**
 * Renderiza el paso actual segun su tipo ('ejercicio' o 'descanso').
 * @param {number} indice
 */
function renderPaso(indice) {
  temporizador.detener();
  const paso = pasos[indice];
  if (!paso) return;

  if (paso.tipo === 'ejercicio') {
    mostrarPantalla('ejercicio');
    const nivel = nivelActual(estado);
    const listaEjercicios = obtenerEjerciciosPorNivel(nivel);
    const ej = obtenerEjercicio(paso.ejercicioId);
    if (!ej) return;

    if (animadorDescanso) animadorDescanso.pausar();
    if (!animadorEjercicio) {
      animadorEjercicio = crearAnimador(dom.cajaAnimacion, paso.ejercicioId);
    } else {
      animadorEjercicio.setEjercicio(paso.ejercicioId);
    }
    animadorEjercicio.iniciar();

    const numeroEjercicio = listaEjercicios.findIndex(e => e.id === ej.id) + 1;
    dom.textoProgreso.textContent = `${numeroEjercicio} de ${listaEjercicios.length}`;
    const porcentaje = Math.round((numeroEjercicio / listaEjercicios.length) * 100);
    dom.barraProgreso.style.width = `${porcentaje}%`;

    dom.ejercicioTitulo.textContent = ej.nombre;
    dom.ejercicioInstruccion.textContent = ej.instruccion;

    if (paso.pesa) {
      dom.ejercicioEtiquetaPesa.textContent = formatoEtiquetaPesa(paso.pesa);
      dom.ejercicioEtiquetaPesa.style.display = 'inline-block';
    } else {
      dom.ejercicioEtiquetaPesa.style.display = 'none';
    }

    if (ej.ojo) {
      dom.ejercicioOjoTexto.textContent = ej.ojo;
      dom.ejercicioOjo.style.display = 'block';
    } else {
      dom.ejercicioOjo.style.display = 'none';
    }

    dom.btnAtrasEjercicio.disabled = (indice === 0);
    dom.btnAtrasEjercicio.style.opacity = (indice === 0) ? '0.4' : '1';

    if (typeof paso.reps === 'number') {
      dom.contadorTiempo.style.display = 'none';
      dom.contadorLado.style.display = 'none';
      dom.contadorReps.style.display = 'block';

      let textoReps = '';
      if (paso.lado === 'cada brazo' || paso.lado === 'cada pierna') {
        // "por brazo" es más corto que "veces cada brazo" y evita una segunda línea a 360 px
        const sufijo = (paso.lado === 'cada brazo') ? 'por brazo' : 'por pierna';
        textoReps = (paso.totalSeries > 1)
          ? `Serie ${paso.serie} de ${paso.totalSeries} · ${paso.reps} ${sufijo}`
          : `${paso.reps} veces ${sufijo}`;
      } else {
        textoReps = (paso.totalSeries > 1)
          ? `Serie ${paso.serie} de ${paso.totalSeries} · ${paso.reps} veces`
          : `${paso.reps} veces`;
      }
      dom.contadorReps.textContent = textoReps;

      dom.btnPrincipalEjercicio.textContent = 'Listo';
      dom.btnPrincipalEjercicio.onclick = () => {
        avanzarPaso();
      };
    } else if (typeof paso.segundos === 'number') {
      dom.contadorReps.style.display = 'none';
      dom.contadorTiempo.style.display = 'block';
      dom.contadorTiempo.textContent = formatearTiempo(paso.segundos);

      if (paso.lado && paso.lado !== 'ambos') {
        dom.contadorLado.style.display = 'block';
        if (paso.totalSeries > 1) {
          dom.contadorLado.textContent = `Serie ${paso.serie} de ${paso.totalSeries} · ${paso.lado}`;
        } else {
          dom.contadorLado.textContent = paso.lado;
        }
      } else {
        dom.contadorLado.style.display = 'none';
      }

      dom.btnPrincipalEjercicio.textContent = 'Empezar';
      dom.btnPrincipalEjercicio.onclick = () => {
        if (!temporizador.estaCorriendo() && !temporizador.estaPausado()) {
          activarAudio();
          dom.btnPrincipalEjercicio.textContent = 'Pausa';
          temporizador.iniciar(
            paso.segundos,
            (restantes) => {
              dom.contadorTiempo.textContent = formatearTiempo(restantes);
            },
            () => {
              avanzarPaso();
            }
          );
        } else if (temporizador.estaCorriendo()) {
          temporizador.pausar();
          dom.btnPrincipalEjercicio.textContent = 'Continuar';
        } else if (temporizador.estaPausado()) {
          temporizador.reanudar();
          dom.btnPrincipalEjercicio.textContent = 'Pausa';
        }
      };
    }
  } else if (paso.tipo === 'descanso') {
    mostrarPantalla('descanso');
    const siguienteEj = obtenerEjercicio(paso.siguienteId);
    dom.descansoSiguienteNombre.textContent = siguienteEj ? siguienteEj.nombre : '';

    if (paso.siguientePesa) {
      dom.descansoPreparaPesa.textContent = formatoPreparaPesa(paso.siguientePesa);
      dom.descansoPreparaPesa.style.display = 'block';
    } else {
      dom.descansoPreparaPesa.style.display = 'none';
    }

    dom.descansoReloj.textContent = formatearTiempo(paso.segundos);

    if (animadorEjercicio) animadorEjercicio.pausar();
    if (paso.siguienteId) {
      if (!animadorDescanso) {
        animadorDescanso = crearAnimador(dom.descansoMiniFigura, paso.siguienteId);
      } else {
        animadorDescanso.setEjercicio(paso.siguienteId);
      }
      animadorDescanso.iniciar();
    }

    temporizador.iniciar(
      paso.segundos,
      (restantes) => {
        dom.descansoReloj.textContent = formatearTiempo(restantes);
      },
      () => {
        avanzarPaso();
      }
    );
  }
}

/**
 * Abre el modal de confirmacion de salida de la rutina.
 */
function abrirModalSalida() {
  temporizadorCorriaAlAbrirModal = temporizador.estaCorriendo();
  if (temporizadorCorriaAlAbrirModal) {
    temporizador.pausar();
    if (dom.btnPrincipalEjercicio && dom.btnPrincipalEjercicio.textContent === 'Pausa') {
      dom.btnPrincipalEjercicio.textContent = 'Continuar';
    }
  }
  if (animadorEjercicio) animadorEjercicio.pausar();
  if (animadorDescanso) animadorDescanso.pausar();
  dom.modalConfirmar.classList.add('abierto');
}

/**
 * Cierra el modal de confirmacion y opcionalmente reanuda el temporizador.
 * @param {boolean} confirmarSalir
 */
function cerrarModalSalida(confirmarSalir) {
  dom.modalConfirmar.classList.remove('abierto');
  if (confirmarSalir) {
    liberarWakeLock();
    temporizador.detener();
    mostrarPantalla('inicio');
  } else {
    if (pantallas.ejercicio.classList.contains('activa') && animadorEjercicio) {
      animadorEjercicio.reanudar();
    } else if (pantallas.descanso.classList.contains('activa') && animadorDescanso) {
      animadorDescanso.reanudar();
    }
    if (temporizadorCorriaAlAbrirModal) {
      temporizador.reanudar();
      if (dom.btnPrincipalEjercicio && dom.btnPrincipalEjercicio.textContent === 'Continuar') {
        dom.btnPrincipalEjercicio.textContent = 'Pausa';
      }
    }
  }
}

// Eventos de botones
dom.btnEmpezar.addEventListener('click', iniciarRutina);

dom.btnSaltarEjercicio.addEventListener('click', () => {
  avanzarPaso();
});

dom.btnAtrasEjercicio.addEventListener('click', () => {
  retrocederPaso();
});

dom.btnSeguirYa.addEventListener('click', () => {
  avanzarPaso();
});

dom.btnAtrasDescanso.addEventListener('click', () => {
  retrocederPaso();
});

dom.btnCerrarEjercicio.addEventListener('click', abrirModalSalida);
dom.btnCerrarDescanso.addEventListener('click', abrirModalSalida);

dom.btnConfirmarSi.addEventListener('click', () => {
  cerrarModalSalida(true);
});

dom.btnConfirmarNo.addEventListener('click', () => {
  cerrarModalSalida(false);
});

// Eventos de modal de dia
dom.btnDiaSi.addEventListener('click', () => {
  resolverModalDia(true);
});

dom.btnDiaNo.addEventListener('click', () => {
  resolverModalDia(false);
});

// Eventos de Fin (sensaciones)
dom.btnSensacionFacil.addEventListener('click', () => {
  registrarSensacionFin('facil');
});

dom.btnSensacionBien.addEventListener('click', () => {
  registrarSensacionFin('bien');
});

dom.btnSensacionDificil.addEventListener('click', () => {
  registrarSensacionFin('dificil');
});

dom.btnVolverInicio.addEventListener('click', () => {
  mostrarPantalla('inicio');
});

// Eventos de navegacion secundaria (Seguridad y Ajustes)
dom.btnAbrirSeguridad.addEventListener('click', () => {
  mostrarPantalla('aviso');
});

dom.btnAbrirAjustes.addEventListener('click', () => {
  mostrarPantalla('ajustes');
});

dom.btnVolverAjustes.addEventListener('click', () => {
  mostrarPantalla('inicio');
});

dom.btnEntendidoAviso.addEventListener('click', () => {
  const eraPrimeraVez = !estado.avisoAceptado;
  if (!estado.avisoAceptado) {
    estado.avisoAceptado = true;
    guardarRegistro(estado);
  }
  if (eraPrimeraVez && (!estado.pruebas || estado.pruebas.length === 0)) {
    iniciarPruebaSilla('onboarding');
  } else {
    mostrarPantalla('inicio');
  }
});

// Seleccion manual de nivel en Ajustes
function seleccionarNivelAjustes(nuevoNivel) {
  estado.nivelManual = nuevoNivel;
  guardarRegistro(estado);
  actualizarAjustes();
  actualizarInicio();
}

dom.btnNivelAuto.addEventListener('click', () => seleccionarNivelAjustes(null));
dom.btnNivel1.addEventListener('click', () => seleccionarNivelAjustes(1));
dom.btnNivel2.addEventListener('click', () => seleccionarNivelAjustes(2));
dom.btnNivel3.addEventListener('click', () => seleccionarNivelAjustes(3));
dom.btnNivel4.addEventListener('click', () => seleccionarNivelAjustes(4));
dom.btnNivel5.addEventListener('click', () => seleccionarNivelAjustes(5));

// Doble confirmacion para borrar registro
dom.btnBorrarRegistro.addEventListener('click', () => {
  dom.modalBorrar1.classList.add('abierto');
});

dom.btnBorrar1No.addEventListener('click', () => {
  dom.modalBorrar1.classList.remove('abierto');
});

dom.btnBorrar1Si.addEventListener('click', () => {
  dom.modalBorrar1.classList.remove('abierto');
  dom.modalBorrar2.classList.add('abierto');
});

dom.btnBorrar2No.addEventListener('click', () => {
  dom.modalBorrar2.classList.remove('abierto');
});

dom.btnBorrar2Si.addEventListener('click', () => {
  dom.modalBorrar2.classList.remove('abierto');
  estado = borrarRegistro();
  guardarRegistro(estado);
  actualizarInicio();
  actualizarAjustes();
  mostrarPantalla('inicio');
});

/**
 * Muestra un sub-paso específico dentro de pantalla-prueba y oculta los demás.
 * @param {'explicacion'|'cuenta'|'temporizador'|'conteo'|'resultado'} paso
 */
function mostrarSubpasoPrueba(paso) {
  const subpasos = {
    explicacion: dom.pruebaPasoExplicacion,
    cuenta: dom.pruebaPasoCuenta,
    temporizador: dom.pruebaPasoTemporizador,
    conteo: dom.pruebaPasoConteo,
    resultado: dom.pruebaPasoResultado
  };
  Object.entries(subpasos).forEach(([k, el]) => {
    if (el) {
      el.style.display = (k === paso) ? 'flex' : 'none';
    }
  });
}

/**
 * Inicia el flujo de la prueba de la silla.
 * @param {'onboarding'|'inicio'|'ajustes'} origen
 */
function iniciarPruebaSilla(origen = 'inicio') {
  origenPrueba = origen;
  mostrarPantalla('prueba');
  mostrarSubpasoPrueba('explicacion');
}

/**
 * Inicia la cuenta regresiva 3, 2, 1 con sonido antes del temporizador.
 */
function iniciarCuentaPrueba() {
  activarAudio();
  mostrarSubpasoPrueba('cuenta');
  let cuenta = 3;
  dom.pruebaCuentaNumero.textContent = cuenta;
  reproducirPitido(440, 0.08);

  if (cuentaRegresivaTimerId) {
    clearInterval(cuentaRegresivaTimerId);
  }

  cuentaRegresivaTimerId = setInterval(() => {
    cuenta--;
    if (cuenta > 0) {
      dom.pruebaCuentaNumero.textContent = cuenta;
      reproducirPitido(440, 0.08);
    } else {
      clearInterval(cuentaRegresivaTimerId);
      cuentaRegresivaTimerId = null;
      iniciarTemporizadorPrueba();
    }
  }, 1000);
}

/**
 * Inicia los 30 segundos de temporizador con la animación de pararse con brazos cruzados.
 */
function iniciarTemporizadorPrueba() {
  mostrarSubpasoPrueba('temporizador');
  dom.btnPausaPrueba.textContent = 'Pausa';
  dom.pruebaReloj.textContent = '0:30';

  if (!animadorPrueba) {
    animadorPrueba = crearAnimador(dom.pruebaCajaAnimacion, 'prueba-silla');
  } else {
    animadorPrueba.setEjercicio('prueba-silla');
  }
  animadorPrueba.iniciar();

  temporizadorPrueba.iniciar(
    30,
    (seg) => {
      dom.pruebaReloj.textContent = formatearTiempo(seg);
    },
    () => {
      terminarTemporizadorPrueba();
    }
  );
}

/**
 * Finaliza el temporizador de 30 s y pasa al paso de conteo.
 */
function terminarTemporizadorPrueba() {
  if (animadorPrueba) {
    animadorPrueba.pausar();
  }
  mostrarConteoPrueba();
}

/**
 * Muestra la pregunta "¿Cuántas veces te paraste?" arrancando en 10.
 */
function mostrarConteoPrueba() {
  mostrarSubpasoPrueba('conteo');
  valorConteoPrueba = 10;
  dom.pruebaValorConteo.textContent = valorConteoPrueba;
}

/**
 * Guarda el resultado de la prueba y muestra la pantalla de resumen con frases de docs/03 §6.
 * @param {number} veces
 */
function guardarYMostrarResultado(veces) {
  const pruebasPrevias = Array.isArray(estado.pruebas) ? estado.pruebas : [];
  const esPrimeraPrueba = (pruebasPrevias.length === 0);

  estado = registrarPrueba(estado, hoy, veces);
  guardarRegistro(estado);

  mostrarSubpasoPrueba('resultado');

  dom.pruebaResultadoHoy.innerHTML = `Hoy: <strong>${veces} veces</strong>`;

  const resumen = resumenPrueba(estado);
  if (resumen && resumen.anterior !== null) {
    dom.pruebaResultadoComparativa.style.display = 'block';
    if (resumen.diferencia > 0) {
      dom.pruebaResultadoComparativa.innerHTML = `La vez pasada: ${resumen.anterior}. <strong>¡Subiste ${resumen.diferencia}!</strong>`;
    } else if (resumen.diferencia === 0) {
      dom.pruebaResultadoComparativa.textContent = 'Igual que la vez pasada. ¡Bien!';
    } else {
      dom.pruebaResultadoComparativa.textContent = `La vez pasada: ${resumen.anterior}. Es normal que varíe; sigue entrenando`;
    }
  } else {
    dom.pruebaResultadoComparativa.style.display = 'none';
  }

  dom.pruebaResultadoEsperado.textContent = 'Para tu edad lo esperado es entre 12 y 18';

  if (esPrimeraPrueba) {
    const nivel = nivelActual(estado);
    dom.pruebaResultadoNivel.textContent = `Empezarás en el nivel ${nivel}`;
    dom.pruebaResultadoNivel.style.display = 'block';
  } else {
    dom.pruebaResultadoNivel.style.display = 'none';
  }
}

/**
 * Cierra la prueba sin guardar cambios y regresa a la pantalla de origen.
 */
function cerrarPrueba() {
  if (cuentaRegresivaTimerId) {
    clearInterval(cuentaRegresivaTimerId);
    cuentaRegresivaTimerId = null;
  }
  temporizadorPrueba.detener();
  if (animadorPrueba) {
    animadorPrueba.pausar();
  }

  if (origenPrueba === 'ajustes') {
    mostrarPantalla('ajustes');
  } else {
    mostrarPantalla('inicio');
  }
}

// Eventos de la prueba de la silla
if (dom.btnHacerPruebaMes) {
  dom.btnHacerPruebaMes.addEventListener('click', () => iniciarPruebaSilla('inicio'));
}
if (dom.btnAbrirPruebaAjustes) {
  dom.btnAbrirPruebaAjustes.addEventListener('click', () => iniciarPruebaSilla('ajustes'));
}
if (dom.btnEmpezarPrueba) {
  dom.btnEmpezarPrueba.addEventListener('click', iniciarCuentaPrueba);
}
if (dom.btnAhoraNoPrueba) {
  dom.btnAhoraNoPrueba.addEventListener('click', cerrarPrueba);
}
if (dom.btnCerrarPruebaExplicacion) {
  dom.btnCerrarPruebaExplicacion.addEventListener('click', cerrarPrueba);
}
if (dom.btnCerrarPruebaCuenta) {
  dom.btnCerrarPruebaCuenta.addEventListener('click', cerrarPrueba);
}
if (dom.btnCerrarPruebaTemporizador) {
  dom.btnCerrarPruebaTemporizador.addEventListener('click', cerrarPrueba);
}
if (dom.btnCerrarPruebaConteo) {
  dom.btnCerrarPruebaConteo.addEventListener('click', cerrarPrueba);
}

if (dom.btnPausaPrueba) {
  dom.btnPausaPrueba.addEventListener('click', () => {
    if (temporizadorPrueba.estaPausado()) {
      temporizadorPrueba.reanudar();
      if (animadorPrueba) animadorPrueba.reanudar();
      dom.btnPausaPrueba.textContent = 'Pausa';
    } else {
      temporizadorPrueba.pausar();
      if (animadorPrueba) animadorPrueba.pausar();
      dom.btnPausaPrueba.textContent = 'Reanudar';
    }
  });
}

if (dom.btnConteoMenos) {
  dom.btnConteoMenos.addEventListener('click', () => {
    if (valorConteoPrueba > 0) {
      valorConteoPrueba--;
      dom.pruebaValorConteo.textContent = valorConteoPrueba;
    }
  });
}

if (dom.btnConteoMas) {
  dom.btnConteoMas.addEventListener('click', () => {
    if (valorConteoPrueba < 40) {
      valorConteoPrueba++;
      dom.pruebaValorConteo.textContent = valorConteoPrueba;
    }
  });
}

if (dom.btnPruebaSinManos) {
  dom.btnPruebaSinManos.addEventListener('click', () => {
    valorConteoPrueba = 0;
    dom.pruebaValorConteo.textContent = 0;
    guardarYMostrarResultado(0);
  });
}

if (dom.btnGuardarPrueba) {
  dom.btnGuardarPrueba.addEventListener('click', () => {
    guardarYMostrarResultado(valorConteoPrueba);
  });
}

if (dom.btnListoPrueba) {
  dom.btnListoPrueba.addEventListener('click', () => {
    if (origenPrueba === 'ajustes') {
      mostrarPantalla('ajustes');
    } else {
      mostrarPantalla('inicio');
    }
  });
}

// Parametros de URL para pruebas, depuracion y capturas
const params = new URLSearchParams(window.location.search);

if (params.has('hoy')) {
  hoy = params.get('hoy');
}

if (params.get('ancho') === '360') {
  document.body.style.width = '360px';
  document.body.style.height = '640px';
  document.body.style.overflow = 'hidden';
  const appElem = document.getElementById('app');
  appElem.style.width = '360px';
  appElem.style.height = '640px';
  appElem.style.margin = '0';
}

// Parametros de demostracion para capturas reproducibles
if (params.get('demo') === 'meta') {
  estado = {
    version: 1,
    avisoAceptado: true,
    nivelManual: null,
    sesiones: [
      { fecha: '2026-10-19', origen: 'app', sensacion: 'bien', nivel: 1 },
      { fecha: '2026-10-20', origen: 'app', sensacion: 'bien', nivel: 1 },
      { fecha: '2026-10-21', origen: 'app', sensacion: 'bien', nivel: 1 }
    ]
  };
} else if (params.get('demo') === 'peso') {
  estado = {
    version: 1,
    avisoAceptado: true,
    nivelManual: 3,
    sesiones: [
      { fecha: '2026-10-18', origen: 'app', sensacion: 'facil', nivel: 3 },
      { fecha: '2026-10-20', origen: 'app', sensacion: 'facil', nivel: 3 }
    ]
  };
} else if (params.get('demo') === 'vacio') {
  estado = {
    version: 1,
    avisoAceptado: true,
    nivelManual: null,
    sesiones: []
  };
} else if (params.get('demo') === 'mes' || params.get('demo') === 'prueba-mes') {
  estado = {
    version: 1,
    avisoAceptado: true,
    nivelManual: null,
    sesiones: [
      { fecha: '2026-09-20', origen: 'app', sensacion: 'bien', nivel: 1 }
    ],
    pruebas: [
      { fecha: '2026-09-20', veces: 10 }
    ]
  };
}

if (params.has('nivel')) {
  const n = parseInt(params.get('nivel'), 10);
  if ([1, 2, 3, 4, 5].includes(n)) {
    estado.nivelManual = n;
  }
}

// Inicializacion del flujo de arranque
if (!estado.avisoAceptado && !params.has('pantalla') && !params.has('demo')) {
  mostrarPantalla('aviso');
} else {
  mostrarPantalla('inicio');
}

if (params.has('ejercicio')) {
  iniciarRutina();
  const idEj = params.get('ejercicio');
  const idx = pasos.findIndex(p => p.ejercicioId === idEj);
  if (idx !== -1) {
    indicePaso = idx;
    renderPaso(indicePaso);
  }
} else if (params.has('paso')) {
  iniciarRutina();
  const p = parseInt(params.get('paso'), 10);
  if (!isNaN(p) && p >= 0 && p < pasos.length) {
    indicePaso = p;
    renderPaso(indicePaso);
  }
} else if (params.get('pantalla')) {
  const nombreP = params.get('pantalla');
  if (pantallas[nombreP]) {
    mostrarPantalla(nombreP);
    if (nombreP === 'prueba') {
      const sub = params.get('subpaso') || params.get('pasoPrueba') || 'explicacion';
      mostrarSubpasoPrueba(sub);
      if (sub === 'temporizador') {
        if (!animadorPrueba) {
          animadorPrueba = crearAnimador(dom.pruebaCajaAnimacion, 'prueba-silla');
        } else {
          animadorPrueba.setEjercicio('prueba-silla');
        }
        dom.pruebaReloj.textContent = '0:30';
      } else if (sub === 'conteo') {
        valorConteoPrueba = params.has('veces') ? parseInt(params.get('veces'), 10) : 10;
        dom.pruebaValorConteo.textContent = valorConteoPrueba;
      } else if (sub === 'resultado') {
        const v = parseInt(params.get('veces') || 13, 10);
        dom.pruebaResultadoHoy.innerHTML = `Hoy: <strong>${v} veces</strong>`;
        if (params.has('anterior')) {
          const ant = parseInt(params.get('anterior'), 10);
          const dif = v - ant;
          dom.pruebaResultadoComparativa.style.display = 'block';
          if (dif > 0) {
            dom.pruebaResultadoComparativa.innerHTML = `La vez pasada: ${ant}. <strong>¡Subiste ${dif}!</strong>`;
          } else if (dif === 0) {
            dom.pruebaResultadoComparativa.textContent = 'Igual que la vez pasada. ¡Bien!';
          } else {
            dom.pruebaResultadoComparativa.textContent = `La vez pasada: ${ant}. Es normal que varíe; sigue entrenando`;
          }
        } else {
          dom.pruebaResultadoComparativa.style.display = 'none';
        }
        dom.pruebaResultadoEsperado.textContent = 'Para tu edad lo esperado es entre 12 y 18';
        if (params.get('primera') === '1') {
          dom.pruebaResultadoNivel.textContent = `Empezarás en el nivel ${params.get('nivel') || 2}`;
          dom.pruebaResultadoNivel.style.display = 'block';
        } else {
          dom.pruebaResultadoNivel.style.display = 'none';
        }
      }
    }
  }
}

if (params.get('modal') === '1' || params.get('modal') === 'salida') {
  abrirModalSalida();
} else if (params.get('modal') === 'dia') {
  abrirModalDia({ fecha: '2026-10-20', diaCorto: 'M', hecho: false, esHoy: true, esFuturo: false });
} else if (params.get('modal') === 'borrar1') {
  dom.modalBorrar1.classList.add('abierto');
} else if (params.get('modal') === 'borrar2') {
  dom.modalBorrar2.classList.add('abierto');
}

// Registro del Service Worker para funcionamiento sin conexion (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Si falla o no hay HTTPS (p. ej. pruebas locales sin soporte), no afecta el funcionamiento
    });
  });
}

