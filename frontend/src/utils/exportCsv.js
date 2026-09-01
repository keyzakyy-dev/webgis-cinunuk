export function exportToCsv(filename, rows, headers) {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = headers ? headers.map(h => h.key) : Object.keys(rows[0]);
  const headerLabels = headers ? headers.map(h => `"${h.label || h.key}"`) : keys.map(k => `"${k}"`);

  const csvRows = [headerLabels.join(separator)];

  for (const row of rows) {
    const values = keys.map((key) => {
      let val = row[key];
      if (val === null || val === undefined) val = '';
      else if (typeof val === 'object') val = JSON.stringify(val);
      else val = String(val);
      // Escape double quotes
      val = val.replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(separator));
  }

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
