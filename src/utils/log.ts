/* eslint-disable @typescript-eslint/no-explicit-any */

export const Log = {
  IDENTIFIER: '[flk]',

  error(...args: any[]): void {
    console.error(this.IDENTIFIER, ...args);
  },

  warn(...args: any[]): void {
    console.warn(this.IDENTIFIER, ...args);
  },

  info(...args: any[]): void {
    console.info(this.IDENTIFIER, ...args);
  },
};

/* eslint-enable @typescript-eslint/no-explicit-any */
