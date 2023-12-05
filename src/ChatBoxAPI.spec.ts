import { ChatBotAPI } from "./ChatBoxAPI";

const BOT_BASE_URL          = "https://code-challenge.us1.sandbox-rivaltech.io";
const MOCK_USER_ID          = 'd428f740-9f0c-42c6-aefc-6fb12fa66660';
const MOCK_CONVERSATION_ID  = 'aa66bdc5-41bb-4efd-aa57-f2cdb27edf69';

const fetchFn = jest.fn(
    (url: string, options: RequestInit) => Promise.resolve({
        ok: true,
        json: () => {
            const urlSegments = url.split('/');
            switch (urlSegments.pop()) {
                case 'challenge-register':
                    return Promise.resolve({ user_id: MOCK_USER_ID })
                case 'challenge-conversation':
                    return Promise.resolve({ conversation_id: MOCK_CONVERSATION_ID })
                default:
                    switch (urlSegments.pop()) {
                        case 'challenge-behaviour':
                            if (options['method'] === 'GET') {
                                return Promise.resolve({
                                    messages: [{
                                        text: 'ChatBot test message'
                                    }]
                                })
                            } if (options['method'] === 'POST') {
                                return Promise.resolve({ correct: true })
                            } else return Promise.reject();
                        default:
                            return Promise.reject()
                    }
            }
        }
    }), 
) as jest.Mock

let fetchMock: jest.SpyInstance;

beforeEach(() => {
    fetchMock = jest.spyOn(global, "fetch").mockImplementation(fetchFn)
})

afterEach(() => {
    jest.restoreAllMocks();
});

describe('ChatBotAPI.register()', () => {

    it('should call /challenge-register', async () => {
        const api = new ChatBotAPI();
        await api.register('John Doe', 'johndoe@test.com');
        expect(fetchMock).toHaveBeenCalledWith(BOT_BASE_URL + '/challenge-register', expect.objectContaining({
            "method": 'POST',
            "body": '{"name":"John Doe","email":"johndoe@test.com"}'
        }));
    });
})

describe('ChatBotAPI.beginConversation()', () => {
    
    it('should call /challenge-conversation', async () => {
        const api = new ChatBotAPI();
        await api.register('John Doe', 'johndoe@test.com');
        await api.beginConversation();
        expect(fetchMock).toHaveBeenCalledWith(BOT_BASE_URL + '/challenge-conversation', expect.objectContaining({
            "method": 'POST',
            "body": `{"user_id":"${MOCK_USER_ID}"}`
        }));
    });
})

describe('ChatBotAPI.readNewMessages()', () => {
    
    it('should call GET /challenge-behaviour', async () => {
        const api = new ChatBotAPI();
        await api.register('John Doe', 'johndoe@test.com');
        await api.beginConversation();
        await api.readNewMessages();
        expect(fetchMock).toHaveBeenCalledWith(BOT_BASE_URL + '/challenge-behaviour/' + MOCK_CONVERSATION_ID, expect.objectContaining({
            "method": 'GET'
        }));
    });
})

describe('ChatBotAPI.postResponse()', () => {
    
    it('should call POST /challenge-behaviour', async () => {
        const api = new ChatBotAPI();
        await api.register('John Doe', 'johndoe@test.com');
        await api.beginConversation();
        await api.postResponse("Test response content");
        expect(fetchMock).toHaveBeenCalledWith(BOT_BASE_URL + '/challenge-behaviour/' + MOCK_CONVERSATION_ID, expect.objectContaining({
            "method": 'POST',
            "body": '{"content":"Test response content"}'
        }));
    });
})
