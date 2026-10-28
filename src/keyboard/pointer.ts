import { lerp } from "../utility/utility"

export function calculateVelocity(y: number, top: number, height: number) {
    const maxVelocity = 127;
    const minVelocity = 1;

    if (height === 0) {
        return minVelocity;
    }

    const fraction = (y - top) / height;
    return Math.round(lerp(fraction, minVelocity, maxVelocity));
}
