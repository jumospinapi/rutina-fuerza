// js/rutina.js
// Datos fijos de la rutina definidos en docs/03-rutina.md v1.2.
// No modificar textos, repeticiones ni descansos sin aprobación de Claude.

export const EJERCICIOS = [
  {
    id: 'marcha-sentado',
    nombre: 'Marcha sentado',
    bloque: 'calentamiento',
    tipo: 'tiempo',
    segundos: 60,
    lado: 'ambos',
    equipo: 'silla',
    instruccion: 'Sentado derecho, sube una rodilla y luego la otra, como si caminaras.',
    ojo: null
  },
  {
    id: 'brazos-al-frente',
    nombre: 'Subir los brazos',
    bloque: 'calentamiento',
    tipo: 'tiempo',
    segundos: 45,
    lado: 'ambos',
    equipo: 'silla',
    instruccion: 'Sentado, sube los brazos al frente hasta la altura de los hombros y bájalos despacio.',
    ojo: null
  },
  {
    id: 'marcha-de-pie',
    nombre: 'Marcha de pie',
    bloque: 'calentamiento',
    tipo: 'tiempo',
    segundos: 60,
    lado: 'ambos',
    equipo: 'silla (apoyo)',
    instruccion: 'De pie, con una mano en el respaldo de la silla, marcha en el sitio.',
    ojo: null
  },
  {
    id: 'sentarse-pararse',
    nombre: 'Sentarse y pararse',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'ambos',
    equipo: 'silla',
    instruccion: 'Pies firmes. Inclínate un poco hacia adelante y párate. Siéntate despacio, contando 3.',
    ojo: 'Si cuesta, ayúdate con las manos en los muslos.'
  },
  {
    id: 'flexion-pared',
    nombre: 'Empujar la pared',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'ambos',
    equipo: 'pared',
    instruccion: 'Manos en la pared a la altura del pecho. Dobla los codos y acerca el pecho a la pared. Empuja para volver.',
    ojo: 'Cuerpo recto como una tabla.'
  },
  {
    id: 'remo-silla',
    nombre: 'Remo apoyado en la silla',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'cada brazo',
    equipo: 'silla + pesa (§2.1)',
    instruccion: 'Una mano en el respaldo y la espalda recta. Sube la pesa hacia la cintura y bájala despacio.',
    ojo: 'No dobles ni gires la espalda.'
  },
  {
    id: 'talones',
    nombre: 'Subir los talones',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'ambos',
    equipo: 'silla (apoyo)',
    instruccion: 'De pie, con las manos en el respaldo. Sube en puntas de pie y baja despacio.',
    ojo: null
  },
  {
    id: 'pierna-atras',
    nombre: 'Pierna hacia atrás',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'cada pierna',
    equipo: 'silla (apoyo)',
    instruccion: 'Manos en el respaldo. Lleva una pierna estirada hacia atrás, sin inclinarte, y vuelve.',
    ojo: 'Movimiento pequeño: la espalda no se arquea.'
  },
  {
    id: 'curl-sentado',
    nombre: 'Doblar los brazos',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'ambos',
    equipo: 'silla + 2 pesas (§2.1)',
    instruccion: 'Sentado, con una pesa en cada mano y los codos pegados al cuerpo. Sube las pesas y bájalas despacio.',
    ojo: null
  },
  {
    id: 'un-pie',
    nombre: 'Pararse en un pie',
    bloque: 'equilibrio',
    tipo: 'tiempo',
    dosis: '2 × 10 s',
    segundos: 10,
    series: 2,
    lados: ['pie derecho', 'pie izquierdo'],
    lado: 'cada pie',
    equipo: 'silla (apoyo)',
    instruccion: 'Con una mano en la silla, levanta un pie del piso y mantén el equilibrio.',
    ojo: 'Siempre con la mano en la silla.'
  },
  {
    id: 'estirar-pantorrilla',
    nombre: 'Estirar la pantorrilla',
    bloque: 'vuelta a la calma',
    tipo: 'tiempo',
    segundos: 30,
    series: 1,
    lados: ['pierna derecha', 'pierna izquierda'],
    lado: 'cada pierna',
    equipo: 'pared',
    instruccion: 'Manos en la pared y una pierna atrás, estirada, con el talón en el piso. Quédate quieto y respira.',
    ojo: 'Sin rebotes.'
  }
];

export const EJERCICIOS_NUEVOS = [
  {
    id: 'sentarse-pesa',
    nombre: 'Pararse con la pesa',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'ambos',
    equipo: 'silla + 1 pesa (§2.1)',
    instruccion: 'Abraza la pesa contra el pecho con los dos brazos. Párate y siéntate despacio, contando 3.',
    ojo: 'Si cuesta mucho, usa la de 5 lb.'
  },
  {
    id: 'flexion-meson',
    nombre: 'Empujar el mesón',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'ambos',
    equipo: 'mesón o mueble firme',
    instruccion: 'Manos en el borde de un mesón firme. Dobla los codos y acerca el pecho. Empuja para volver.',
    ojo: 'El mueble no se debe mover. Cuerpo recto.'
  },
  {
    id: 'remo-pesado',
    nombre: 'Remo con la pesa grande',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'cada brazo',
    equipo: 'silla + pesa (§2.1)',
    instruccion: 'Igual que el remo de antes, pero con la pesa de 10 lb. Sube la pesa hacia la cintura y bájala despacio.',
    ojo: 'No dobles ni gires la espalda.'
  },
  {
    id: 'zancada-silla',
    nombre: 'Zancada apoyado en la silla',
    bloque: 'fuerza',
    tipo: 'reps',
    lado: 'cada pierna',
    equipo: 'silla (apoyo, las dos manos)',
    instruccion: 'Manos en el respaldo, un pie adelante y otro atrás. Baja un poco doblando las rodillas y sube.',
    ojo: 'Baja solo un poco, con la espalda derecha. Si te duele la rodilla, baja menos.'
  },
  {
    id: 'caminar-pesas',
    nombre: 'Caminar con las pesas',
    bloque: 'fuerza',
    tipo: 'tiempo',
    segundos: 45,
    series: 1,
    lado: 'ambos',
    equipo: '2 pesas (§2.1) + pasillo despejado',
    instruccion: 'Una pesa en cada mano. Camina derecho, ida y vuelta.',
    ojo: 'Quita los tapetes. Si te sientes inestable, para.'
  }
];

