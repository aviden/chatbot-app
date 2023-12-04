import { BotCompanion } from "./BotCompanion";


export class WordQuestionHandlers {

    constructor() {
        if (this instanceof WordQuestionHandlers) {
          throw Error(`${this.constructor.name}: this class is intended to be used as a static class only and cannot be instantiated.`);
        }
      }
    
    public static register() {
        BotCompanion.registerQuestionHandler(/Are you ready to continue to some word questions\?/i, WordQuestionHandlers.begin);        
        BotCompanion.registerQuestionHandler(/repeat only the words with an (even|odd|uneven) number of letters: (.*)\./, WordQuestionHandlers.countLetters);
        BotCompanion.registerQuestionHandler(/alphabetize the following words: (.*)\./, WordQuestionHandlers.alphabetize);
    }

    public static begin(): string {
        return 'yes';
    }

    public static countLetters([metric, text]: string[]): string {
        const ref = metric.toLowerCase() == 'even' ? 0 : 1;
        const words = text.split(',').map(s => s.trim());
        return words.filter(s => s.length % 2 == ref).join(', ');
    }

    public static alphabetize([text]: string[]): string {
        const words = text.split(',').map(s => s.trim());
        // sort ingnoring the letter case
        words.sort((s1: string, s2: string) => s1.toLowerCase().localeCompare(s2.toLowerCase()));
        return words.join(', ');
    }

}