// Date utility helper for school attendance in India Standard Time (Asia/Kolkata)
// Ensures consistency across browsers, client locations, and servers.

// Format any Date or ISO string into YYYY-MM-DD in Asia/Kolkata timezone
export function getIndianDateString(d = new Date()) {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj)) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

// Convert a date or YYYY-MM-DD string to IST day start (00:00:00.000+05:30 in UTC)
export function getIndianDayStart(d = new Date()) {
  const dateStr = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : getIndianDateString(d);
  return new Date(`${dateStr}T00:00:00+05:30`);
}

// Convert a date or YYYY-MM-DD string to IST day end (23:59:59.999+05:30 in UTC)
export function getIndianDayEnd(d = new Date()) {
  const dateStr = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : getIndianDateString(d);
  return new Date(`${dateStr}T23:59:59.999+05:30`);
}

// Get the full IST range for querying attendance across dates
export function getIndianDateRange(start, end) {
  const sDateStr = getIndianDateString(start);
  const eDateStr = getIndianDateString(end);
  const startDate = new Date(`${sDateStr}T00:00:00+05:30`);
  const endDate = new Date(`${eDateStr}T23:59:59.999+05:30`);
  return { startDate, endDate, sDateStr, eDateStr };
}

// Formats YYYY-MM-DD to DD/MM for display in tables and reports
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}
