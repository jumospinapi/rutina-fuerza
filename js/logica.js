// js/logica.js
// Funciones puras para armar la sesion, estimar duracion, calcular progresion y gestionar la semana.
// No contiene acceso a DOM, Date() sin argumentos ni localStorage (se reciben como parametros).

import {
  EJERCICIOS,
  CONFIG_NIVELES,
  DESCANSOS,
  obtenerEjerciciosPorNivel,
  obtenerEjercicio,
  obtenerPesa
} from './rutina.js';

/**
 * Devuelve el estado inicial por defecto.
 * @returns {object}
 */
export function estadoInicial() {
  return {
    version: 1,
    avisoAceptado: false,
    nivelManual: null,
    sesiones: [],
    pruebas: []
  };
}

/**
 * Valida y sanea un objeto de datos. Si es invalido o corrupto, devuelve el estado vacio.
 * @param {any} datos
 * @returns {object}
 */
export function validarEstado(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return estadoInicial();
  }
  if (datos.version !== 1) {
    return estadoInicial();
  }
  if (!Array.isArray(datos.sesiones)) {
    return estadoInicial();
  }

  const sesionesValidas = [];
  const fechasVistas = new Set();
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;

  for (const s of datos.sesiones) {
    if (!s || typeof s !== 'object') continue;
    if (typeof s.fecha !== 'string' || !regexFecha.test(s.fecha)) continue;
    if (fechasVistas.has(s.fecha)) continue; // Maximo una sesion por fecha

    fechasVistas.add(s.fecha);
    const nivelSesion = [1, 2, 3, 4, 5].includes(s.nivel) ? s.nivel : null;
    sesionesValidas.push({
      fecha: s.fecha,
      origen: (s.origen === 'manual' || s.origen === 'app') ? s.origen : 'app',
      sensacion: (s.sensacion === 'facil' || s.sensacion === 'bien' || s.sensacion === 'dificil') ? s.sensacion : null,
      nivel: nivelSesion
    });
  }

  // Ordenar cronologicamente
  sesionesValidas.sort((a, b) => a.fecha.localeCompare(b.fecha));

  const pruebasValidas = [];
  if (Array.isArray(datos.pruebas)) {
    const fechasPruebasVistas = new Set();
    for (const p of datos.pruebas) {
      if (!p || typeof p !== 'object') continue;
      if (typeof p.fecha !== 'string' || !regexFecha.test(p.fecha)) continue;
      if (fechasPruebasVistas.has(p.fecha)) continue; // Maximo una prueba por fecha

      fechasPruebasVistas.add(p.fecha);
      const vecesNum = Math.max(0, Math.min(40, Math.round(Number(p.veces) || 0)));
      pruebasValidas.push({
        fecha: p.fecha,
        veces: vecesNum
      });
    }
    pruebasValidas.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  const nivelManualValido = [1, 2, 3, 4, 5].includes(datos.nivelManual)
    ? datos.nivelManual
    : null;

  return {
    version: 1,
    avisoAceptado: Boolean(datos.avisoAceptado),
    nivelManual: nivelManualValido,
    sesiones: sesionesValidas,
    pruebas: pruebasValidas
  };
}

/**
 * Convierte un objeto Date en cadena local 'AAAA-MM-DD'.
 * Utiliza getters locales, nunca toISOString (evita desfase UTC).
 * @param {Date} date
 * @returns {string}
 */
export function fechaLocalString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula la diferencia en dias calendario entre dos cadenas 'AAAA-MM-DD'.
 * @param {string} fecha1
 * @param {string} fecha2
 * @returns {number} dias entre fecha1 y fecha2 (fecha2 - fecha1)
 */
export function diasEntreFechas(fecha1, fecha2) {
  if (typeof fecha1 !== 'string' || typeof fecha2 !== 'string') return 0;
  const [y1, m1, d1] = fecha1.split('-').map(Number);
  const [y2, m2, d2] = fecha2.split('-').map(Number);
  const msPorDia = 24 * 60 * 60 * 1000;
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / msPorDia);
}

/**
 * Determina si una sesion fue calificada como dificil.
 * @param {object|null} sesion
 * @returns {boolean}
 */
function esDificil(sesion) {
  if (!sesion) return false;
  return sesion.sensacion === 'dificil' || sesion.sensacion === 'difícil';
}

