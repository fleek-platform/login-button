export const Log = {
  IDENTIFIER: '[flk]',
  // biome-ignore lint: Enable any for logging function
  error(...args: any[]): void {
    console.error(this.IDENTIFIER, ...args);
  },

  // biome-ignore lint: Enable any for logging function
  warn(...args: any[]): void {
    console.warn(this.IDENTIFIER, ...args);
  },

  // biome-ignore lint: Enable any for logging function
  info(...args: any[]): void {
    console.info(this.IDENTIFIER, ...args);
  },
};
