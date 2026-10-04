import {
  clavePeriodoActual,
  estaRealizadoEnPeriodoActual,
  interpretarHora,
  normalizarUsuario,
  validarCredenciales,
  validarHabito,
} from '@/utils/validation';

describe('validaciones', () => {
  it('normaliza el usuario para evitar duplicados por mayúsculas', () => {
    expect(normalizarUsuario('  Maria  ')).toBe('maria');
  });

  it('rechaza credenciales incompletas o demasiado cortas', () => {
    expect(validarCredenciales('', '')).toBe('Completá el usuario y la contraseña.');
    expect(validarCredenciales('ab', '1234')).toBe(
      'El usuario debe tener al menos 3 caracteres.',
    );
    expect(validarCredenciales('ana', '123')).toBe(
      'La contraseña debe tener al menos 4 caracteres.',
    );
  });

  it('valida los datos mínimos de un hábito', () => {
    expect(validarHabito('', 'Diario')).toBe('Ingresá un nombre para el hábito.');
    expect(validarHabito('Caminar', '')).toBe('Ingresá una frecuencia.');
    expect(validarHabito('Caminar', 'Diario')).toBeNull();
    expect(validarHabito('Caminar', 'Diario', true, '25:00')).toBe(
      'Ingresá una hora válida con el formato HH:MM.',
    );
    expect(validarHabito('Caminar', 'Diario', true, '08:30')).toBeNull();
  });

  it('interpreta únicamente horas válidas de 24 horas', () => {
    expect(interpretarHora('07:05')).toEqual({ hora: 7, minuto: 5 });
    expect(interpretarHora('24:00')).toBeNull();
    expect(interpretarHora('9:00')).toBeNull();
  });

  it('distingue períodos diarios y semanales para marcar hábitos realizados', () => {
    const lunes = new Date(2026, 9, 5, 10);
    const martes = new Date(2026, 9, 6, 10);
    const siguienteLunes = new Date(2026, 9, 12, 10);
    const semana = clavePeriodoActual('Semanal', lunes);

    expect(estaRealizadoEnPeriodoActual('Semanal', [semana], martes)).toBe(true);
    expect(estaRealizadoEnPeriodoActual('Semanal', [semana], siguienteLunes)).toBe(false);
    expect(clavePeriodoActual('Diario', lunes)).not.toBe(clavePeriodoActual('Diario', martes));
  });
});
