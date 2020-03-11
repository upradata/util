import { Constructor, AnyFunction } from './type';

// =====> https://github.com/bryntum/chronograph/blob/master/src/class/Mixin.ts <=====

// ---------------------------------------------------------------------------------------------------------------------
/*
    One should use Base as a base class, instead of Object
    this is because, when compiled to ES3 (which we use for NodeJS / IE11 compatibility), Object is called as a
    super AnyConstructor and returned value from it is used as an instance object
    that instance object will be missing prototype inheritance
    the contract is, that native JS AnyConstructor for the class is side-effect free
    all the effects may happen in the `initialize` method below
    for the instantiation with initialization one should use static `new` method
    the motivation for such design is that only in this case the attribute initializers, like
         class {
             some      : string   = "string"
         }
    works correctly
*/

export class Base {

    initialize<T extends Base>(props?: Partial<T>) {
        props && Object.assign(this, props);
    }


    static new<T extends typeof Base>(this: T, props?: Partial<InstanceType<T>>): InstanceType<T> {
        const instance = new this();

        instance.initialize<InstanceType<T>>(props);

        return instance as InstanceType<T>;
    }
}

export type BaseAnyConstructor = typeof Base;


// ---------------------------------------------------------------------------------------------------------------------
export type AnyConstructor<A> = Constructor<any, A>;

// ---------------------------------------------------------------------------------------------------------------------
export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;

export type MixinAnyConstructor<T extends AnyFunction> =
    T extends AnyFunction<infer M> ? (M extends AnyConstructor<Base> ? M & BaseAnyConstructor : M) : ReturnType<T>;

// ---------------------------------------------------------------------------------------------------------------------
export type FilterFlags<Base, Condition> = {
    [ Key in keyof Base ]: Base[ Key ] extends Condition ? Key : never
};

export type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[ keyof Base ];

export type OnlyPropertiesOfType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;
