import { ChatBotAPI } from "./ChatBoxAPI";
import { logger } from "./Logger";
import { arr2str } from "./utils";


export type QuestionHandler = (args: string[]) => string;

type HandlerInfo = {
    selector: RegExp,
    handler: QuestionHandler,
    this_?: object
};

export class UnknownQuestionError extends Error { }

export class BotCompanion {

    private static handlers: HandlerInfo[] = [];

    public static registerQuestionHandler(selector: RegExp, handler: QuestionHandler, this_?: object) {
        this.handlers.push({ selector, handler, this_ });
    }

    private _done = false;
    public get done() {
        return this._done;
    }

    private bot: ChatBotAPI;

    constructor() {
        this.bot = new ChatBotAPI();
    }

    public async beginConversation(name: string, email: string) {
        await this.bot.register(name, email);
        await this.bot.beginConversation();
    }

    public async talkToBot() {
        const messages = await this.bot.readNewMessages();

        if (messages.join(' ').toLowerCase().indexOf('thank you') >= 0) {
            this._done = true;
            return;
        }

        const { handler, args, this_ } = this.findHandler(messages);
        const response = handler.call(this_, args);
        const correct = await this.bot.postResponse(response);
        if (!correct) {
            const errorMessage = `The bot indicated the last response as incorrect! Please review the logs and make changes to the code if necessary.`;
            logger.error(errorMessage);
            throw Error(errorMessage);
        }
    }

    private findHandler(messages: string[]): {
        handler: QuestionHandler,
        args: string[]
        this_?: object
    } {
        const message = messages.join('\r\n');
        let handlerArgs: string[];
        logger.debug(`Looking for a handler for the following question(s): ${arr2str(messages)}`)
        const handlerInfo = BotCompanion.handlers.find(entry => {
            const _res = entry.selector.exec(message);
            if (_res) {
                handlerArgs = _res.slice(1);
                logger.debug(`Found a handler: ${entry.handler.name || '<anonymous>'}, args: ${arr2str(handlerArgs)}`);
            }
            return !!_res;
        });
        return handlerInfo ?
            {
                handler: handlerInfo.handler,
                args: handlerArgs!,
                this_: handlerInfo.this_
            } : {
                handler: this.defaultHandler,
                args: messages,
                this_: this
            };
    }

    private defaultHandler(messages: string[]): string {
        // Here would be a good place to add a heuristic logic for answering unknown questions, for ex., using some kind of Machine Learning.
        // For ex., we could redirect our questions to CharGPT's API or some other or even implement our own language model.
        // But all that seems to be out of the scope and cannot be done within the assignment's timeframe.
        throw new UnknownQuestionError(`An unknown question encountered: "${messages.join('\r\n')}". Sorry, I don't know how to answer it ¯\\_(ツ)_/¯`);
    }

}