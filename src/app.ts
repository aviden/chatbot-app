import { BotCompanion } from './BotCompanion';
import { DataQuestionHandlers } from './QuestionHandlers/DataQuestionHandlers';
import { logger } from './Logger';
import { MathQuestionHandlers } from './QuestionHandlers/MathQuestionHandlers';
import { WordQuestionHandlers } from './QuestionHandlers/WordQuestionHandlers';


await (async () => {

    try {
        logger.info(``);
        logger.info(`Rival ChatBot Companion`);
        logger.info(`by Denys Avilov (aviloff@gmail.com)`);
        logger.info(``);
        logger.info('Starting a new session');
        logger.info(``);

        // register initial question handler
        BotCompanion.registerQuestionHandler(/are you ready to begin\?/i, () => 'yes');

        WordQuestionHandlers.register();
        MathQuestionHandlers.register();
        const _ = new DataQuestionHandlers();
    
        const companion = new BotCompanion()
        await companion.beginConversation("Vasyl Pupkin", "vasyl.pupkin@fakemail.com");
        while (!companion.done) {
            await companion.talkToBot();
            logger.info('');
        }
    
        logger.info(``);
        logger.info(`Chat bot session finished successfully.`);
        logger.info(``);
    } catch (e) {
        if (e instanceof Error) {
            logger.logException(e);
        }
    }
})();
