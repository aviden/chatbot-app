import { BotCompanion } from "../BotCompanion";


export class MathQuestionHandlers {

    constructor() {
        if (this instanceof MathQuestionHandlers) {
          throw Error(`${this.constructor.name}: this class is intended to be used as a static class only and cannot be instantiated.`);
        }
      }
    
    public static register() {
        BotCompanion.registerQuestionHandler(/What is the (sum|product|largest|smallest|average) of the following numbers: (.*)\?/i, MathQuestionHandlers.getXOfNumbers);
    }

    public static getXOfNumbers([metric, numbersAsText]: string[]): string {
        const numbers = numbersAsText.split(',').map(s => parseFloat(s.trim()));
        switch (metric.toLowerCase()) {
            case 'sum':
                return numbers.reduce((prev: number, curr: number) => prev + curr, 0).toString();
            case 'product':
                return numbers.reduce((prev: number, curr: number) => prev * curr, 1).toString();
            case 'largest':
                return Math.max(...numbers).toString();
            case 'smallest':
                return Math.min(...numbers).toString();
            case 'average':
                const sum = numbers.reduce((prev: number, curr: number) => prev + curr, 0);
                return (sum / numbers.length).toString();
            default:
                throw Error(`${this.name}: invalid metric: '${metric}'`);
        }
    }


}