// js/registro.js
// Manejo de persistencia en localStorage para el registro de sesiones y estado de la app.
// Cumple con docs/02 §4 (clave rutina-fuerza:v1) con proteccion ante fallos y datos corruptos.

import { estadoInicial, validarEstado, fechaLocalString } from './logica.js';

export const CLAVE_STORAGE = 'rutina-fuerza:v1';
const CLAVE_STORAGE_ALT = 'rutina_fuerza_v1';

/**
 * Obtiene la fecha actual del sistema en formato local 'AAAA-MM-DD'.
 * @returns {string}
 */
export function obtenerHoy() {
  return fechaLocalString(new Date());
}

/**
 * Carga el estado almacenado en localStorage.
 * Si no existe, no esta disponible o los datos estan corruptos, devuelve el estado vacio inicial.
 * @returns {object}
 */
export function cargarRegistro() {
  try {
    if (typeof localStorage === 'undefined') {
      return estadoInicial();
    }

    let crudo = localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) {
      crudo = localStorage.getItem(CLAVE_STORAGE_ALT);
    }

    if (!crudo) {
      return estadoInicial();
    }

    const parseado = JSON.parse(crudo);
    return validarEstado(parseado);
  } catch (err) {
    // Si JSON falla o hay un SecurityError/QuotaExceededError en el almacenamiento
    return estadoInicial();
  }
}

/**
 * Guarda el estado en localStorage. Si falla (p. ej. almacenamiento bloqueado o lleno),
 * ignora silenciosamente segun el principio D-04 ("la app funciona igual, sin guardar").
 * @param {object} estado
 * @returns {boolean} true si se guardo correctamente
 */
export function guardarRegistro(estado) {
  try {
    if (typeof localStorage === 'undefined') return false;
    const validado = validarEstado(estado);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(validado));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Borra el registro de almacenamiento local.
 * @returns {object} Estado vacio inicial
 */
export function borrarRegistro() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CLAVE_STORAGE);
      localStorage.removeItem(CLAVE_STORAGE_ALT);
    }
  } catch (err) {
    // Silencioso
  }
  return estadoInicial();
}
