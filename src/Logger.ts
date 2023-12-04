import * as winston from "winston";
import { format } from "logform";
import { getCallStack, getRelativeFileName } from "./utils";

const timestampFilenameAndLevelFormat = format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} [${info[0]}] ${info.level}: ${info.message}`),
)

class Logger {

    logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: timestampFilenameAndLevelFormat,
            transports: [
                new winston.transports.Console({ level: 'info', format: format.printf(info => info.message) }),
                new winston.transports.File({ filename: 'chatbot-app.log', level: 'info' }),
                new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
            ]
        });
    }

    private getCallerFileName(): string {
        // inspired by https://stackoverflow.com/a/19788257/2183692
        const callStack = getCallStack();
        if (!callStack.length)
            return "";
        let callerInfo = "";
        const currentFile = callStack.shift()!.getFileName() || "";

        while (callStack.length) {
            const callerFile = callStack.shift()!.getFileName() || "";
            if (currentFile !== callerFile) {
                callerInfo = getRelativeFileName(callerFile);
                break;
            }
        }
        return callerInfo || "";
    }
      
    public info(message: string): void {
        this.logger.info(message, [this.getCallerFileName()]);
    }

    public debug(message: string): void {
        this.logger.debug(message, [this.getCallerFileName()]);
    }

    public error(message: string): void {
        this.logger.error(message, [this.getCallerFileName()]);
    }

    public logException(e: Error): void {
        this.error(e.stack || e.message)
    }
}

export const logger = new Logger();