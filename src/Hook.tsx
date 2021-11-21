
import { Client, Field } from 'theworld-client';
import { useContext, useEffect, useState } from 'react';
import { TheWorldContext } from './Context';

export function useClient() {
    return useContext(TheWorldContext);
}

type HookField<V> = {
    id: string;
    value: V;
    set(value: V): Promise<void>;
    loading: boolean;
    deleted: boolean;
};
export function useField<V>(fieldId : string, fallbackValue: V): HookField<V> {
    const client = useClient();

    const [internalField, setInternalField] = useState<Field<V> | undefined>(undefined);
    const [field, setField] = useState<HookField<V>>({
        id: fieldId,
        value: fallbackValue,
        async set(value: V) {},
        loading: true,
        deleted: false
    });

    useEffect(() => {
        (async () => {
            const field = await client.getField(fieldId, fallbackValue);
            setInternalField(field);
        })();
    }, []);

    useEffect(() =>{
        if(!internalField) return;

        setField(_ => makeField());

        function onSet(value: V) {
            setField(_ => makeField());
        }
        function onDelete() {
            setField(_ => makeField());
        }

        internalField.on('set', onSet);
        internalField.on('delete', onDelete);

        return () => {
            internalField.off('set', onSet);
            internalField.off('delete', onDelete);
        };
    }, [internalField]);

    function makeField() {
        return {
            loading: false,
            id: fieldId,
            // readPrivate: internalField.readPrivate,
            // writePrivate: internalField.writePrivate,
            // canRead: internalField.canRead,
            // canWrite: internalField.canWrite,
            get value() {
                return internalField!.value;
            },
            set value(value: V) {
                internalField!.value = value;
            },
            deleted: internalField!.deleted,
            set,
            // delete: deleteF
        };
    }

    async function set(value: V) {
        await internalField!.set(value);
    }

    // async function deleteF() {
    //     await internalField.delete();
    // }

    return field;
}
export function useFieldValue<V>(fieldId : string, fallbackValue: V):
[
    V,
    (value: V|((prev: V) => V)) => Promise<void>
] {
    const field = useField(fieldId, fallbackValue);

    async function set(value: V | ((prev: V) => V)) {
        if(typeof value === 'function') {
            await field.set((value as any)(field.value));
        } else {
            await field.set(value);
        }
    }

    return [field.value, set];
}

// export function useUserField(fieldId : string, autoCreate? : ResField['value']):
// [
//     Field['value'],
//     (value:Field['value']|((prev : Field['value'])=>Field['value']))=>Promise<void>
// ] {
//     const client = useClient();

//     const [userField, setUserField] = useState<UserField>();
//     const [value, setValue] = useState<Field['value']>();

//     useEffect(() => {
//         (async () => {
//             setUserField(await client.getUserField(fieldId, autoCreate));
//         })();
//     }, []);

//     useEffect(() => {
//         if(!userField) return;
        
//         setValue(userField.value);

//         function onSet(value : Field['value']) {
//             setValue(value);
//         }

//         userField.on('set', onSet);

//         return () => {
//             userField.off('set', onSet);
//         };
//     }, [userField]);

//     async function set(value : Field['value'] | ((prev : Field['value'])=>Field['value'])) {
//         if(typeof value === 'function') {
//             await userField.set(value(userField.value));
//         } else {
//             await userField.set(value);
//         }
//     }

//     return [value, set];
// }