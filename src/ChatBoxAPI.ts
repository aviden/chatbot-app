import { logger } from "./Logger";
import Ajv, { JSONSchemaType } from "ajv";

const BASE_URL                      = "https://code-challenge.us1.sandbox-rivaltech.io";
const CHALLENGE_REGISTER_URL        = "challenge-register";
const CHALLENGE_CONVERSATION_URL    = 'challenge-conversation'
const CHALLENGE_BEHAVIOUR_URL       = 'challenge-behaviour';

interface ChallengeRegisterResponse {
    user_id: string;
}

const ChallengeRegisterSchema: JSONSchemaType<ChallengeRegisterResponse> = {
    type: "object",
    properties: {
        "user_id": { type: "string" }
    },
    required: ["user_id"]
}

interface ChallengeConversationResponse {
    conversation_id: string;
}

const ChallengeConversationSchema: JSONSchemaType<ChallengeConversationResponse> = {
    type: "object",
    properties: {
        conversation_id: { type: "string" }
    },
    required: ["conversation_id"]
}

interface GetChallengeBehaviorResponse {
    messages: {
        text: string
    }[]
}

const GetChallengeBehaviorSchema: JSONSchemaType<GetChallengeBehaviorResponse> = {
    type: "object",
    properties: {
        messages: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    text: {
                        type: "string"
                    }
                },
                required: ["text"],
                additionalProperties: false
            }
        }
    },
    required: ["messages"]
}

interface PostChallengeBehaviorResponse {
    correct: boolean;
}

const PostChallengeBehaviorSchema: JSONSchemaType<PostChallengeBehaviorResponse> = {
    type: "object",
    properties: {
        correct: { type: "boolean" }
    },
    required: ["correct"]
}

export class ChatBotAPI {
    
    private user_id: string = "";
    private conversation_id: string = "";
    private ajv = new Ajv();

    constructor() {}

    private url(url: string): string {
        return `${BASE_URL}/${url}`;
    }

    private async callApi<T>(url: string, method: "GET" | "POST", data?: object, schema?: JSONSchemaType<T>): Promise<T> {
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
            if (schema && !this.ajv.validate(schema, responseData)) {
                throw new Error(`${this.callApi.name}: invalid API response format.`);
            }
            return Promise.resolve(responseData as T);
        } else {
            const msg = `Error calling '${url}' API: ${response.status} - ${response.statusText}`;
            logger.error(msg);
            return Promise.reject(msg);
        }
    }
    
    public async register(name: string, email: string) {
        const { user_id } = await this.callApi<ChallengeRegisterResponse>(CHALLENGE_REGISTER_URL, "POST", {
            name: name,
            email: email
        }, ChallengeRegisterSchema);
        this.user_id = user_id;
        logger.info(`Successfully registered with the chatbot, user_id = ${user_id}`)
    }

    public async beginConversation() {
        const { conversation_id } = await this.callApi<ChallengeConversationResponse>(CHALLENGE_CONVERSATION_URL, "POST", {
            user_id: this.user_id
        }, ChallengeConversationSchema);
        this.conversation_id = conversation_id;
        logger.info(`Conversation started, conversation_id = ${conversation_id}`)
    }

    public async readNewMessages(): Promise<string[]> {
        logger.debug(`Reading messages from the bot...`);
        const { messages } = await this.callApi<GetChallengeBehaviorResponse>(
            `${CHALLENGE_BEHAVIOUR_URL}/${this.conversation_id}`, "GET", undefined, GetChallengeBehaviorSchema);
        const result = messages.map(item => item.text);
        logger.info(`Received messages from the bot:`);
        result.forEach(s => logger.info(`    - ${s}`));
        return result;
    }

    public async postResponse(reponse: string): Promise<boolean> {
        logger.info(`Sending a response: ${reponse}`);
        const { correct } = await this.callApi(`${CHALLENGE_BEHAVIOUR_URL}/${this.conversation_id}`, "POST", {
            content: reponse
        }, PostChallengeBehaviorSchema);
        if (correct) {
            logger.debug(`correct!`)
        } else {
            logger.error(`wrong answer!`)
        }
        return correct;
    }
}