/**
 * Devuelve el nivel actual a partir del estado.
 * Si nivelManual existe (1..5), devuelve ese con prioridad.
 * Si no, aplica progresion segun docs/03 §4 y docs/02 §5:
 * - Nivel inicial: sale de la primera prueba (2 si >= 12, sino 1; nunca mas de 2).
 * - 1 -> 2: 6 sesiones en nivel actual
 * - 2 -> 3: 9 sesiones en nivel actual
 * - 3 -> 4: 12 sesiones en nivel actual Y ultima prueba <= fecha sesion da >= 12
 * - 4 -> 5: 12 sesiones en nivel actual Y ultima prueba <= fecha sesion da >= 12
 * - Para subir: cumplir las sesiones en el nivel y ninguna de las 2 ultimas fue 'Dificil'.
 * - Al subir, el conteo de sesiones en el nivel vuelve a cero.
 * - Maximo nivel 5 (nunca pasa de 5).
 * - Nunca baja solo.
 * - Sesiones manuales cuentan para el numero de sesiones.
 * @param {object|null} estado
 * @returns {number} 1 | 2 | 3 | 4 | 5
 */
export function nivelActual(estado) {
  if (!estado) return 1;
  if ([1, 2, 3, 4, 5].includes(estado.nivelManual)) {
    return estado.nivelManual;
  }

  const pruebas = Array.isArray(estado.pruebas)
    ? [...estado.pruebas].sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];
  const sesiones = Array.isArray(estado.sesiones)
    ? [...estado.sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];

  // Nivel inicial sale de la primera prueba (docs/03 §4, docs/02 §5)
  // con <12, con 0 o sin prueba -> 1; con >=12 -> 2 (nunca más de 2)
  let nivel = 1;
  if (pruebas.length > 0 && pruebas[0].veces >= 12) {
    nivel = 2;
  }

  if (sesiones.length === 0) {
    return nivel;
  }

  let sesionesEnNivel = 0;

  for (let i = 0; i < sesiones.length; i++) {
    sesionesEnNivel++;
    const s = sesiones[i];
    const penultima = i > 0 ? sesiones[i - 1] : null;
    const ultimasDosNoDificiles = !esDificil(s) && (!penultima || !esDificil(penultima));

    // Ultima prueba realizada hasta la fecha de esta sesion
    const ultimaPrueba = pruebas.filter(p => p.fecha <= s.fecha).pop();

    if (nivel === 1 && sesionesEnNivel >= 6 && ultimasDosNoDificiles) {
      nivel = 2;
      sesionesEnNivel = 0;
    } else if (nivel === 2 && sesionesEnNivel >= 9 && ultimasDosNoDificiles) {
      nivel = 3;
      sesionesEnNivel = 0;
    } else if (nivel === 3 && sesionesEnNivel >= 12 && ultimasDosNoDificiles && ultimaPrueba && ultimaPrueba.veces >= 12) {
      nivel = 4;
      sesionesEnNivel = 0;
    } else if (nivel === 4 && sesionesEnNivel >= 12 && ultimasDosNoDificiles && ultimaPrueba && ultimaPrueba.veces >= 12) {
      nivel = 5;
      sesionesEnNivel = 0;
    }
  }

  // Si tras la última sesión hay una prueba posterior con >= 12 que cumple la condicion
  const ultimasDosFinales = !esDificil(sesiones[sesiones.length - 1]) &&
    (sesiones.length < 2 || !esDificil(sesiones[sesiones.length - 2]));
  const ultimaPruebaFinal = pruebas[pruebas.length - 1];
  if (ultimaPruebaFinal && ultimaPruebaFinal.veces >= 12 && ultimasDosFinales) {
    if (nivel === 3 && sesionesEnNivel >= 12) {
      nivel = 4;
      sesionesEnNivel = 0;
    } else if (nivel === 4 && sesionesEnNivel >= 12) {
      nivel = 5;
      sesionesEnNivel = 0;
    }
  }

  return nivel;
}

