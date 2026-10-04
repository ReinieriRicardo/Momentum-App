export type Usuario = {
  nombre: string;
  contrasena: string;
};

export type FrecuenciaHabito = 'Diario' | 'Semanal';

export type Habito = {
  id: string;
  propietario: string;
  titulo: string;
  descripcion: string;
  frecuencia: FrecuenciaHabito;
  realizadosEn: string[];
  creadoEn: string;
  recordatorioActivo: boolean;
  horaRecordatorio?: string;
  diaSemanaRecordatorio?: number;
  notificacionId?: string;
};

export type NuevoHabito = Pick<
  Habito,
  'titulo' | 'descripcion' | 'frecuencia' | 'recordatorioActivo' | 'horaRecordatorio'
>;

export type ResultadoAutenticacion = {
  ok: boolean;
  mensaje?: string;
};
