import { AnamnesisFieldType } from './anamnesis-field-type.enum';

export enum AnamnesisFieldValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN_VALUE = 'minValue',
  MAX_VALUE = 'maxValue',
  PATTERN = 'pattern',
  MIN_DATE = 'minDate',
  MAX_DATE = 'maxDate',
  DATE_IN_FUTURE = 'dateInFuture',
  DATE_IN_PAST = 'dateInPast',
  DATE_TODAY_OR_LATER = 'dateTodayOrLater',
  DATE_TODAY_OR_EARLIER = 'dateTodayOrEarlier',
}

export const ANAMNESIS_FIELD_VALIDATION_TYPE_LABELS: Record<AnamnesisFieldValidationType, string> =
  {
    [AnamnesisFieldValidationType.REQUIRED]: 'Obrigatório',
    [AnamnesisFieldValidationType.MIN_LENGTH]: 'Tamanho mínimo',
    [AnamnesisFieldValidationType.MAX_LENGTH]: 'Tamanho máximo',
    [AnamnesisFieldValidationType.MIN_VALUE]: 'Valor mínimo',
    [AnamnesisFieldValidationType.MAX_VALUE]: 'Valor máximo',
    [AnamnesisFieldValidationType.PATTERN]: 'Padrão (regex)',
    [AnamnesisFieldValidationType.MIN_DATE]: 'Data mínima',
    [AnamnesisFieldValidationType.MAX_DATE]: 'Data máxima',
    [AnamnesisFieldValidationType.DATE_IN_FUTURE]: 'Deve ser uma data futura',
    [AnamnesisFieldValidationType.DATE_IN_PAST]: 'Deve ser uma data passada',
    [AnamnesisFieldValidationType.DATE_TODAY_OR_LATER]: 'Deve ser hoje ou uma data futura',
    [AnamnesisFieldValidationType.DATE_TODAY_OR_EARLIER]: 'Deve ser hoje ou uma data passada',
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
  [AnamnesisFieldType.DATE]: [
    AnamnesisFieldValidationType.REQUIRED,
    AnamnesisFieldValidationType.MIN_DATE,
    AnamnesisFieldValidationType.MAX_DATE,
    AnamnesisFieldValidationType.DATE_IN_FUTURE,
    AnamnesisFieldValidationType.DATE_IN_PAST,
    AnamnesisFieldValidationType.DATE_TODAY_OR_LATER,
    AnamnesisFieldValidationType.DATE_TODAY_OR_EARLIER,
  ],
  [AnamnesisFieldType.BOOLEAN]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.CHECKBOX]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.RADIO]: [AnamnesisFieldValidationType.REQUIRED],
  [AnamnesisFieldType.SELECT]: [AnamnesisFieldValidationType.REQUIRED],
};

export const VALIDATION_ARGS_KEY: Record<
  AnamnesisFieldValidationType,
  'length' | 'value' | 'pattern' | 'date' | null
> = {
  [AnamnesisFieldValidationType.REQUIRED]: null,
  [AnamnesisFieldValidationType.MIN_LENGTH]: 'length',
  [AnamnesisFieldValidationType.MAX_LENGTH]: 'length',
  [AnamnesisFieldValidationType.MIN_VALUE]: 'value',
  [AnamnesisFieldValidationType.MAX_VALUE]: 'value',
  [AnamnesisFieldValidationType.PATTERN]: 'pattern',
  [AnamnesisFieldValidationType.MIN_DATE]: 'date',
  [AnamnesisFieldValidationType.MAX_DATE]: 'date',
  [AnamnesisFieldValidationType.DATE_IN_FUTURE]: null,
  [AnamnesisFieldValidationType.DATE_IN_PAST]: null,
  [AnamnesisFieldValidationType.DATE_TODAY_OR_LATER]: null,
  [AnamnesisFieldValidationType.DATE_TODAY_OR_EARLIER]: null,
};
