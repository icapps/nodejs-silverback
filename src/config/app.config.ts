import * as fs from 'fs';
import * as path from 'path';

// Read package.json on init
const root = path.resolve(__dirname, '..', '..');
const contents: any = fs.readFileSync(`${root}/package.json`);
let pjson: PJson = {};
if (contents) {
  pjson = JSON.parse(contents);
}

export const VERSIONS = {
  'Version 1': '/v1',
};

export const settings = {
  saltCount: parseInt(process.env.SALT_COUNT || '10', 10),
  version: pjson.version,
};

export const mailSettings = {
  systemEmail: process.env.SYSTEM_EMAIL || 'info@icapps.com',
};

// Interfaces
export interface PJson {
  name?: string;
  version?: string;
}
