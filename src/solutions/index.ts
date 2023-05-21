import { flattenOnce } from '../util';
import { Sleuren } from '../types';

export default function getSolutions(
    solutionProviders: Array<Sleuren.SolutionProvider>,
    error: Error,
    extraSolutionParameters: Sleuren.SolutionProviderExtraParameters = {}
): Promise<Array<Sleuren.Solution>> {
    return new Promise(resolve => {
        const canSolves = solutionProviders.reduce(
            (canSolves, provider) => {
                canSolves.push(Promise.resolve(provider.canSolve(error, extraSolutionParameters)));

                return canSolves;
            },
            [] as Array<Promise<boolean>>
        );

        Promise.all(canSolves).then(resolvedCanSolves => {
            const solutionPromises: Array<Promise<Array<Sleuren.Solution>>> = [];

            resolvedCanSolves.forEach((canSolve, i) => {
                if (canSolve) {
                    solutionPromises.push(
                        Promise.resolve(solutionProviders[i].getSolutions(error, extraSolutionParameters))
                    );
                }
            });

            Promise.all(solutionPromises).then(solutions => {
                resolve(flattenOnce(solutions));
            });
        });
    });
}
