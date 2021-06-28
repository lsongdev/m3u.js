import * as m3u from '../index.js';


(async () => {
  const result = await m3u.parseFile('example/sample.m3u', 'utf8');
  console.log(JSON.stringify(result, null, 2));
})();