import fs from 'fs';
import { createReader } from './lib/reader.js';
import { createWriter } from './lib/writer.js';

const { readFile } = fs.promises;

export const parse = content => {
  const reader = createReader();
  reader.read(content);
  return reader.result;
};

export const parseFile = async (filename, options) => {
  const content = await readFile(filename, options);
  return parse(content);
};

export { createReader, createWriter };