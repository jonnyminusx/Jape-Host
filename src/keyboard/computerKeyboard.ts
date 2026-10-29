const kOffsets: Map<string, number> = new Map([
    ['a', 0],
    ['w', 1],
    ['s', 2],
    ['e', 3],
    ['d', 4],
    ['f', 5],
    ['t', 6],
    ['g', 7],
    ['y', 8],
    ['h', 9],
    ['u', 10],
    ['j', 11],
    ['k', 12]
]);

export function keyToNote(key: string, firstNote: number, lastNote: number): number | undefined {
    const offset = kOffsets.get(key.toLowerCase());

    if (offset === undefined || offset > (lastNote - firstNote)) {
        return undefined;
    }

    return firstNote + offset;
}
