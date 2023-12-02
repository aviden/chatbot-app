import { getCallStack, getRelativeFileName } from "./utils";

describe(getCallStack, () => { 
    test('Check that callstack is not empty', () => {
        expect(getCallStack().length).toBeGreaterThan(0);
    })

    test('The topmost stack frame should return the current file name', () => {
        expect(getCallStack()[0].getFileName()).toEqual(__filename);
    })
})

describe(getRelativeFileName, () => {

    test('file directly in the src/ dir', () => {
        expect(getRelativeFileName('/users/projects/ts/chatbot-app/src/file.ts')).toEqual('file.ts');
    })

    test('file in a nested dir', () => {
        expect(getRelativeFileName('/users/projects/ts/chatbot-app/src/workflows/feature/class.ts')).toEqual('workflows/feature/class.ts');
    })

    test('file outside of src', () => {
        const samplePath = '/users/projects/ts/chatbot-app/package.json';
        expect(getRelativeFileName(samplePath)).toEqual(samplePath);
    })

    test('path with multiple src dirs', () => {
        expect(getRelativeFileName('/users/projects/src/favorites/chatbot-app/src/app.ts')).toEqual('app.ts');
    })
});