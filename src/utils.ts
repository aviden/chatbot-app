
/**
 * Returns the current call stack
 */
export function getCallStack(): NodeJS.CallSite[] {
    // see https://v8.dev/docs/stack-trace-api#customizing-stack-traces
    const _pst = Error.prepareStackTrace
    Error.prepareStackTrace = (_, stack) => stack;
    try {
        const error = new Error();
        return (<NodeJS.CallSite[]><unknown>error.stack).slice(1);  // do not include this function in the call stack
    } finally {
        Error.prepareStackTrace = _pst;
    }
}

/**
 * Given the absolute path and file name of a project's module, returns its name relative to the project source directory.
 * @param absoluteFileName An absolute file name of a project's module
 * @returns A file name relative to the project source dir (or the unchanged absoluteFileName, if the file is not located inside the source directory)
 */
export function getRelativeFileName(absoluteFileName: string): string {
    const SRC_DIR = '/src/';
    const idx = absoluteFileName.lastIndexOf(SRC_DIR);
    return idx ? absoluteFileName.slice(idx + SRC_DIR.length) : absoluteFileName;
}