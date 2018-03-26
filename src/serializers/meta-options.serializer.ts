import { Serializer } from 'jsonade';

export const metaOptionsSerializer = new Serializer('metaOptions', {
  keyForAttribute: 'camelCase',
  attributes: [
    'id',
    'code',
    'value',
  ],
});
