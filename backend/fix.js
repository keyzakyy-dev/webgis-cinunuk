import { execute } from './src/config/db.js';

(async () => {
  const fixedGeometry = '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[107.9722508154205,-7.162371991370167],[107.9721361723681,-7.162254385780157]]]}}';
  await execute('UPDATE features SET geometry = ? WHERE id = 1', [fixedGeometry]);
  console.log('Fixed DB row ID 1');
  process.exit(0);
})();
