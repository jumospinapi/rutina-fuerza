// js/temporizador.js
// Cuenta regresiva, sonido (Web Audio API) y vibracion.

let audioCtx = null;

/**
 * Inicializa o reanuda el contexto de audio en respuesta a un gesto del usuario.
 */
export function activarAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

/**
 * Emite dos pitidos cortos con Web Audio y activa vibracion de 300 ms si esta disponible.
 */
export function reproducirAviso() {
  // Vibracion para dispositivos moviles
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(300);
    } catch (_) {}
  }

  // Sonido con Web Audio API
  if (!audioCtx) {
    activarAudio();
  }
  if (!audioCtx) return;

  try {
    const ahora = audioCtx.currentTime;

    // Pitido 1: 0 a 0.12 s (880 Hz, nota La5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ahora);
    gain1.gain.setValueAtTime(0.2, ahora);
    gain1.gain.exponentialRampToValueAtTime(0.001, ahora + 0.12);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(ahora);
    osc1.stop(ahora + 0.12);

    // Pitido 2: 0.18 a 0.30 s
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ahora + 0.18);
    gain2.gain.setValueAtTime(0.2, ahora + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ahora + 0.30);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(ahora + 0.18);
    osc2.stop(ahora + 0.30);
  } catch (_) {}
}

/**
 * Emite un pitido corto individual para la cuenta regresiva.
 * @param {number} [frecuencia=440]
 * @param {number} [duracion=0.08]
 */
export function reproducirPitido(frecuencia = 440, duracion = 0.08) {
  if (!audioCtx) {
    activarAudio();
  }
  if (!audioCtx) return;

  try {
    const ahora = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frecuencia, ahora);
    gain.gain.setValueAtTime(0.15, ahora);
    gain.gain.exponentialRampToValueAtTime(0.001, ahora + duracion);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(ahora);
    osc.stop(ahora + duracion);
  } catch (_) {}
}

/**
 * Formatea segundos a cadena tipo "0:45" o "1:00".
 * @param {number} segundos
 * @returns {string}
 */
export function formatearTiempo(segundos) {
  const segValidos = Math.max(0, Math.floor(segundos));
  const m = Math.floor(segValidos / 60);
  const s = segValidos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Controlador de cuenta regresiva con soporte de pausa y reanudacion precisa.
 */
export class Temporizador {
  constructor() {
    this.segundosRestantes = 0;
    this.intervalId = null;
    this.corriendo = false;
    this.pausado = false;
    this.alCambiar = null;
    this.alTerminar = null;
    this.tiempoFin = 0;
    this.msRestantesAlPausar = 0;
  }

  /**
   * Inicia una cuenta regresiva.
   * @param {number} segundos
   * @param {function(number):void} alCambiar Callback con segundos restantes
   * @param {function():void} alTerminar Callback al llegar a 0
   */
  iniciar(segundos, alCambiar, alTerminar) {
    this.detener();
    this.segundosRestantes = segundos;
    this.alCambiar = alCambiar;
    this.alTerminar = alTerminar;
    this.corriendo = true;
    this.pausado = false;
    this.tiempoFin = Date.now() + segundos * 1000;

    if (this.alCambiar) {
      this.alCambiar(this.segundosRestantes);
    }

    this.intervalId = setInterval(() => {
      this._tic();
    }, 250);
  }

  _tic() {
    if (!this.corriendo || this.pausado) return;
    const faltanMs = Math.max(0, this.tiempoFin - Date.now());
    const faltanSeg = Math.ceil(faltanMs / 1000);

    if (faltanSeg !== this.segundosRestantes) {
      this.segundosRestantes = faltanSeg;
      if (this.alCambiar) {
        this.alCambiar(this.segundosRestantes);
      }
    }

    if (faltanMs <= 0) {
      this.detener();
      reproducirAviso();
      if (this.alTerminar) {
        this.alTerminar();
      }
    }
  }

  pausar() {
    if (!this.corriendo || this.pausado) return;
    this.pausado = true;
    this.msRestantesAlPausar = Math.max(0, this.tiempoFin - Date.now());
  }

  reanudar() {
    if (!this.corriendo || !this.pausado) return;
    this.pausado = false;
    this.tiempoFin = Date.now() + this.msRestantesAlPausar;
  }

  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.corriendo = false;
    this.pausado = false;
    this.msRestantesAlPausar = 0;
  }

  estaCorriendo() {
    return this.corriendo && !this.pausado;
  }

  estaPausado() {
    return this.pausado;
  }
}
