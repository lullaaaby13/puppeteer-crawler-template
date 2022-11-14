export interface IterationResult2<T> {
    data?: T;
    error?: Error;
}

export class IterationResult<T> {

    private readonly values: T[] = [];

    constructor(values: T[]) {
        this.values.concat(values);
    }

    add(value: T) {
        this.values.push(value);
    }

    addAll(other: T[]): IterationResult<T> {
        return new IterationResult([this.values, other].flat());
    }

    mergeAll(others: IterationResult<T>[]): IterationResult<T> {
        if (others.length === 0) return;
        const merged = [];
        [this, ...others]
            .map(({ values }) => values)
            .forEach(it => merged.push(it));
        return new IterationResult(merged);
    }

    concat(other: IterationResult<T>): void {
        if (other) {
            this.values.concat(other.values);
        }
    }

    concatAll(others: IterationResult<T>[]): void {
        if (!others || others.length === 0) return;
        others
            .filter(it => it.values.length > 0)
            .map(({ values }) => values)
            .forEach(it => this.values.concat(it));
    }

    value(): T[] {
        return this.values;
    }
}