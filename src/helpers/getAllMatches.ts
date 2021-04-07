export function getAllMatches(target: string, regex: RegExp) {
  if (!regex.flags.includes("g")) throw new Error('"g" flag must be set');
  regex.lastIndex = 0;
  let match: RegExpExecArray | null = null;
  let matches: RegExpExecArray[] = [];
  while ((match = regex.exec(target))) {
    matches.push(match);
  }

  return matches;
}