/**
 * Genera la lista ordenada de pasos (pantallas) para una sesion segun el nivel.
 * Incluye reemplazos de niveles 4-5, caminar-pesas en niveles 3-5 y etiqueta de pesa (docs/03 §2.1).
 * @param {number} nivel 1 | 2 | 3 | 4 | 5
 * @returns {Array<object>} Lista plana de pasos de tipo 'ejercicio' o 'descanso'
 */
export function armarSesion(nivel = 1) {
  const nivelValido = [1, 2, 3, 4, 5].includes(nivel) ? nivel : 1;
  const config = CONFIG_NIVELES[nivelValido];
  const ejercicios = obtenerEjerciciosPorNivel(nivelValido);
  const pasos = [];

  for (let i = 0; i < ejercicios.length; i++) {
    const ej = ejercicios[i];
    const siguienteEj = ejercicios[i + 1] || null;
    const pesa = obtenerPesa(ej.id, nivelValido);
    const siguientePesa = siguienteEj ? obtenerPesa(siguienteEj.id, nivelValido) : null;

    if (ej.bloque === 'calentamiento') {
      pasos.push({
        tipo: 'ejercicio',
        ejercicioId: ej.id,
        serie: 1,
        totalSeries: 1,
        lado: ej.lado,
        segundos: ej.segundos,
        pesa: null
      });
    } else if (ej.id === 'caminar-pesas') {
      // 1 sola serie de 45 s en niveles 3-5
      pasos.push({
        tipo: 'ejercicio',
        ejercicioId: ej.id,
        serie: 1,
        totalSeries: 1,
        lado: ej.lado,
        segundos: ej.segundos || 45,
        pesa
      });

      if (siguienteEj) {
        pasos.push({
          tipo: 'descanso',
          segundos: DESCANSOS.entreEjercicios,
          siguienteId: siguienteEj.id,
          siguientePesa
        });
      }
    } else if (ej.bloque === 'fuerza') {
      const totalSeries = config.seriesFuerza;
      const reps = (ej.id === 'talones')
        ? config.repsTalones
        : config.repsFuerza;

      for (let s = 1; s <= totalSeries; s++) {
        pasos.push({
          tipo: 'ejercicio',
          ejercicioId: ej.id,
          serie: s,
          totalSeries,
          lado: ej.lado,
          reps,
          pesa
        });

        if (s < totalSeries) {
          pasos.push({
            tipo: 'descanso',
            segundos: DESCANSOS.entreSeries,
            siguienteId: ej.id,
            siguientePesa: pesa
          });
        }
      }

      if (siguienteEj) {
        pasos.push({
          tipo: 'descanso',
          segundos: DESCANSOS.entreEjercicios,
          siguienteId: siguienteEj.id,
          siguientePesa
        });
      }
    } else if (ej.id === 'un-pie') {
      const series = ej.series || 2;
      const lados = ej.lados || ['pie derecho', 'pie izquierdo'];
      const segundos = config.unPieSegundos || 10;

      for (let s = 1; s <= series; s++) {
        for (const lado of lados) {
          pasos.push({
            tipo: 'ejercicio',
            ejercicioId: ej.id,
            serie: s,
            totalSeries: series,
            lado,
            segundos,
            pesa: null
          });
        }
      }

      if (siguienteEj) {
        pasos.push({
          tipo: 'descanso',
          segundos: DESCANSOS.entreEjercicios,
          siguienteId: siguienteEj.id,
          siguientePesa
        });
      }
    } else if (ej.id === 'estirar-pantorrilla') {
      const lados = ej.lados || ['pierna derecha', 'pierna izquierda'];
      for (const lado of lados) {
        pasos.push({
          tipo: 'ejercicio',
          ejercicioId: ej.id,
          serie: 1,
          totalSeries: 1,
          lado,
          segundos: ej.segundos,
          pesa: null
        });
      }
    }
  }

  return pasos;
}

/**
 * Calcula la duracion estimada en minutos para un nivel.
 * @param {number} nivel 1 | 2 | 3 | 4 | 5
 * @returns {number} minutos estimados (redondeado)
 */
export function duracionEstimada(nivel = 1) {
  const pasos = armarSesion(nivel);
  let totalSegundos = 0;

  for (const paso of pasos) {
    if (paso.tipo === 'descanso') {
      totalSegundos += paso.segundos;
    } else if (paso.tipo === 'ejercicio') {
      if (typeof paso.segundos === 'number') {
        totalSegundos += paso.segundos;
      } else if (typeof paso.reps === 'number') {
        const factorLado = (paso.lado === 'cada brazo' || paso.lado === 'cada pierna') ? 2 : 1;
        totalSegundos += paso.reps * 5 * factorLado;
      }
    }
  }

  return Math.round(totalSegundos / 60);
}

