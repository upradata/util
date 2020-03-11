import { assignRecursive, assignRecursiveArray, assignDefaultOption } from '../src/assign';
import { PlainObj } from '../src/type';

describe('Test Suite AssignRecursive', () => {
    let o1 = undefined;
    let o2 = undefined;
    let o = undefined;

    let expectedMerge = undefined;

    beforeEach(() => {
        o1 = { a: 1, b: 2, c: { c11: 11, c12: 12, c13: { c21: 21, c22: 22 } }, d: 3 };
        o2 = { b: 3, c: { c11: 50, c13: { c22: 100 } } };
        o = { b: 2, c: 3, d: 4, e: 5 };

        expectedMerge = { a: 1, b: 3, c: { c11: 50, c12: 12, c13: { c21: 21, c22: 100, }, }, d: 3, e: 5 };
    });

    it('merge and last object should be the same', () => {
        const merge = assignRecursiveArray(o, [ o1, o2 ]);
        expect(merge).toBe(o);
    });


    it('should merge objects', () => {
        const merge = assignRecursiveArray(o, [ o1, o2 ]);
        expect(merge).toEqual(expectedMerge);
    });

    it('should merge only ownProperties', () => {
        const oo1 = Object.create(o1);
        oo1.alpha = 3;
        oo1.b = 'b';

        const oo2 = Object.create(o2);
        oo1.beta = 4;
        oo1.c = { c11: 'c11', c12: 'c12' };

        const merge = assignRecursiveArray(o, [ oo1, oo2 ], { assignMode: 'of' });
        const mergeExpected = { alpha: 3, b: 'b', beta: 4, c: { c11: 'c11', c12: 'c12', }, d: 4, e: 5, };

        expect(merge).toEqual(mergeExpected);
    });

    it('should merge all properties in the prototype chain', () => {
        const oo1 = Object.create(o1);
        oo1.alpha = 3;
        oo1.b = 'b';

        const oo2 = Object.create(o2);
        oo1.beta = 4;
        oo1.c = { c11: 'c11', c12: 'c12' };

        const merge = assignRecursiveArray(o, [ oo1, oo2 ], { assignMode: 'in' });
        const mergeExpected = { a: 1, b: 3, c: { c11: 50, c12: 'c12', c13: { c22: 100 } }, d: 3, e: 5, alpha: 3, beta: 4 };

        expect(merge).toEqual(mergeExpected);
    });

    it('should merge arrays', () => {
        const o = { a: 1, b: [ 1, 2, 3, 4 ], c: { c1: [ 4, 5 ] } };
        const o1 = { b: [ 51, 52 ], d: { d1: [ 21, 22, 23, 24 ] } };
        const o2 = { a: 1, c: { c1: [ 10 ] }, d: { d1: [ 220, 221 ] } };

        const merge = assignRecursiveArray(o, [ o1, o2 ], { arrayMode: 'merge' });
        const mergeExpected = { a: 1, b: [ 51, 52, 3, 4 ], c: { c1: [ 10, 5 ] }, d: { d1: [ 220, 221, 23, 24 ] } };

        expect(merge).toEqual(mergeExpected);
    });

    it('should replace arrays', () => {
        const o = { a: 1, b: [ 1, 2, 3, 4 ], c: { c1: [ 4, 5 ] } };
        const o1 = { b: [ 51, 52 ], d: { d1: [ 21, 22, 23, 24 ] } };
        const o2 = { a: 1, c: { c1: [ 10 ] }, d: { d1: [ 220, 221 ] } };

        const merge = assignRecursive(o, o1, o2, { isOption: true, arrayMode: 'replace' });
        const mergeExpected = { a: 1, b: [ 51, 52 ], c: { c1: [ 10 ] }, d: { d1: [ 220, 221 ] } };

        expect(merge).toEqual(mergeExpected);
    });

    it('should concat arrays', () => {
        const o = { a: 1, b: [ 1, 2, 3, 4 ], c: { c1: [ 4, 5 ] } };
        const o1 = { b: [ 51, 52 ], d: { d1: [ 21, 22, 23, 24 ] } };
        const o2 = { a: 1, c: { c1: [ 10 ] }, d: { d1: [ 220, 221 ] } };

        const merge = assignRecursiveArray(o, [ o1, o2 ], { arrayMode: 'concat' });
        const mergeExpected = { a: 1, b: [ 1, 2, 3, 4, 51, 52 ], c: { c1: [ 4, 5, 10 ] }, d: { d1: [ 21, 22, 23, 24, 220, 221 ] } };

        expect(merge).toEqual(mergeExpected);
    });

    it('assignDefaultOption should merge an object and a partial one', () => {
        const defaultO = { a: 1, b: { b1: 2, b2: 3 }, c: 'c' };
        const o = { a: 2, b: { b1: 22 } };

        const merge = assignDefaultOption(defaultO, o);
        const mergeExpected = { a: 2, b: { b1: 22, b2: 3 }, c: 'c' };

        expect(merge).toEqual(mergeExpected);
    });

    it('should merge only until depth 1', () => {
        let merge: PlainObj = undefined;
        let mergeExpected: PlainObj = undefined;

        merge = assignRecursiveArray(o, [ o1, o2 ], { depth: 1 });
        mergeExpected = { a: 1, b: 3, c: { c11: 50, c13: { c22: 100 } }, d: 3, e: 5 };
        expect(merge).toEqual(mergeExpected);
    });

    it('should merge only until depth 2', () => {
        let merge: PlainObj = undefined;
        let mergeExpected: PlainObj = undefined;

        merge = assignRecursiveArray(o, [ o1, o2 ], { depth: 2 });
        mergeExpected = { b: 3, c: { c11: 50, c12: 12, c13: { c22: 100 } }, d: 3, e: 5, a: 1 };
        expect(merge).toEqual(mergeExpected);
    });

    it('should merge only until depth 3', () => {
        let merge: PlainObj = undefined;
        let mergeExpected: PlainObj = undefined;

        merge = assignRecursiveArray(o, [ o1, o2 ], { depth: 3 });
        mergeExpected = { a: 1, b: 3, c: { c11: 50, c12: 12, c13: { c21: 21, c22: 100 } }, d: 3, e: 5 };
        expect(merge).toEqual(mergeExpected);
    });

    it('should merge only existing properties', () => {
        const merge = assignRecursive({ a: 1, b: 4, c: { c11: { c111: 1 }, c12: 2, c13: { c22: 1 } } }, o1, { isOption: true, onlyExistingProp: true });
        const expectedMerge = { a: 1, b: 2, c: { c11: 11, c12: 12, c13: { c22: 22 } } };
        expect(merge).toEqual(expectedMerge);
    });

    it('should merge only specified properties', () => {
        const merge = assignRecursive(o, o1, o2, { isOption: true, props: [ 'a', 'b', 'c.c12', 'c.c13.c22', 'd' ] });
        const expectedMerge = { a: 1, b: 3, c: { c12: 12, c13: { c22: 100, }, }, d: 3, e: 5 };
        expect(merge).toEqual(expectedMerge);
    });

    it('should merge all properties except the one specified', () => {
        o.b = 20;
        o.d = 40;

        const merge = assignRecursive(o, o1, o2, { isOption: true, except: [ 'a', 'b', 'c.c12', 'c.c13.c22', 'd' ] });
        const expectedMerge = { b: 20, c: { c11: 50, c13: { c21: 21 }, }, d: 40, e: 5 };

        expect(merge).toEqual(expectedMerge);
    });
});
