import { Serializer } from 'jsonade';

export const codeTypeSerializer = new Serializer('codeTypes', {
  keyForAttribute: 'camelCase',
  attributes: [
    'id',
    'code',
    'description',
  ],
});

export const codeSerializer = new Serializer('codes', {
  keyForAttribute: 'camelCase',
  attributes: [
    'id',
    'value',
  ],
});
