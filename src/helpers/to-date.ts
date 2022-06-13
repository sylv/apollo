/**
 * Convert an extracted date into a date object.
 * Returns undefined if the date is invalid, and handles the month being in the wrong format (best effort)
 */
export const toDate = (year: number | string, month: number | string, day: number | string) => {
  if (typeof year === "string") year = Number(year);
  if (typeof month === "string") month = Number(month);
  if (typeof day === "string") day = Number(day);

  if (year < 1950) return;
  const monthIsSwitched = month > 12;
  if (monthIsSwitched) {
    const temp = month;
    month = day;
    day = temp;
  }

  if (month > 12) return;
  if (day > 31) return;
  if (year > new Date().getFullYear() + 2) {
    // too far in the future
    return;
  }

  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return;
  return date;
};
