import * as winston from "winston";
import { format } from "logform";
import { getCallStack, getRelativeFileName } from "./utils";

const timestampAndLevelFormat = format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level} ${info.message}`),
    //winston.format.json()
)
const timestampFilenameAndLevelFormat = format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} [${info[0]}] ${info.level}: ${info.message}`),
    //winston.format.json()
)

class Logger {

    logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: timestampFilenameAndLevelFormat,
            transports: [
                new winston.transports.File({ filename: 'chatbot-app.log' }),
                new winston.transports.File({ filename: 'error.log', level: 'error' })
            ]
        });
    }

    private getCallerFileName(): string {
        // inspired by https://stackoverflow.com/a/19788257/2183692
        const callStack = getCallStack();
        if (!callStack.length)
            return "";
        let callerInfo = "";
        let currentFile = callStack.shift()!.getFileName() || "";

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
    };

    public error(message: string): void {
        this.logger.error(message);
    }
}

export const logger = new Logger();