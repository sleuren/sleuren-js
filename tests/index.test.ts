// @ts-nocheck

import { sleuren } from '../src/index';

beforeAll(() => {});

it('properly lights', done => {
    const projectKey = 'aprojectkey';

    sleuren.light(projectKey);

    expect(sleuren.config.key).toBe(projectKey);

    done();
});

it('can create glows', done => {
    sleuren.glow('glowName', undefined, undefined);

    expect(sleuren.glows.length).toBe(1);

    expect(sleuren.glows[0]).toMatchObject({
        name: 'glowName',
        message_level: 'info',
        meta_data: [],
    });

    expect(typeof sleuren.glows[0].microtime).toBe('number');
    expect(typeof sleuren.glows[0].time).toBe('number');

    done();
});

it.todo('can register solution providers');

it.todo('can use solution providers properly');

it.todo('can use async solution providers properly');

it.todo('can build an error report from an error');

it.todo('can create custom context and context groups');

it.todo('can throttle when too many reports are being sent');

it.todo('can stop a report from being submitted by using beforeSubmit');

it.todo('can use an async beforeSubmit');

it.todo('can edit a report using beforeSubmit and still send it');

it.todo('can stop an error from being evaluated by using beforeEvaluate');

it.todo('can use an async beforeEvaluate');

it.todo('can check out an error using beforeEvaluate and still send it');
