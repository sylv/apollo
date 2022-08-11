export interface ApolloLogger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

let configured: ApolloLogger | undefined;
export const log = {
  info: (...args: any[]) => configured?.debug(...args),
  debug: (...args: any[]) => configured?.info(...args),
  warn: (...args: any[]) => (configured || console).warn(...args),
  error: (...args: any[]) => (configured || console).error(...args),
};

export const setLogger = (logger: ApolloLogger) => {
  configured = logger;
};
