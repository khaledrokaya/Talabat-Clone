// Simple colored console logger utility
export class Logger {
  // ANSI color codes
  private static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
  };

  private static formatMessage(
    level: string,
    message: string,
    color: string,
  ): string {
    const timestamp = new Date().toISOString();
    const levelFormatted = `[${level.padEnd(5)}]`;

    if (process.env.NODE_ENV === 'production') {
      // No colors in production for log parsing
      return `${timestamp} ${levelFormatted} ${message}`;
    }

    return `${this.colors.gray}${timestamp}${this.colors.reset} ${color}${levelFormatted}${this.colors.reset} ${message}`;
  }

  static info(message: string): void {
    console.info(this.formatMessage('INFO', message, this.colors.blue));
  }

  static success(message: string): void {
    console.log(this.formatMessage('OK', message, this.colors.green));
  }

  static warn(message: string): void {
    console.warn(this.formatMessage('WARN', message, this.colors.yellow));
  }

  static error(message: string): void {
    console.error(this.formatMessage('ERROR', message, this.colors.red));
  }

  static debug(message: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('DEBUG', message, this.colors.magenta));
    }
  }

  static server(message: string): void {
    console.log(
      this.formatMessage(
        'SERVER',
        message,
        this.colors.cyan + this.colors.bright,
      ),
    );
  }
}
