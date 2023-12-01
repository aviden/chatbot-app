import * as winston from "winston";

class Logger {

    public log(message: string): void {
        console.log(message);
    };
}

export const logger = new Logger();