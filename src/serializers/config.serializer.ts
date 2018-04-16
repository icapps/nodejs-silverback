import { Serializer } from 'jsonade';

export const appVersionSerializer = new Serializer('versions', {
  keyForAttribute: 'camelCase',
  attributes: [
    'minVersion',
    'latestVersion',
  ],
});

export const apiVersionSerializer = new Serializer('versions', {
  keyForAttribute: 'camelCase',
  attributes: [
    'build',
    'version',
  ],
});
