// js/poses.js
// Definicion de poses clave, utileria, ritmos y encuadres para los 11 ejercicios.
// Basado en docs/referencia/personaje-muestra.html, docs/02-diseno.md §6 y correcciones R1-R6.

export const COLORES = {
  piel: '#E8B48A',
  pielLejos: '#D9A47C',
  camiseta: '#2F7FC1',
  camisetaLejos: '#5C9BD1',
  pantalon: '#3D4A5C',
  pantalonLejos: '#5E6B7D',
  zapato: '#2A2A2A',
  pelo: '#D8D8D8',
  rasgo: '#3B2A20',
  suelo: '#C9C4BA',
  silla: '#9A7B5B',
  mancuerna: '#4A4A4A',
  pared: '#DDD8CE'
};

// Dimensiones fijas del cuerpo para mantener proporciones constantes
export const ANATOMIA = {
  torso: 52,
  brazo: 27,
  antebrazo: 25,
  muslo: 48,
  pierna: 45
};

export const rad = (grados) => (grados * Math.PI) / 180;

// Curva de interpolacion suave (ease-in-out cuadratica)
export const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const mezcla = (a, b, t) => a + (b - a) * t;
export const mezclaPunto = (p, q, t) => [mezcla(p[0], q[0], t), mezcla(p[1], q[1], t)];

/**
 * Interpola entre dos poses completas.
 */
export function interpolarPose(poseA, poseB, t) {
  const pA = poseA;
  const pB = poseB;
  const res = {
    t: mezcla(pA.t, pB.t, t),
    cadera: mezclaPunto(pA.cadera, pB.cadera, t),
    rodilla: mezclaPunto(pA.rodilla, pB.rodilla, t),
    tobillo: mezclaPunto(pA.tobillo, pB.tobillo, t),
    pie: mezclaPunto(pA.pie, pB.pie, t),
    hombro: mezclaPunto(pA.hombro, pB.hombro, t),
    codo: mezclaPunto(pA.codo, pB.codo, t),
    mano: mezclaPunto(pA.mano, pB.mano, t),
    cabeza: mezclaPunto(pA.cabeza, pB.cabeza, t),
    cuello: mezclaPunto(pA.cuello, pB.cuello, t)
  };

  if (pA.rodillaLejos && pB.rodillaLejos) {
    res.rodillaLejos = mezclaPunto(pA.rodillaLejos, pB.rodillaLejos, t);
    res.tobilloLejos = mezclaPunto(pA.tobilloLejos, pB.tobilloLejos, t);
    res.pieLejos = mezclaPunto(pA.pieLejos, pB.pieLejos, t);
  }
  if (pA.codoLejos && pB.codoLejos) {
    res.codoLejos = mezclaPunto(pA.codoLejos, pB.codoLejos, t);
    res.manoLejos = mezclaPunto(pA.manoLejos, pB.manoLejos, t);
  }
  if (pA.hombroLejos && pB.hombroLejos) {
    res.hombroLejos = mezclaPunto(pA.hombroLejos, pB.hombroLejos, t);
  }
  if (pA.caderaLejos && pB.caderaLejos) {
    res.caderaLejos = mezclaPunto(pA.caderaLejos, pB.caderaLejos, t);
  }

  return res;
}

/**
 * Genera una pose con puntos de hombro, cuello y cabeza calculados a partir de cadera y angulo torso.
 */
function crearPose(params) {
  const t = params.t || 0;
  const dir = [Math.sin(rad(t)), -Math.cos(rad(t))];
  const cadera = params.cadera;
  const hombro = params.hombro || [
    cadera[0] + ANATOMIA.torso * dir[0],
    cadera[1] + ANATOMIA.torso * dir[1]
  ];
  const cuello = params.cuello || [hombro[0] + 8 * dir[0], hombro[1] + 8 * dir[1]];
  const cabeza = params.cabeza || [hombro[0] + 20 * dir[0] + 2, hombro[1] + 20 * dir[1]];

  const pose = {
    t,
    cadera,
    hombro,
    cuello,
    cabeza,
    codo: params.codo,
    mano: params.mano,
    rodilla: params.rodilla,
    tobillo: params.tobillo,
    pie: params.pie
  };

  if (params.rodillaLejos) pose.rodillaLejos = params.rodillaLejos;
  if (params.tobilloLejos) pose.tobilloLejos = params.tobilloLejos;
  if (params.pieLejos) pose.pieLejos = params.pieLejos;
  if (params.codoLejos) pose.codoLejos = params.codoLejos;
  if (params.manoLejos) pose.manoLejos = params.manoLejos;
  if (params.hombroLejos) pose.hombroLejos = params.hombroLejos;
  if (params.caderaLejos) pose.caderaLejos = params.caderaLejos;

  return pose;
}

