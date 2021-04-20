import type { Context } from 'aws-lambda';

export class Logger {
  logFormat: string;

  constructor(apiRequestId: string) {
    this.logFormat = `{ "apiRequestId": "${apiRequestId}", "message": "%s" }`;
  }

  public debug(msg: string): void {
    console.debug(this.logFormat, msg);
  }

  public info(msg: string): void {
    console.info(this.logFormat, msg);
  }

  public warn(msg: string): void {
    console.warn(this.logFormat, msg);
  }

  public error(msg: string): void {
    console.error(this.logFormat, msg);
  }
}

export const createLogger = (context: Context): Logger => {
  const lambdaRequestId: string = context.awsRequestId;
  return new Logger(lambdaRequestId);
};
