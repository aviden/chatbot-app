import { BotCompanion } from './BotCompanion';

const QUESTIONS = [
    {
        q: 'Are you ready?',
        a: 'yes'
    }, {
        q: 'The ultimate question of life the universe and everything',
        a: '42'
    }, {
        q: 'thank you'
    }
];

let questionNo = -1;

jest.mock('./ChatBoxAPI', () => ({
    __esModule: true,
    ChatBotAPI: jest.fn(() => ({
        register: () => Promise.resolve(),
        beginConversation: () => Promise.resolve(),
        readNewMessages: () => {
            questionNo = Math.min(questionNo + 1, QUESTIONS.length - 1);
            return Promise.resolve([QUESTIONS[questionNo].q]);
        },
        postResponse: (response: string) => Promise.resolve(QUESTIONS[questionNo].a === response)
    }))
}));

const questionHandler1 = jest.fn(() => 'yes');
const questionHandler2 = jest.fn(() => '42');

BotCompanion.registerQuestionHandler(/are you ready/i, questionHandler1);
BotCompanion.registerQuestionHandler(/ultimate question/i, questionHandler2);

beforeEach(() => {
    questionNo = -1;
})

afterEach(() => {
    jest.clearAllMocks();
})

describe('BotCompanion', () => { 
    test('one iteration', async () => {
        const comp = new BotCompanion();
        await comp.beginConversation("name", "email");
        expect(!comp.done);
        await comp.talkToBot()
        expect(!comp.done);
        expect(questionHandler1).toHaveBeenCalledTimes(1);
        expect(questionHandler2).toHaveBeenCalledTimes(0);
    })

    test('two iterations', async () => {
        const comp = new BotCompanion();
        await comp.beginConversation("name", "email");
        expect(!comp.done);
        await comp.talkToBot()
        expect(!comp.done);
        await comp.talkToBot()
        expect(comp.done);
        expect(questionHandler1).toHaveBeenCalledTimes(1);
        expect(questionHandler2).toHaveBeenCalledTimes(1);
    })
})