export const REEMPLAZOS_NIVEL_4_5 = {
  'sentarse-pararse': 'sentarse-pesa',
  'flexion-pared': 'flexion-meson',
  'remo-silla': 'remo-pesado',
  'pierna-atras': 'zancada-silla'
};

export const TODOS_LOS_EJERCICIOS = [...EJERCICIOS, ...EJERCICIOS_NUEVOS];

export function obtenerEjercicio(id) {
  return TODOS_LOS_EJERCICIOS.find(e => e.id === id) || null;
}

/**
 * Tabla de pesas según nivel (docs/03 §2.1).
 */
export const TABLA_PESAS = {
  'remo-silla': { 1: '1 de 5 lb', 2: '1 de 5 lb', 3: '1 de 5 lb' },
  'remo-pesado': { 4: '1 de 10 lb', 5: '1 de 10 lb' },
  'curl-sentado': { 1: '2 de 5 lb', 2: '2 de 5 lb', 3: '2 de 5 lb', 4: '2 de 5 lb', 5: '2 de 10 lb' },
  'sentarse-pesa': { 4: '1 de 10 lb', 5: '1 de 10 lb' },
  'caminar-pesas': { 3: '2 de 5 lb', 4: '2 de 10 lb', 5: '2 de 10 lb' }
};

export function obtenerPesa(ejercicioId, nivel) {
  const ej = TABLA_PESAS[ejercicioId];
  if (!ej) return null;
  return ej[nivel] || null;
}

export function formatoEtiquetaPesa(pesaStr) {
  if (!pesaStr) return null;
  // Frase de acción, más fácil de notar que "Pesa: 1 de 5 lb"
  if (pesaStr.startsWith('2')) {
    return `Usa 2 pesas de ${pesaStr.replace(/^2 de\s*/, '')}`;
  }
  return `Usa 1 pesa de ${pesaStr.replace(/^1 de\s*/, '')}`;
}

export function formatoPreparaPesa(pesaStr) {
  if (!pesaStr) return null;
  if (pesaStr.startsWith('2')) {
    return `Prepara: 2 pesas de ${pesaStr.replace(/^2 de\s*/, '')}`;
  }
  return `Prepara: 1 pesa de ${pesaStr.replace(/^1 de\s*/, '')}`;
}

export function obtenerEjerciciosPorNivel(nivel = 1) {
  const nivelValido = [1, 2, 3, 4, 5].includes(nivel) ? nivel : 1;
  const base = EJERCICIOS.map(ej => {
    if (nivelValido === 4 || nivelValido === 5) {
      const nuevoId = REEMPLAZOS_NIVEL_4_5[ej.id];
      if (nuevoId) {
        return obtenerEjercicio(nuevoId) || ej;
      }
    }
    return ej;
  });

  // En niveles 3, 4 y 5, caminar-pesas va justo después de curl-sentado
  if (nivelValido >= 3) {
    const idxCurl = base.findIndex(e => e.id === 'curl-sentado');
    const caminar = obtenerEjercicio('caminar-pesas');
    if (idxCurl !== -1 && caminar) {
      const conCaminar = [...base];
      conCaminar.splice(idxCurl + 1, 0, caminar);
      return conCaminar;
    }
  }

  return base;
}

export const CONFIG_NIVELES = {
  1: { seriesFuerza: 1, repsFuerza: 8, repsTalones: 10, duracionAproxMin: 13, unPieSegundos: 10 },
  2: { seriesFuerza: 2, repsFuerza: 8, repsTalones: 10, duracionAproxMin: 22, unPieSegundos: 10 },
  3: { seriesFuerza: 2, repsFuerza: 10, repsTalones: 12, duracionAproxMin: 27, unPieSegundos: 10 },
  4: { seriesFuerza: 2, repsFuerza: 10, repsTalones: 12, duracionAproxMin: 28, unPieSegundos: 15 },
  5: { seriesFuerza: 2, repsFuerza: 12, repsTalones: 14, duracionAproxMin: 30, unPieSegundos: 15 }
};

export const DESCANSOS = {
  entreSeries: 45,
  entreEjercicios: 30
};

export const AVISO_SEGURIDAD = {
  tituloAntes: 'Antes de empezar',
  puntosAntes: [
    'Consulta con tu médico antes de empezar esta rutina.',
    'Usa zapatos cerrados y una silla firme, apoyada contra la pared.',
    'Muévete despacio y respira. No aguantes el aire.'
  ],
  tituloDetente: 'Detente y descansa si sientes:',
  puntosDetente: [
    'dolor en el pecho, mareo o falta de aire fuerte;',
    'un dolor agudo en alguna articulación o en la espalda;',
    'sudor frío, temblor o mucha debilidad.'
  ],
  textoAyuda: 'Si no se pasa en unos minutos, busca ayuda médica.',
  textoNormal: 'Una molestia muscular leve al día siguiente es normal.',
  boton: 'Entendido'
};