/**
 * Construye la lista de 7 dias de la semana actual (lunes a domingo) para una fecha de referencia.
 * @param {object|null} estado
 * @param {string} hoy 'AAAA-MM-DD'
 * @returns {Array<{fecha: string, diaCorto: string, hecho: boolean, esHoy: boolean, esFuturo: boolean}>}
 */
export function semana(estado, hoy) {
  if (!hoy || typeof hoy !== 'string') return [];
  const partes = hoy.split('-').map(Number);
  if (partes.length !== 3 || partes.some(isNaN)) return [];

  const [ano, mes, dia] = partes;
  // Usar hora local al mediodia para evitar desfaces de huso o cambios de horario
  const fechaRef = new Date(ano, mes - 1, dia, 12, 0, 0);

  // En JS: 0=Domingo, 1=Lunes, ..., 6=Sabado
  // Diferencia de dias hasta el lunes:
  const diffLunes = (fechaRef.getDay() + 6) % 7;
  const lunes = new Date(ano, mes - 1, dia - diffLunes, 12, 0, 0);

  const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const sesiones = (estado && Array.isArray(estado.sesiones)) ? estado.sesiones : [];
  const fechasMarcadas = new Set(sesiones.map(s => s.fecha));

  const resultado = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i, 12, 0, 0);
    const fechaStr = fechaLocalString(d);
    resultado.push({
      fecha: fechaStr,
      diaCorto: DIAS_CORTOS[i],
      hecho: fechasMarcadas.has(fechaStr),
      esHoy: fechaStr === hoy,
      esFuturo: fechaStr > hoy
    });
  }

  return resultado;
}

/**
 * Cuenta cuantas sesiones se han completado en la semana de referencia.
 * @param {object|null} estado
 * @param {string} hoy 'AAAA-MM-DD'
 * @returns {number}
 */
export function hechasEstaSemana(estado, hoy) {
  const dias = semana(estado, hoy);
  return dias.filter(d => d.hecho).length;
}

/**
 * Marca manualmente un dia en el registro.
 * No modifica el estado original (inmutable). Maximo una sesion por fecha.
 * @param {object|null} estado
 * @param {string} fecha 'AAAA-MM-DD'
 * @returns {object} Nuevo estado
 */
export function marcarDia(estado, fecha) {
  const actual = estado ? { ...estado } : estadoInicial();
  const sesiones = Array.isArray(actual.sesiones) ? [...actual.sesiones] : [];

  if (sesiones.some(s => s.fecha === fecha)) {
    return { ...actual, sesiones };
  }

  const nueva = {
    fecha,
    origen: 'manual',
    sensacion: null,
    nivel: null
  };

  const nuevasSesiones = [...sesiones, nueva].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return {
    ...actual,
    sesiones: nuevasSesiones
  };
}

/**
 * Desmarca un dia en el registro.
 * No modifica el estado original (inmutable).
 * @param {object|null} estado
 * @param {string} fecha 'AAAA-MM-DD'
 * @returns {object} Nuevo estado
 */
export function desmarcarDia(estado, fecha) {
  const actual = estado ? { ...estado } : estadoInicial();
  const sesiones = Array.isArray(actual.sesiones) ? actual.sesiones : [];
  const nuevasSesiones = sesiones.filter(s => s.fecha !== fecha);

  return {
    ...actual,
    sesiones: nuevasSesiones
  };
}

/**
 * Registra una sesion completada por la app (o actualiza su sensacion si ya existia para la fecha).
 * No modifica el estado original (inmutable). Maximo una sesion por fecha.
 * @param {object|null} estado
 * @param {string} fecha 'AAAA-MM-DD'
 * @param {string|null} sensacion 'facil' | 'bien' | 'dificil' | null
 * @param {number|null} nivel 1 | 2 | 3 | 4 | 5 | null
 * @returns {object} Nuevo estado
 */
