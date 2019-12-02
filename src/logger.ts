import chalk from 'chalk';

export type LogLevels = 'info' | 'debug' | 'error' | 'warn';
const colors = {
  debug: chalk.blueBright,
  error: chalk.redBright,
  warn: chalk.yellowBright
} as const;

export class Logger {
  constructor(readonly debugMode: boolean) {}

  /** the last log msg time */
  private last = Date.now();

  private log(level: LogLevels, ...data: any[]) {
    const colorify = (colors as any)[level];
    const prefix = colorify ? colorify(level) : chalk.magentaBright(level);

    if (this.debugMode) {
      // enable timings between last messages if debug is set
      const nowMs = Date.now();
      const sinceLast = nowMs - this.last;
      const suffixRaw = `+${sinceLast}ms`;
      const suffixColoured = colorify ? colorify(suffixRaw) : chalk.magenta(suffixRaw);
      data.push(suffixColoured);
      this.last = nowMs;
    } else if (level === 'debug') {
      return;
    }

    data.unshift(prefix);
    console[level](...data);
  }

  /** Default log, similar to console.log */
  info = (...data: any[]) => this.log('info', ...data);
  debug = (...data: any[]) => this.log('debug', ...data);
  error = (...data: any[]) => this.log('error', ...data);
  warn = (...data: any[]) => this.log('warn', ...data);
  throw = (...data: any[]) => {
    this.error(...data);
    process.exit(1);
  };
}
