import chalk from "chalk";

type LogLevel = "info" | "error" | "warn" | "success" | "debug";

interface LogOptions {
  prefix?: string;
  timestamp?: boolean;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = options?.timestamp !== false ? `[${this.formatTimestamp()}]` : "";
    const prefix = options?.prefix ? `[${options.prefix}]` : "";

    const levelLabels = {
      info: chalk.blue.bold("INFO"),
      error: chalk.red.bold("ERROR"),
      warn: chalk.yellow.bold("WARN"),
      success: chalk.green.bold("SUCCESS"),
      debug: chalk.gray.bold("DEBUG"),
    };

    const parts = [timestamp, levelLabels[level], prefix, message].filter(Boolean);
    return parts.join(" ");
  }

  info(message: string, options?: LogOptions): void {
    console.log(this.formatMessage("info", message, options));
  }

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = error ? `${message} - ${errorMessage}` : message;
    console.error(this.formatMessage("error", fullMessage, options));

    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack));
    }
  }

  warn(message: string, options?: LogOptions): void {
    console.warn(this.formatMessage("warn", message, options));
  }

  success(message: string, options?: LogOptions): void {
    console.log(this.formatMessage("success", message, options));
  }

  debug(message: string, options?: LogOptions): void {
    if (process.env.NODE_ENV === "development") {
      console.log(this.formatMessage("debug", message, options));
    }
  }

  // HTTP request logging
  http(method: string, path: string, status: number, duration?: number): void {
    const methodColor =
      method === "GET"
        ? chalk.blue
        : method === "POST"
          ? chalk.green
          : method === "PATCH"
            ? chalk.yellow
            : method === "DELETE"
              ? chalk.red
              : chalk.white;

    const statusColor =
      status >= 500
        ? chalk.red
        : status >= 400
          ? chalk.yellow
          : status >= 300
            ? chalk.cyan
            : chalk.green;

    const methodStr = methodColor(method.padEnd(6));
    const statusStr = statusColor(status.toString());
    const durationStr = duration ? chalk.gray(`(${duration}ms)`) : "";
    const timestamp = chalk.gray(`[${this.formatTimestamp()}]`);

    console.log(`${timestamp} ${methodStr} ${chalk.white(path)} ${statusStr} ${durationStr}`);
  }

  // API error logging with context
  apiError(method: string, path: string, status: number, error: Error | string): void {
    const methodColor =
      method === "GET" ? chalk.blue : method === "POST" ? chalk.green : chalk.yellow;
    const errorMessage = error instanceof Error ? error.message : error;

    console.error(
      `${chalk.red.bold("✗")} ${methodColor(method)} ${chalk.white(path)} ${chalk.red(`[${status}]`)} ${chalk.red(errorMessage)}`,
    );

    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack));
    }
  }
}

export const logger = new Logger();
