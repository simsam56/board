const SHORT_MONTHS = [
  "jan", "fév", "mar", "avr", "mai", "jun",
  "jul", "aoû", "sep", "oct", "nov", "déc",
];

/**
 * Formate une clé de semaine en plage lisible "9-15 mar".
 * Accepte "2026-03-09" (date du lundi) ou "2025-W10" (ancien format).
 */
export function formatWeekLabel(week: string): string {
  // Nouveau format: date ISO du lundi (ex: "2026-03-09")
  if (/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    const d = new Date(week + "T00:00:00");
    const sun = new Date(d);
    sun.setDate(d.getDate() + 6);

    const dDay = d.getDate();
    const sunDay = sun.getDate();
    const dMonth = SHORT_MONTHS[d.getMonth()];
    const sunMonth = SHORT_MONTHS[sun.getMonth()];

    if (dMonth === sunMonth) {
      return `${dDay}-${sunDay} ${dMonth}`;
    }
    return `${dDay} ${dMonth}-${sunDay} ${sunMonth}`;
  }
  // Ancien format: "2025-W10" → convertir en date du lundi
  const match = week.match(/^(\d{4})-W(\d{1,2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const weekNum = parseInt(match[2], 10);
    // Approx: semaine W du lundi = Jan 1 + (weekNum * 7) - offset
    const jan1 = new Date(year, 0, 1);
    const jan1Day = jan1.getDay() || 7; // 1=Mon...7=Sun
    const monday = new Date(year, 0, 1 + (weekNum - 1) * 7 - (jan1Day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const dDay = monday.getDate();
    const sunDay = sunday.getDate();
    const dMonth = SHORT_MONTHS[monday.getMonth()];
    const sunMonth = SHORT_MONTHS[sunday.getMonth()];

    if (dMonth === sunMonth) {
      return `${dDay}-${sunDay} ${dMonth}`;
    }
    return `${dDay} ${dMonth}-${sunDay} ${sunMonth}`;
  }
  return week;
}
