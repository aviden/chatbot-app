import { WordQuestionHandlers } from './WordQuestionHandlers';

describe(WordQuestionHandlers.countLetters, () => {
    test('even', () => {
        expect(WordQuestionHandlers.countLetters(['even', 'foo, to, stack, heap, counter, letter, click, dominion'])).toEqual('to, heap, letter, dominion');
    })

    test('odd', () => {
        expect(WordQuestionHandlers.countLetters(['odd', 'foo, to, stack, heap, counter, letter, click, dominion'])).toEqual('foo, stack, counter, click');
    })
});

describe(WordQuestionHandlers.alphabetize, () => {
    test('lowercase only', () => {
        expect(WordQuestionHandlers.alphabetize(['steam,alpha, gender, zoo,pond, duck'])).toEqual('alpha, duck, gender, pond, steam, zoo');
    })

    test('mixed case', () => {
        expect(WordQuestionHandlers.alphabetize(['corner, First, money, Aisle, zorb, Kraken'])).toEqual('Aisle, corner, First, Kraken, money, zorb');
    })
});