// ---------------------------------------------------------------------------
// DEFINICION DE POSES POR EJERCICIO (11 EJERCICIOS)
// ---------------------------------------------------------------------------

export const POSES_EJERCICIOS = {
  // 1. MARCHA SENTADO (Calentamiento)
  'marcha-sentado': {
    utileria: 'silla-sentado',
    duracionCiclo: 2400,
    viewBox: [24, -6, 124, 200],
    poses: {
      neutro: crearPose({
        cadera: [72, 126],
        t: 6,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [78, 102],
        mano: [88, 122],
        codoLejos: [72, 102],
        manoLejos: [82, 122]
      }),
      cercaArriba: crearPose({
        cadera: [72, 126],
        t: 4,
        rodilla: [114, 104], // Rodilla cercana sube
        tobillo: [110, 154], // Pie en el aire
        pie: [128, 156],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [68, 100], // Brazo cercano balancea atras
        mano: [64, 120],
        codoLejos: [82, 98], // Brazo lejano balancea adelante
        manoLejos: [96, 114]
      }),
      lejosArriba: crearPose({
        cadera: [72, 126],
        t: 4,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [108, 104], // Rodilla lejana sube
        tobilloLejos: [104, 154], // Pie lejano en el aire
        pieLejos: [122, 156],
        codo: [86, 98], // Brazo cercano balancea adelante
        mano: [100, 114],
        codoLejos: [64, 100], // Brazo lejano balancea atras
        manoLejos: [60, 120]
      })
    },
    secuencia: [
      ['neutro', 0],
      ['cercaArriba', 600],
      ['neutro', 1200],
      ['lejosArriba', 1800],
      ['neutro', 2400]
    ]
  },

  // 2. SUBIR LOS BRAZOS (Calentamiento) - R3: Brazos estirados todo el tiempo girando desde el hombro
  'brazos-al-frente': {
    utileria: 'silla-sentado',
    duracionCiclo: 3200,
    viewBox: [24, -6, 124, 200],
    poses: {
      abajo: crearPose({
        cadera: [72, 126],
        t: 5,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [76, 100], // Brazo recto colgando abajo
        mano: [76, 124],
        codoLejos: [71, 100],
        manoLejos: [71, 124]
      }),
      sube30: crearPose({
        cadera: [72, 126],
        t: 5,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [89, 97], // Brazo recto a 30°
        mano: [101, 117],
        codoLejos: [84, 97],
        manoLejos: [96, 117]
      }),
      sube60: crearPose({
        cadera: [72, 126],
        t: 5,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [99, 87], // Brazo recto a 60°
        mano: [119, 99],
        codoLejos: [94, 87],
        manoLejos: [114, 99]
      }),
      arriba: crearPose({
        cadera: [72, 126],
        t: 4,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [102, 74], // Brazo recto horizontal a la altura del hombro
        mano: [126, 74],
        codoLejos: [97, 74],
        manoLejos: [121, 74]
      })
    },
    secuencia: [
      ['abajo', 0],
      ['sube30', 400],
      ['sube60', 850],
      ['arriba', 1300],
      ['arriba', 1700],
      ['sube60', 2150],
      ['sube30', 2600],
      ['abajo', 3000],
      ['abajo', 3200]
    ]
  },

  // 3. MARCHA DE PIE (Calentamiento con apoyo) - R4: Rodilla sube a 45° o más, alternando ambas piernas
  'marcha-de-pie': {
    utileria: 'silla-apoyo-frente',
    duracionCiclo: 2400,
    viewBox: [68, -6, 130, 200],
    poses: {
      neutro: crearPose({
        cadera: [95, 96],
        t: 2,
        rodilla: [98, 140],
        tobillo: [96, 185],
        pie: [115, 188],
        rodillaLejos: [92, 140],
        tobilloLejos: [90, 185],
        pieLejos: [109, 188],
        codo: [86, 72],
        mano: [82, 94],
        codoLejos: [118, 68], // Mano lejana firme en respaldo
        manoLejos: [142, 82]
      }),
      cercaArriba: crearPose({
        cadera: [95, 96],
        t: 1,
        rodilla: [126, 118], // Rodilla cercana sube alto (muslo a >45° de elevación)
        tobillo: [122, 160], // Pie en el aire a 24 px del suelo
        pie: [139, 164],
        rodillaLejos: [92, 140], // Pierna de apoyo firme en piso
        tobilloLejos: [90, 185],
        pieLejos: [109, 188],
        codo: [76, 72],
        mano: [70, 94],
        codoLejos: [118, 68], // Mano firme en respaldo
        manoLejos: [142, 82]
      }),
      lejosArriba: crearPose({
        cadera: [95, 96],
        t: 1,
        rodilla: [98, 140], // Pierna cercana de apoyo firme
        tobillo: [96, 185],
        pie: [115, 188],
        caderaLejos: [88, 96],
        rodillaLejos: [120, 118], // Rodilla lejana sube alto (muslo a >45°)
        tobilloLejos: [116, 160], // Pie lejano en el aire
        pieLejos: [133, 164],
        codo: [98, 72],
        mano: [104, 94],
        codoLejos: [118, 68],
        manoLejos: [142, 82]
      })
    },
    secuencia: [
      ['neutro', 0],
      ['cercaArriba', 600],
      ['neutro', 1200],
      ['lejosArriba', 1800],
      ['neutro', 2400]
    ]
  },

  // 4. SENTARSE Y PARARSE (Fuerza: 2 s subir, 3 s bajar)
  'sentarse-pararse': {
    utileria: 'silla-sentado',
    duracionCiclo: 6500,
    viewBox: [24, -6, 124, 200],
    poses: {
      sentado: crearPose({
        cadera: [72, 126],
        t: 12,
        rodilla: [116, 130],
        tobillo: [112, 185], // Pies fijos en el suelo
        pie: [131, 188],
        codo: [82, 104],
        mano: [98, 118]
      }),
      inclina: crearPose({
        cadera: [76, 124],
        t: 40,
        rodilla: [117, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [94, 98],
        mano: [106, 120]
      }),
      medio: crearPose({
        cadera: [94, 106],
        t: 28,
        rodilla: [121, 129],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [104, 88],
        mano: [114, 110]
      }),
      arriba: crearPose({
        cadera: [106, 88],
        t: 3,
        rodilla: [111, 133],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [113, 62],
        mano: [117, 85]
      })
    },
    secuencia: [
      ['sentado', 0],
      ['inclina', 700],
      ['medio', 1300],
      ['arriba', 2000],
      ['arriba', 2700],
      ['medio', 3400],
      ['inclina', 4500],
      ['sentado', 5700],
      ['sentado', 6500]
    ]
  },

  // 5. EMPUJAR LA PARED (Fuerza: 2 s empujar, 3 s bajar) - R2: Cuerpo recto como tabla, pivota en tobillos
  'flexion-pared': {
    utileria: 'pared',
    duracionCiclo: 6200,
    viewBox: [60, -6, 140, 200],
    poses: {
      extendido: crearPose({
        t: 23, // Inclinación en línea recta desde tobillo (23.4°)
        cadera: [104, 107],
        hombro: [119, 72],
        cuello: [124, 60],
        cabeza: [130, 47],
        rodilla: [88, 144], // Colineal perfecta con tobillo y cadera
        tobillo: [70, 185], // Pivote fijo en el suelo
        pie: [89, 188],
        codo: [147, 76], // Brazos extendidos hacia la pared
        mano: [174, 80], // Manos apoyadas en la pared
        codoLejos: [147, 76],
        manoLejos: [174, 80]
      }),
      cerca: crearPose({
        t: 36, // Cuerpo recto como una tabla (35.5°), sin doblar rodillas
        cadera: [119, 116],
        hombro: [141, 85],
        cuello: [149, 74],
        cabeza: [157, 63],
        rodilla: [96, 148], // Colineal perfecta: rodillas NO se doblan
        tobillo: [70, 185], // Mismo punto pivote fijo
        pie: [89, 188],
        codo: [161, 105], // Solo se doblan los codos (abajo y atras)
        mano: [174, 80], // Manos fijas en la pared
        codoLejos: [161, 105],
        manoLejos: [174, 80]
      })
    },
    secuencia: [
      ['extendido', 0],
      ['cerca', 3000], // 3 s para bajar hacia la pared
      ['cerca', 3600], // Pausa cerca
      ['extendido', 5600], // 2 s para empujar y volver
      ['extendido', 6200]
    ]
  },

  // 6. REMO APOYADO EN LA SILLA (Fuerza: 2 s subir, 3 s bajar) - R1: Codo sube hacia atrás, antebrazo vertical, pesa a la cintura
  'remo-silla': {
    utileria: 'silla-apoyo-mancuerna',
    duracionCiclo: 6200,
    viewBox: [68, -6, 130, 200],
    poses: {
      abajo: crearPose({
        t: 40, // Espalda perfectamente recta inclinada (~40°)
        cadera: [78, 114],
        hombro: [118, 76],
        rodilla: [84, 148],
        tobillo: [80, 185],
        pie: [99, 188],
        rodillaLejos: [112, 148],
        tobilloLejos: [114, 185],
        pieLejos: [133, 188],
        codo: [118, 106], // Brazo cercano cuelga vertical hacia abajo
        mano: [118, 134],
        codoLejos: [126, 72], // Mano lejana firme en respaldo
        manoLejos: [144, 82]
      }),
      medio: crearPose({
        t: 40, // Torso quieto
        cadera: [78, 114],
        hombro: [118, 76],
        rodilla: [84, 148],
        tobillo: [80, 185],
        pie: [99, 188],
        rodillaLejos: [112, 148],
        tobilloLejos: [114, 185],
        pieLejos: [133, 188],
        codo: [97, 97], // Codo sube y va hacia atras
        mano: [97, 125], // Antebrazo vertical
        codoLejos: [126, 72],
        manoLejos: [144, 82]
      }),
      arriba: crearPose({
        t: 40, // Torso quieto, espalda recta
        cadera: [78, 114],
        hombro: [118, 76],
        rodilla: [84, 148],
        tobillo: [80, 185],
        pie: [99, 188],
        rodillaLejos: [112, 148],
        tobilloLejos: [114, 185],
        pieLejos: [133, 188],
        codo: [89, 74], // Codo pasa hacia atras de la linea del torso
        mano: [89, 102], // Antebrazo casi vertical, mancuerna al lado de cintura/cadera
        codoLejos: [126, 72],
        manoLejos: [144, 82]
      })
    },
    secuencia: [
      ['abajo', 0],
      ['medio', 1000],
      ['arriba', 2000], // 2 s subir
      ['arriba', 2600], // Pausa arriba
      ['medio', 4100],
      ['abajo', 5600], // 3 s bajar despacio
      ['abajo', 6200]
    ]
  },

  // 7. SUBIR LOS TALONES (Fuerza: 2 s subir, 3 s bajar) - R5: Punta fija en piso, solo sube talón, cuerpo sube pocos px
  'talones': {
    utileria: 'silla-apoyo-frente',
    duracionCiclo: 6200,
    viewBox: [78, -6, 120, 200],
    poses: {
      abajo: crearPose({
        t: 2,
        cadera: [100, 96],
        hombro: [100, 44],
        rodilla: [102, 140],
        tobillo: [100, 182], // Talones apoyados
        pie: [119, 185], // Punta apoyada en piso (no pasa de y=191)
        rodillaLejos: [96, 140],
        tobilloLejos: [94, 182],
        pieLejos: [113, 185],
        codo: [118, 66],
        mano: [142, 82], // Manos en respaldo
        codoLejos: [114, 66],
        manoLejos: [142, 82]
      }),
      arriba: crearPose({
        t: 2,
        cadera: [100, 87], // Todo el cuerpo sube igual que el talon (9 px)
        hombro: [100, 35],
        rodilla: [102, 131],
        rodillaLejos: [96, 131],
        tobillo: [100, 173], // Talon sube 9 px
        pie: [119, 185], // Punta del pie fija en el piso
        tobilloLejos: [94, 173],
        pieLejos: [113, 185],
        codo: [120, 58],
        mano: [142, 82], // Manos apoyadas en respaldo
        codoLejos: [116, 58],
        manoLejos: [142, 82]
      })
    },
    secuencia: [
      ['abajo', 0],
      ['arriba', 2000], // 2 s subir
      ['arriba', 2600], // Pausa en puntas
      ['abajo', 5600], // 3 s bajar despacio
      ['abajo', 6200]
    ]
  },

  // 8. PIERNA HACIA ATRAS (Fuerza: 2 s extender, 3 s volver)
  'pierna-atras': {
    utileria: 'silla-apoyo-frente',
    duracionCiclo: 6200,
    viewBox: [46, -6, 152, 200],
    poses: {
      neutro: crearPose({
        t: 3, // Espalda recta sin arquearse
        cadera: [100, 96],
        hombro: [100, 44],
        rodilla: [102, 140],
        tobillo: [100, 185],
        pie: [119, 188],
        rodillaLejos: [96, 140],
        tobilloLejos: [94, 185],
        pieLejos: [113, 188],
        codo: [118, 66],
        mano: [142, 82],
        codoLejos: [114, 66],
        manoLejos: [142, 82]
      }),
      atras: crearPose({
        t: 4, // Espalda se mantiene recta y neutra
        cadera: [100, 96],
        hombro: [100, 44],
        rodilla: [78, 142], // Pierna cercana extendida atras
        tobillo: [60, 172], // Pie atras a ~15 px del suelo
        pie: [76, 176],
        rodillaLejos: [98, 140], // Pierna lejana de apoyo firme
        tobilloLejos: [96, 185],
        pieLejos: [115, 188],
        codo: [118, 66],
        mano: [142, 82], // Manos en respaldo
        codoLejos: [114, 66],
        manoLejos: [142, 82]
      })
    },
    secuencia: [
      ['neutro', 0],
      ['atras', 2000], // 2 s hacia atras
      ['atras', 2600], // Pausa breve
      ['neutro', 5600], // 3 s volver despacio
      ['neutro', 6200]
    ]
  },

  // 9. DOBLAR LOS BRAZOS (Fuerza: 2 s subir, 3 s bajar)
  'curl-sentado': {
    utileria: 'silla-sentado-mancuernas',
    duracionCiclo: 6200,
    viewBox: [24, -6, 124, 200],
    poses: {
      abajo: crearPose({
        cadera: [72, 126],
        t: 6,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [78, 102], // Codos pegados al cuerpo
        mano: [90, 126],
        codoLejos: [72, 102],
        manoLejos: [84, 126]
      }),
      arriba: crearPose({
        cadera: [72, 126],
        t: 6,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        rodillaLejos: [110, 130],
        tobilloLejos: [106, 185],
        pieLejos: [125, 188],
        codo: [78, 102], // Codos fijos pegados al torso
        mano: [94, 76], // Mancuernas suben hacia el pecho
        codoLejos: [72, 102],
        manoLejos: [88, 76]
      })
    },
    secuencia: [
      ['abajo', 0],
      ['arriba', 2000], // 2 s subir
      ['arriba', 2600], // Pausa arriba
      ['abajo', 5600], // 3 s bajar despacio
      ['abajo', 6200]
    ]
  },

  // 10. PARARSE EN UN PIE (Equilibrio)
  'un-pie': {
    utileria: 'silla-apoyo-frente',
    duracionCiclo: 3000,
    viewBox: [78, -6, 120, 200],
    poses: {
      base: crearPose({
        t: 2,
        cadera: [96, 96],
        hombro: [96, 44],
        rodilla: [108, 132], // Pierna cercana levantada en equilibrio
        tobillo: [96, 162],
        pie: [114, 164],
        rodillaLejos: [94, 140], // Pierna lejana de apoyo firme
        tobilloLejos: [92, 185],
        pieLejos: [111, 188],
        codo: [88, 70],
        mano: [84, 94],
        codoLejos: [118, 68], // Mano lejana firme en respaldo
        manoLejos: [142, 82]
      }),
      microAire: crearPose({
        t: 1.5,
        cadera: [96, 95],
        hombro: [96, 43],
        rodilla: [108, 130],
        tobillo: [96, 160],
        pie: [114, 162],
        rodillaLejos: [94, 140],
        tobilloLejos: [92, 185],
        pieLejos: [111, 188],
        codo: [89, 71],
        mano: [85, 95],
        codoLejos: [118, 68],
        manoLejos: [142, 82]
      })
    },
    secuencia: [
      ['base', 0],
      ['microAire', 1500],
      ['base', 3000]
    ]
  },

  // 11. ESTIRAR LA PANTORRILLA (Vuelta a la calma)
  'estirar-pantorrilla': {
    utileria: 'pared',
    duracionCiclo: 3600,
    viewBox: [50, -6, 150, 200],
    poses: {
      estiramiento: crearPose({
        t: 16,
        cadera: [98, 114],
        hombro: [118, 66],
        rodilla: [88, 148], // Pierna trasera recta con talón en el suelo
        tobillo: [68, 185],
        pie: [87, 188],
        rodillaLejos: [126, 146], // Pierna delantera flexionada
        tobilloLejos: [128, 185],
        pieLejos: [147, 188],
        codo: [144, 72],
        mano: [173, 76], // Manos apoyadas en la pared
        codoLejos: [140, 72],
        manoLejos: [173, 76]
      }),
      respiracion: crearPose({
        t: 15,
        cadera: [98, 113],
        hombro: [118, 65],
        rodilla: [88, 148],
        tobillo: [68, 185],
        pie: [87, 188],
        rodillaLejos: [126, 146],
        tobilloLejos: [128, 185],
        pieLejos: [147, 188],
        codo: [144, 72],
        mano: [173, 76],
        codoLejos: [140, 72],
        manoLejos: [173, 76]
      })
    },
    secuencia: [
      ['estiramiento', 0],
      ['respiracion', 1800],
      ['estiramiento', 3600]
    ]
  },

  // 12. PARARSE CON LA PESA (Fuerza N4-5: como sentarse-pararse con brazos cruzados abrazando mancuerna)
  'sentarse-pesa': {
    utileria: 'silla-sentado-pesa',
    duracionCiclo: 6500,
    viewBox: [24, -6, 124, 200],
    poses: {
      sentado: crearPose({
        cadera: [72, 126],
        t: 12,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [92, 102],
        mano: [88, 92],
        codoLejos: [80, 98],
        manoLejos: [86, 90]
      }),
      inclina: crearPose({
        cadera: [76, 124],
        t: 40,
        rodilla: [117, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [102, 106],
        mano: [100, 96],
        codoLejos: [92, 102],
        manoLejos: [98, 94]
      }),
      medio: crearPose({
        cadera: [94, 106],
        t: 28,
        rodilla: [121, 129],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [112, 90],
        mano: [110, 80],
        codoLejos: [104, 86],
        manoLejos: [108, 78]
      }),
      arriba: crearPose({
        cadera: [106, 88],
        t: 3,
        rodilla: [111, 133],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [118, 68],
        mano: [114, 58],
        codoLejos: [108, 64],
        manoLejos: [112, 56]
      })
    },
    secuencia: [
      ['sentado', 0],
      ['inclina', 600],
      ['medio', 1300],
      ['arriba', 2000],
      ['arriba', 2500],
      ['medio', 3500],
      ['inclina', 4600],
      ['sentado', 5500],
      ['sentado', 6500]
    ]
  },

  // 13. EMPUJAR EL MESÓN (Fuerza N4-5: cuerpo recto como tabla, manos en mesón firme a altura de cadera)
  'flexion-meson': {
    utileria: 'meson',
    duracionCiclo: 6000,
    viewBox: [36, -6, 150, 200],
    poses: {
      arriba: crearPose({
        cadera: [88, 142],
        hombro: [122, 102],
        rodilla: [70, 164],
        tobillo: [52, 185],
        pie: [68, 188],
        rodillaLejos: [66, 164],
        tobilloLejos: [48, 185],
        pieLejos: [64, 188],
        codo: [133, 110],
        mano: [144, 118],
        codoLejos: [131, 110],
        manoLejos: [144, 118]
      }),
      medio: crearPose({
        cadera: [92, 145.5],
        hombro: [130, 108.5],
        rodilla: [72, 165.5],
        tobillo: [52, 185],
        pie: [68, 188],
        rodillaLejos: [68, 165.5],
        tobilloLejos: [48, 185],
        pieLejos: [64, 188],
        codo: [129.5, 122],
        mano: [144, 118],
        codoLejos: [127.5, 122],
        manoLejos: [144, 118]
      }),
      abajo: crearPose({
        cadera: [96, 149],
        hombro: [138, 115],
        rodilla: [74, 167],
        tobillo: [52, 185],
        pie: [68, 188],
        rodillaLejos: [70, 167],
        tobilloLejos: [48, 185],
        pieLejos: [64, 188],
        codo: [126, 134],
        mano: [144, 118],
        codoLejos: [124, 134],
        manoLejos: [144, 118]
      })
    },
    secuencia: [
      ['arriba', 0],
      ['medio', 1500],
      ['abajo', 3000],
      ['abajo', 3500],
      ['medio', 4500],
      ['arriba', 5500],
      ['arriba', 6000]
    ]
  },

  // 14. REMO CON LA PESA GRANDE (Fuerza N4-5: reutiliza remo-silla con mancuerna grande de 5 kg)
  'remo-pesado': {
    utileria: 'silla-apoyo-mancuerna-grande',
    duracionCiclo: 6200,
    viewBox: [50, -6, 134, 200],
    poses: {
      abajo: crearPose({
        t: 40,
        cadera: [78, 114],
        hombro: [118, 76],
        rodilla: [84, 148],
        tobillo: [80, 185],
        pie: [99, 188],
        rodillaLejos: [112, 148],
        tobilloLejos: [114, 185],
        pieLejos: [133, 188],
        codo: [118, 106],
        mano: [118, 134],
        codoLejos: [126, 72],
        manoLejos: [144, 82]
      }),
      medio: crearPose({
        t: 40,
        cadera: [78, 114],
        hombro: [118, 76],
        rodilla: [84, 148],
        tobillo: [80, 185],
        pie: [99, 188],
        rodillaLejos: [112, 148],
        tobilloLejos: [114, 185],
        pieLejos: [133, 188],
        codo: [97, 97],
        mano: [97, 125],
        codoLejos: [126, 72],
        manoLejos: [144, 82]
      }),
      arriba: crearPose({
        t: 40,
        cadera: [78, 114],
        hombro: [118, 76],
        rodilla: [84, 148],
        tobillo: [80, 185],
        pie: [99, 188],
        rodillaLejos: [112, 148],
        tobilloLejos: [114, 185],
        pieLejos: [133, 188],
        codo: [89, 74],
        mano: [89, 102],
        codoLejos: [126, 72],
        manoLejos: [144, 82]
      })
    },
    secuencia: [
      ['abajo', 0],
      ['medio', 1000],
      ['arriba', 2000],
      ['arriba', 2600],
      ['medio', 4100],
      ['abajo', 5600],
      ['abajo', 6200]
    ]
  },

  // 15. ZANCADA APOYADO EN LA SILLA (Fuerza N4-5: ambas manos en respaldo, pies sin deslizar, torso vertical, rodilla atras nunca toca el piso)
  'zancada-silla': {
    utileria: 'silla-apoyo-frente',
    duracionCiclo: 6200,
    viewBox: [44, -6, 154, 200],
    poses: {
      arriba: crearPose({
        t: 1,
        cadera: [96, 96],
        hombro: [96, 44],
        cuello: [96, 36],
        cabeza: [98, 24],
        rodilla: [104, 140],
        tobillo: [106, 185],
        pie: [125, 188],
        rodillaLejos: [76, 140],
        tobilloLejos: [56, 176],
        pieLejos: [68, 188],
        codo: [120, 64],
        mano: [142, 82],
        codoLejos: [116, 64],
        manoLejos: [142, 82]
      }),
      abajo: crearPose({
        t: 1,
        cadera: [96, 116],
        hombro: [96, 64],
        cuello: [96, 56],
        cabeza: [98, 44],
        rodilla: [116, 146],
        tobillo: [106, 185],
        pie: [125, 188],
        rodillaLejos: [78, 154],
        tobilloLejos: [56, 172],
        pieLejos: [68, 188],
        codo: [124, 76],
        mano: [142, 82],
        codoLejos: [120, 76],
        manoLejos: [142, 82]
      })
    },
    secuencia: [
      ['arriba', 0],
      ['abajo', 2000],
      ['abajo', 2600],
      ['arriba', 5600],
      ['arriba', 6200]
    ]
  },

  // 16. CAMINAR CON LAS PESAS (Fuerza N3-5: brazos estirados a los lados, marcha con al menos un pie siempre en el piso)
  'caminar-pesas': {
    // Marcha con zancada real (en el sitio): un pie adelante y otro atrás, alternando.
    // Siempre hay un pie apoyado (contacto: los dos; paso: el de apoyo).
    utileria: 'caminar-mancuernas',
    duracionCiclo: 2400,
    viewBox: [40, -6, 120, 200],
    poses: {
      // Contacto 1: pierna cercana adelante (talón), lejana atrás (en punta)
      contacto1: crearPose({
        cadera: [96, 98],
        rodilla: [108, 141], tobillo: [116, 186], pie: [134, 188],
        rodillaLejos: [86, 141], tobilloLejos: [76, 182], pieLejos: [92, 189],
        hombro: [96, 46], hombroLejos: [93, 46],
        codo: [92.5, 76.5], mano: [89, 107],
        codoLejos: [98, 76.5], manoLejos: [103, 107]
      }),
      // Paso 1: apoya la cercana; la lejana pasa por delante con la rodilla un poco arriba
      paso1: crearPose({
        cadera: [96, 95],
        rodilla: [97, 139], tobillo: [96, 184], pie: [114, 188],
        rodillaLejos: [104, 135], tobilloLejos: [96, 174], pieLejos: [112, 178],
        hombro: [96, 43], hombroLejos: [93, 43],
        codo: [96, 75], mano: [96, 107],
        codoLejos: [93, 75], manoLejos: [93, 107]
      }),
      // Contacto 2: lejana adelante, cercana atrás (en punta)
      contacto2: crearPose({
        cadera: [96, 98],
        rodilla: [86, 141], tobillo: [76, 182], pie: [92, 189],
        rodillaLejos: [108, 141], tobilloLejos: [116, 186], pieLejos: [134, 188],
        hombro: [96, 46], hombroLejos: [93, 46],
        codo: [99.5, 76.5], mano: [103, 107],
        codoLejos: [91, 76.5], manoLejos: [89, 107]
      }),
      // Paso 2: apoya la lejana; la cercana pasa por delante
      paso2: crearPose({
        cadera: [96, 95],
        rodilla: [104, 135], tobillo: [96, 174], pie: [112, 178],
        rodillaLejos: [97, 139], tobilloLejos: [96, 184], pieLejos: [114, 188],
        hombro: [96, 43], hombroLejos: [93, 43],
        codo: [96, 75], mano: [96, 107],
        codoLejos: [93, 75], manoLejos: [93, 107]
      })
    },
    secuencia: [
      ['contacto1', 0],
      ['paso1', 600],
      ['contacto2', 1200],
      ['paso2', 1800],
      ['contacto1', 2400]
    ]
  },

  // 17. PRUEBA DE LA SILLA (30 s: pararse y sentarse con los brazos cruzados sobre el pecho, sin mancuerna)
  'prueba-silla': {
    utileria: 'silla-sentado',
    duracionCiclo: 2400,
    viewBox: [24, -6, 124, 200],
    poses: {
      sentado: crearPose({
        cadera: [72, 126],
        t: 12,
        rodilla: [116, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [92, 102],
        mano: [88, 92],
        codoLejos: [80, 98],
        manoLejos: [86, 90]
      }),
      inclina: crearPose({
        cadera: [76, 124],
        t: 40,
        rodilla: [117, 130],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [102, 106],
        mano: [100, 96],
        codoLejos: [92, 102],
        manoLejos: [98, 94]
      }),
      medio: crearPose({
        cadera: [94, 106],
        t: 28,
        rodilla: [121, 129],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [112, 90],
        mano: [110, 80],
        codoLejos: [104, 86],
        manoLejos: [108, 78]
      }),
      arriba: crearPose({
        cadera: [106, 88],
        t: 3,
        rodilla: [111, 133],
        tobillo: [112, 185],
        pie: [131, 188],
        codo: [118, 68],
        mano: [114, 58],
        codoLejos: [108, 64],
        manoLejos: [112, 56]
      })
    },
    secuencia: [
      ['sentado', 0],
      ['inclina', 200],
      ['medio', 500],
      ['arriba', 900],
      ['arriba', 1100],
      ['medio', 1500],
      ['inclina', 1900],
      ['sentado', 2200],
      ['sentado', 2400]
    ]
  }
};