export function registrarSesion(estado, fecha, sensacion = null, nivel = null) {
  const actual = estado ? { ...estado } : estadoInicial();
  const sesiones = Array.isArray(actual.sesiones) ? actual.sesiones : [];

  const filtradas = sesiones.filter(s => s.fecha !== fecha);
  const nueva = {
    fecha,
    origen: 'app',
    sensacion,
    nivel
  };

  const nuevasSesiones = [...filtradas, nueva].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return {
    ...actual,
    sesiones: nuevasSesiones
  };
}

/**
 * Evalua si corresponde mostrar el consejo de peso en Inicio.
 * En niveles 3, 4 y 5, si las dos ultimas sesiones fueron 'facil'.
 * @param {object|null} estado
 * @returns {boolean}
 */
export function consejoPeso(estado) {
  if (!estado) return false;
  const nivel = nivelActual(estado);
  if (nivel < 3 || nivel > 5) return false;

  const sesiones = Array.isArray(estado.sesiones) ? estado.sesiones : [];
  if (sesiones.length < 2) return false;

  const ordenadas = [...sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const penultima = ordenadas[ordenadas.length - 2];
  const ultima = ordenadas[ordenadas.length - 1];

  const esFacil = (s) => s && (s.sensacion === 'facil' || s.sensacion === 'fácil');
  return esFacil(ultima) && esFacil(penultima);
}

/**
 * Registra una prueba de la silla (docs/03 §6, docs/02 §4 y §5).
 * Repetir la prueba el mismo dia la reemplaza.
 * Devuelve un nuevo estado sin mutar el original.
 * @param {object|null} estado
 * @param {string} fecha 'AAAA-MM-DD'
 * @param {number} veces Cantidad de repeticiones (0 a 40)
 * @returns {object} Nuevo estado
 */
export function registrarPrueba(estado, fecha, veces) {
  const est = validarEstado(estado);
  const vecesNum = Math.max(0, Math.min(40, Math.round(Number(veces) || 0)));
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof fecha !== 'string' || !regexFecha.test(fecha)) {
    return est;
  }

  const pruebasRestantes = est.pruebas.filter(p => p.fecha !== fecha);
  pruebasRestantes.push({
    fecha,
    veces: vecesNum
  });
  pruebasRestantes.sort((a, b) => a.fecha.localeCompare(b.fecha));

  return {
    ...est,
    pruebas: pruebasRestantes
  };
}

/**
 * Determina si hay una prueba mensual pendiente (docs/02 §5, docs/03 §6).
 * Falso sin sesiones. Verdadero con sesiones y sin prueba.
 * Si ya hay prueba: falso a los 27 dias y verdadero a los 28 dias o mas desde la ultima.
 * @param {object|null} estado
 * @param {string} hoy 'AAAA-MM-DD'
 * @returns {boolean}
 */
export function pruebaPendiente(estado, hoy) {
  if (!estado) return false;
  const sesiones = Array.isArray(estado.sesiones) ? estado.sesiones : [];
  if (sesiones.length === 0) return false;

  const pruebas = Array.isArray(estado.pruebas) ? estado.pruebas : [];
  if (pruebas.length === 0) return true;

  const ordenadas = [...pruebas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultima = ordenadas[ordenadas.length - 1];
  const dias = diasEntreFechas(ultima.fecha, hoy);
  return dias >= 28;
}

/**
 * Devuelve el resumen de pruebas (ultima, anterior y diferencia) para inicio y resultado.
 * @param {object|null} estado
 * @returns {{ ultima: number, anterior: number|null, diferencia: number|null, fechaUltima: string, fechaAnterior: string|null }|null}
 */
export function resumenPrueba(estado) {
  if (!estado) return null;
  const pruebas = Array.isArray(estado.pruebas) ? estado.pruebas : [];
  if (pruebas.length === 0) return null;

  const ordenadas = [...pruebas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultima = ordenadas[ordenadas.length - 1];
  const anterior = ordenadas.length >= 2 ? ordenadas[ordenadas.length - 2] : null;

  return {
    ultima: ultima.veces,
    anterior: anterior ? anterior.veces : null,
    diferencia: anterior ? (ultima.veces - anterior.veces) : null,
    fechaUltima: ultima.fecha,
    fechaAnterior: anterior ? anterior.fecha : null
  };
}

