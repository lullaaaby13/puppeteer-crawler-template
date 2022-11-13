import * as delay from 'delay';

export async function sleep(second: number) {
    await delay(1000 * second);
}