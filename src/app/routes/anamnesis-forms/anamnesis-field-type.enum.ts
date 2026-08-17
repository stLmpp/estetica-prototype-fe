export enum AnamnesisFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SELECT = 'SELECT',
}

export const ANAMNESIS_FIELD_TYPE_LABELS: Record<AnamnesisFieldType, string> = {
  [AnamnesisFieldType.TEXT]: 'Texto',
  [AnamnesisFieldType.NUMBER]: 'Número',
  [AnamnesisFieldType.DATE]: 'Data',
  [AnamnesisFieldType.BOOLEAN]: 'Sim/Não',
  [AnamnesisFieldType.CHECKBOX]: 'Múltipla escolha',
  [AnamnesisFieldType.RADIO]: 'Escolha única',
  [AnamnesisFieldType.SELECT]: 'Lista suspensa',
};

export const CHOICE_FIELD_TYPES = new Set<AnamnesisFieldType>([
  AnamnesisFieldType.RADIO,
  AnamnesisFieldType.SELECT,
  AnamnesisFieldType.CHECKBOX,
]);
