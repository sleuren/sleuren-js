export namespace Sleuren {
    export type BeforeEvaluate = (error: Error) => Error | false | Promise<Error | false>;

    export type BeforeSubmit = (report: ErrorReport) => ErrorReport | false | Promise<ErrorReport | false>;

    export type Config = {
        key: string;
        reportingUrl: string;
        maxGlowsPerReport: number;
        maxReportsPerMinute: number;
        stage?: string;
    };

    export type ErrorReport = {
        notifier: string;
        exception_class: string;
        seen_at: number;
        message: string;
        language: 'javascript';
        glows: Array<Sleuren.Glow>;
        context: Sleuren.Context;
        stacktrace: Array<Sleuren.StackFrame>;
        sourcemap_version_id: string;
        solutions: Array<Sleuren.Solution>;
        stage?: string;
    };

    export interface SolutionProviderExtraParameters {}

    export type SolutionProvider = {
        canSolve: (error: Error, extraParameters?: SolutionProviderExtraParameters) => boolean | Promise<boolean>;
        getSolutions: (
            error: Error,
            extraParameters?: SolutionProviderExtraParameters
        ) => Array<Sleuren.Solution> | Promise<Array<Sleuren.Solution>>;
    };

    export type Solution = {
        class: string;
        title: string;
        description: string;
        links: { [label: string]: string };
        action_description?: string;
        is_runnable?: boolean;
    };

    export type Context = {
        request?: {
            url?: String;
            useragent?: String;
            referrer?: String;
            readyState?: String;
        };
        request_data?: {
            queryString: { [key: string]: string };
        };
        cookies?: { [key: string]: string };
        [key: string]: any;
    };

    export type StackFrame = {
        line_number: number;
        column_number: number;
        method: string;
        file: string;
        code_snippet: { [key: number]: string };
        trimmed_column_number: number | null;
        class: string;
    };

    export type Glow = {
        time: number;
        microtime: number;
        name: String;
        message_level: MessageLevel;
        meta_data: Array<Object>;
    };

    export type MessageLevel = 'info' | 'debug' | 'warning' | 'error' | 'critical';
}
