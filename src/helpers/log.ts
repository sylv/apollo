import { Signale } from "signale";

export const isDebug = process.argv.includes("--debug");
export const log = new Signale({
  scope: "apollo",
  logLevel: isDebug ? "info" : "warn"
});
