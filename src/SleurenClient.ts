import { assert, now, flatJsonStringify } from './util';
import { collectContext } from './context';
import { createStackTrace } from './stacktrace';
import build from './build';
import getSolutions from './solutions';
import { Sleuren } from './types';

export default class SleurenClient {
    public config: Sleuren.Config = {
        key: '',
        reportingUrl: 'https://sleuren.com/api/log',
        maxGlowsPerReport: 30,
        maxReportsPerMinute: 500,
    };

    private glows: Array<Sleuren.Glow> = [];

    private context: Sleuren.Context = { context: {} };

    public beforeEvaluate: Sleuren.BeforeEvaluate = error => error;

    public beforeSubmit: Sleuren.BeforeSubmit = report => report;

    private reportedErrorsTimestamps: Array<number> = [];

    private solutionProviders: Array<Sleuren.SolutionProvider> = [];

    private sourcemapVersion: string = build.sourcemapVersion;

    public debug: boolean = false;

    public stage: string | undefined = undefined;

    public light(key: string = build.sleurenKey, debug = false): SleurenClient {
        this.debug = debug;

        if (
            !assert(
                key && typeof key === 'string',
                'An empty or incorrect Sleuren key was passed, errors will not be reported.',
                this.debug
            ) ||
            !assert(
                Promise,
                'ES6 promises are not supported in this environment, errors will not be reported.',
                this.debug
            )
        ) {
            return this;
        }

        this.config.key = key;

        return this;
    }

    public glow(name: string, level: Sleuren.MessageLevel = 'info', metaData: Array<object> = []): SleurenClient {
        const time = now();

        this.glows.push({
            name,
            message_level: level,
            meta_data: metaData,
            time,
            microtime: time,
        });

        if (this.glows.length > this.config.maxGlowsPerReport) {
            this.glows = this.glows.slice(this.glows.length - this.config.maxGlowsPerReport);
        }

        return this;
    }

    public addContext(name: string, value: any): SleurenClient {
        this.context.context[name] = value;

        return this;
    }

    public addContextGroup(groupName: string, value: object): SleurenClient {
        this.context[groupName] = value;

        return this;
    }

    public registerSolutionProvider(provider: Sleuren.SolutionProvider): SleurenClient {
        if (
            !assert(
                'canSolve' in provider,
                'A solution provider without a [canSolve] property was added.',
                this.debug
            ) ||
            !assert(
                'getSolutions' in provider,
                'A solution provider without a [getSolutions] property was added.',
                this.debug
            )
        ) {
            return this;
        }

        this.solutionProviders.push(provider);

        return this;
    }

    public reportMessage(message: string, context: Sleuren.Context = {}, exceptionClass: string = 'Log'): void {
        const seenAt = now();

        createStackTrace(Error()).then(stacktrace => {
            // The first item in the stacktrace is from this file, and irrelevant
            stacktrace.shift();

            const report: Sleuren.ErrorReport = {
                notifier: `Sleuren JavaScript client v${build.clientVersion}`,
                exception_class: exceptionClass,
                seen_at: seenAt,
                message: message,
                language: 'javascript',
                glows: this.glows,
                context: collectContext({ ...context, ...this.context }),
                stacktrace,
                sourcemap_version_id: this.sourcemapVersion,
                solutions: [],
                stage: this.stage,
            };

            this.sendReport(report);
        });
    }

    public report(
        error: Error,
        context: Sleuren.Context = {},
        extraSolutionParameters: Sleuren.SolutionProviderExtraParameters = {}
    ): void {
        Promise.resolve(this.beforeEvaluate(error)).then(reportReadyForEvaluation => {
            if (!reportReadyForEvaluation) {
                return;
            }

            this.createReport(error, context, extraSolutionParameters).then(report =>
                report ? this.sendReport(report) : {}
            );
        });
    }

    public createReport(
        error: Error,
        context: Sleuren.Context = {},
        extraSolutionParameters: Sleuren.SolutionProviderExtraParameters = {}
    ): Promise<Sleuren.ErrorReport | false> {
        if (!assert(error, 'No error provided.', this.debug)) {
            return Promise.resolve(false);
        }

        const seenAt = now();

        return Promise.all([
            getSolutions(this.solutionProviders, error, extraSolutionParameters),
            createStackTrace(error),
        ]).then(result => {
            const [solutions, stacktrace] = result;

            assert(stacktrace.length, "Couldn't generate stacktrace of this error: " + error, this.debug);

            return {
                notifier: `Sleuren JavaScript client v${build.clientVersion}`,
                exception_class: error.constructor && error.constructor.name ? error.constructor.name : 'undefined',
                seen_at: seenAt,
                message: error.message,
                language: 'javascript',
                glows: this.glows,
                context: collectContext({ ...context, ...this.context }),
                stacktrace,
                sourcemap_version_id: this.sourcemapVersion,
                solutions,
                stage: this.stage,
            };
        });
    }

    private sendReport(report: Sleuren.ErrorReport): void {
        if (
            !assert(
                this.config.key,
                'The client was not yet initialised with an API key. ' +
                    "Run client.light('<project-key>') when you initialise your app. " +
                    "If you are running in dev mode and didn't run the light command on purpose, you can ignore this error.",
                this.debug
            )
        ) {
            return;
        }

        if (this.maxReportsPerMinuteReached()) {
            return;
        }

        Promise.resolve(this.beforeSubmit(report)).then(reportReadyForSubmit => {
            if (!reportReadyForSubmit) {
                return;
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.config.reportingUrl);

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('User-Agent', 'Sleuren-Package');

            xhr.send(flatJsonStringify({ ...reportReadyForSubmit, project: this.config.key }));

            this.reportedErrorsTimestamps.push(Date.now());
        });
    }

    private maxReportsPerMinuteReached(): boolean {
        if (this.reportedErrorsTimestamps.length >= this.config.maxReportsPerMinute) {
            const nErrorsBack = this.reportedErrorsTimestamps[
                this.reportedErrorsTimestamps.length - this.config.maxReportsPerMinute
            ];

            if (nErrorsBack > Date.now() - 60 * 1000) {
                return true;
            }
        }

        return false;
    }

    public test(): SleurenClient {
        this.report(new Error('The Sleuren client is set up correctly!'));

        return this;
    }
}
