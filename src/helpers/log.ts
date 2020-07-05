import { Signale } from "signale";

// todo: signale looks great but is pretty horrible and the log levels aren't configurable enough.
// replace it with something better.
export const isDebug = process.argv.includes("--debug");
export const log = new Signale({
  scope: "apollo",
  logLevel: isDebug ? "info" : "warn"
});
