export function normalizarUsuario(usuario: string) {
  return usuario.trim().toLowerCase();
}

export function validarCredenciales(usuario: string, contrasena: string) {
  if (!usuario.trim() || !contrasena.trim()) {
    return 'Completá el usuario y la contraseña.';
  }

  if (usuario.trim().length < 3) {
    return 'El usuario debe tener al menos 3 caracteres.';
  }

  if (contrasena.length < 4) {
    return 'La contraseña debe tener al menos 4 caracteres.';
  }

  return null;
}

export function interpretarHora(hora: string) {
  const coincidencia = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora.trim());
  if (!coincidencia) return null;

  return {
    hora: Number(coincidencia[1]),
    minuto: Number(coincidencia[2]),
  };
}

export function validarHabito(
  titulo: string,
  frecuencia: string,
  recordatorioActivo = false,
  horaRecordatorio = '',
) {
  if (!titulo.trim()) {
    return 'Ingresá un nombre para el hábito.';
  }

  if (!frecuencia.trim()) {
    return 'Ingresá una frecuencia.';
  }

  if (recordatorioActivo && !interpretarHora(horaRecordatorio)) {
    return 'Ingresá una hora válida con el formato HH:MM.';
  }

  return null;
}

export function nombreDiaSemana(dia: number) {
  return ['', 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][dia] ?? '';
}

export function clavePeriodoActual(
  frecuencia: 'Diario' | 'Semanal',
  fecha = new Date(),
) {
  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  if (frecuencia === 'Diario') {
    return `${ano}-${mes}-${dia}`;
  }

  const fechaUtc = new Date(Date.UTC(ano, fecha.getMonth(), fecha.getDate()));
  const diaSemana = fechaUtc.getUTCDay() || 7;
  fechaUtc.setUTCDate(fechaUtc.getUTCDate() + 4 - diaSemana);
  const inicioAno = new Date(Date.UTC(fechaUtc.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((fechaUtc.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7);
  return `${fechaUtc.getUTCFullYear()}-S${String(semana).padStart(2, '0')}`;
}

export function estaRealizadoEnPeriodoActual(
  frecuencia: 'Diario' | 'Semanal',
  realizadosEn: string[],
  fecha = new Date(),
) {
  return realizadosEn.includes(clavePeriodoActual(frecuencia, fecha));
}
