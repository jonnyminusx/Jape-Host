export function clamp(x: number, min: number, max: number) {
    return Math.max(min, Math.min(x, max));
}

export function lerp(t: number, start: number, stop: number) {
    t = clamp(t, 0, 1);
    return start + (stop - start) * t;
}
