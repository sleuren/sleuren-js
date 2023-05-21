import cookie from './cookie';
import request from './request';
import requestData from './requestData';
import { Sleuren } from '../types';

export function collectContext(additionalContext: object): Sleuren.Context {
    return {
        ...cookie(),
        ...request(),
        ...requestData(),
        ...additionalContext,
    };
}
