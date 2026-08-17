import { AnamnesisFieldType } from './anamnesis-field-type.enum';

export enum AnamnesisFieldValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN_VALUE = 'minValue',
  MAX_VALUE = 'maxValue',
  PATTERN = 'pattern',
}

export const ANAMNESIS_FIELD_VALIDATION_TYPE_LABELS: Record<AnamnesisFieldValidationType, string> =
  {
    [AnamnesisFieldValidationType.REQUIRED]: 'Obrigatório',
    [AnamnesisFieldValidationType.MIN_LENGTH]: 'Tamanho mínimo',
    [AnamnesisFieldValidationType.MAX_LENGTH]: 'Tamanho máximo',
    [AnamnesisFieldValidationType.MIN_VALUE]: 'Valor mínimo',
    [AnamnesisFieldValidationType.MAX_VALUE]: 'Valor máximo',
    [AnamnesisFieldValidationType.PATTERN]: 'Padrão (regex)',
  };

export const VALIDATION_TYPES_BY_FIELD_TYPE: Record<
  AnamnesisFieldType,
  AnamnesisFieldValidationType[]
> = {
  [AnamnesisFieldType.TEXT]: [
    AnamnesisFieldValidationType.REQUIRED,
    AnamnesisFieldValidationType.MIN_LENGTH,
    AnamnesisFieldValidationType.MAX_LENGTH,
    AnamnesisFieldValidationType.PATTERN,
  ],
  [AnamnesisFieldType.NUMBER]: [
    AnamnesisFieldValidationType.REQUIRED,
    AnamnesisFieldValidationType.MIN_VALUE,
    AnamnesisFieldValidationType.MAX_VALUE,
  ],
  [AnamnesisFieldType.DATE]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.BOOLEAN]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.CHECKBOX]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.RADIO]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.SELECT]: [AnamnesisFieldValidationType.REQUIRED],
};

export const VALIDATION_ARGS_KEY: Record<
  AnamnesisFieldValidationType,
  'length' | 'value' | 'pattern' | null
> = {
  [AnamnesisFieldValidationType.REQUIRED]: null,
  [AnamnesisFieldValidationType.MIN_LENGTH]: 'length',
  [AnamnesisFieldValidationType.MAX_LENGTH]: 'length',
  [AnamnesisFieldValidationType.MIN_VALUE]: 'value',
  [AnamnesisFieldValidationType.MAX_VALUE]: 'value',
  [AnamnesisFieldValidationType.PATTERN]: 'pattern',
};
