export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const escapeCsv = (val: string | number | boolean) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCsv).join(',');
  const bodyRows = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
  const csvContent = `${headerRow}\n${bodyRows}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
