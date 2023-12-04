import { logger } from "./Logger";

const BASE_URL                      = "https://code-challenge.us1.sandbox-rivaltech.io";
const CHALLENGE_REGISTER_URL        = "challenge-register";
const CHALLENGE_CONVERSATION_URL    = 'challenge-conversation'
const CHALLENGE_BEHAVIOUR_URL       = 'challenge-behaviour';

export class ChatBotAPI {
    
    private user_id: string = "";
    private conversation_id: string = "";

    constructor() {}

    private url(url: string): string {
        return `${BASE_URL}/${url}`;
    }

    private async callApi(url: string, method: "GET" | "POST", data?: object):
        Promise<any>    /* eslint-disable-line @typescript-eslint/no-explicit-any */
    {
        const requestParams: RequestInit = {
            method: method,
            headers: {
                'content-type': 'application/json',
            }
        };
        if (data) {
            requestParams.body = JSON.stringify(data);
        }
        logger.debug(`FETCH '${this.url(url)}', ${JSON.stringify(requestParams, null, 4)}`);
        const response = await fetch(this.url(url), requestParams);
        if (response.ok) {
            logger.debug(`FETCH status: ${response.status} - ${response.statusText}`);
            const responseData = await response.json();
            logger.debug(`FETCH response: ${JSON.stringify(responseData)}`);
            return Promise.resolve(responseData);
        } else {
            const msg = `Error calling '${url}' API: ${response.status} - ${response.statusText}`;
            logger.error(msg);
            return Promise.reject(msg);
        }
    }
    
    public async register(name: string, email: string) {
        const { user_id } = await this.callApi(CHALLENGE_REGISTER_URL, "POST", {
            name: name,
            email: email
        });
        this.user_id = user_id;
        logger.info(`Successfully registered with the chatbot, user_id = ${user_id}`)
    }

    public async beginConversation() {
        const { conversation_id } = await this.callApi(CHALLENGE_CONVERSATION_URL, "POST", {
            user_id: this.user_id
        });
        this.conversation_id = conversation_id;
        logger.info(`Conversation started, conversation_id = ${conversation_id}`)
    }

    public async readNewMessages(): Promise<string[]> {
        logger.debug(`Reading messages from the bot...`);
        const response = await this.callApi(`${CHALLENGE_BEHAVIOUR_URL}/${this.conversation_id}`, "GET");
        if (!Object.hasOwn(response, "messages")) {
            throw new Error("Unknown response format");
        }
        const messages = response["messages"];
        if (!Array.isArray(messages)) {
            throw new Error("Unknown response format");
        }
        const result = messages.map(item => {
            if (!Object.hasOwn(item, "text")) {
                throw new Error("Unknown response format");
            }
            return String(item["text"]);
        });
        logger.info(`Received messages from the bot:`);
        result.forEach(s => logger.info(`    - ${s}`));
        return result;
    }

    public async postResponse(reponse: string): Promise<boolean> {
        logger.info(`Sending a response: ${reponse}`);
        const response = await this.callApi(`${CHALLENGE_BEHAVIOUR_URL}/${this.conversation_id}`, "POST", {
            content: reponse
        });
        if (!Object.hasOwn(response, "correct")) {
            throw new Error("Unknown response format");
        }
        const correct = Boolean(response["correct"]);
        if (correct) {
            logger.debug(`correct!`)
        } else {
            logger.error(`wrong answer!`)
        }
        return correct;
    }
}