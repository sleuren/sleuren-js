import SleurenClient from './SleurenClient';
import catchWindowErrors from './browserClient';
export { readLinesFromFile } from './stacktrace/fileReader';

export const sleuren = new SleurenClient();

if (typeof window !== 'undefined' && window) {
    window.sleuren = sleuren;
}

catchWindowErrors();
