import { HttpParams } from '@angular/common/http';
import dayjs from 'dayjs/esm';

export function httpParamsFromObject(object: Record<string, unknown>): HttpParams {
  const entries = Object.entries(object);
  let params = new HttpParams();
  for (const [key, value] of entries) {
    params = appendValue(params, key, value);
  }
  return params;
}

function appendValue(params: HttpParams, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return params;
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return params.append(key, String(value));
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      appendValue(params, key, item);
    }
    return params;
  }
  if (typeof value !== 'object') {
    return params;
  }
  if (value instanceof Date && dayjs(value).isValid()) {
    return params.append(key, dayjs(value).toISOString());
  }
  for (const [subKey, subValue] of Object.entries(value)) {
    appendValue(params, `${key}[${subKey}]`, subValue);
  }
  return params;
}
