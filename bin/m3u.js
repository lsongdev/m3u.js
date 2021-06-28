#!/usr/bin/env node

import * as m3u from '../index.js';

const reader = m3u.createReader();

process
  .stdin
  .on('data', data => reader.read(data))
  .on('end', () => {
    const { result } = reader;
    console.log(JSON.stringify(result, null, 2));
  });