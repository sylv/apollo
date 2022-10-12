import chalk from "chalk";
import dedent from "dedent";
import { inspect } from "util";
import { ApolloParser } from "../classes/apollo-parser";
import { ApolloOutput } from "../types";
import { cleanFilePath } from "./clean-file-path";

const useColours = ["blue", "magenta", "cyan", "gray", "green", "yellow", "red"] as const;
const resolved = new Map<string, string>();
let offset = 0;

const getChalkPropertyColour = (input: string) => {
  const existing = resolved.get(input);
  if (existing) {
    return {
      wrap: (chalk as any)[existing],
      seen: true,
    };
  }

  const nextColour = useColours[offset++ % useColours.length];
  resolved.set(input, nextColour);
  return {
    wrap: (chalk as any)[nextColour],
    seen: false,
  };
};

const filterKeys = (input: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const result = filterKeys(value);
      if (Object.keys(result).length !== 0) {
        filtered[key] = result;
      }

      continue;
    }

    filtered[key] = value;
  }

  return filtered;
};

export const coloriseResult = (input: string, result: ApolloOutput, parser: ApolloParser) => {
  const cleanInput = cleanFilePath(input);
  const matches = parser.matchIndexes;
  if (!cleanInput) {
    throw new Error(`Invalid input "${input}"`);
  }

  let colorised = "";
  const colourKeys: string[] = [];
  for (let charIndex = 0; charIndex < cleanInput.length; charIndex++) {
    const char = cleanInput[charIndex];
    const matchContainingChar = matches.find((match) => match.start <= charIndex && charIndex < match.end);
    if (!matchContainingChar) {
      colorised += char;
      continue;
    }

    const propertyName = matchContainingChar.propertyName ?? "unknown extractor";
    const propertyColour = getChalkPropertyColour(propertyName);
    colorised += propertyColour.wrap(char);
    if (!propertyColour.seen) {
      colourKeys.push(propertyColour.wrap(propertyName));
    }
  }

  const inspected = inspect(filterKeys(result), { colors: true, depth: null });

  // avert your eyes.
  // dedent doesnt like inspected results and breaks, so it has to be added separately.
  return (
    "\n\n" +
    dedent`
    ${chalk.bold("Input")}
    ${colorised}

    ${chalk.bold("Extracted properties")}
    ${colourKeys.join(", ")}
  ` +
    `\n
${chalk.bold("Result")}
${inspected}` +
    "\n\n"
  );
};
