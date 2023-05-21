declare const SLEUREN_KEY: string | undefined;
declare const JS_CLIENT_VERSION: string | undefined;
declare const SOURCEMAP_VERSION: string | undefined;

export default {
    sleurenKey: typeof SLEUREN_KEY === 'undefined' ? '' : SLEUREN_KEY,
    clientVersion: typeof JS_CLIENT_VERSION === 'undefined' ? '?' : JS_CLIENT_VERSION,
    sourcemapVersion: typeof SOURCEMAP_VERSION === 'undefined' ? '' : SOURCEMAP_VERSION,
};
