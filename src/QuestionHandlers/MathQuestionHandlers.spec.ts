import { MathQuestionHandlers } from './MathQuestionHandlers';

describe(MathQuestionHandlers.getXOfNumbers, () => {
    test('sum', () => {
        expect(MathQuestionHandlers.getXOfNumbers(['sum', '15, 19, -6, 2.5'])).toEqual('30.5');
    })

    test('product', () => {
        expect(MathQuestionHandlers.getXOfNumbers(['product', '4, 7, -2, -1'])).toEqual('56');
    })

    test('largest', () => {
        expect(MathQuestionHandlers.getXOfNumbers(['largest', '9, 402.9, 97, -251'])).toEqual('402.9');
    })

    test('smallest', () => {
        expect(MathQuestionHandlers.getXOfNumbers(['smallest', '9, 402.9, 97, -251'])).toEqual('-251');
    })

    test('average', () => {
        expect(MathQuestionHandlers.getXOfNumbers(['average', '7, 12, 36, 90'])).toEqual('36.25');
    })
});