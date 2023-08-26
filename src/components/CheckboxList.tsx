import { VStack } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import { SimpleCheckboxInput } from "./SimpleCheckbox";

export function CheckboxList({ options, value, onChange, defaultValue }: { options: { key: string, text: string }[], value: string[], defaultValue?: string[], onChange: (value: string[]) => void }) {
    const [internalValue, setInternalValue] = useState<string[]>([]);
    useEffect(() => {
        if (Array.isArray(value)) {
            setInternalValue(value);
        } else {
            setInternalValue(defaultValue || [])
            onChange(defaultValue || [])
        }
    }, [value])

    function setOptions(key: string, checked: boolean) {
        if (checked) {
            const newItems = [...internalValue.filter(p => p !== key), key]
            setInternalValue(newItems);
            onChange(newItems);
        } else {
            const newItems = [...internalValue.filter(p => p !== key)];
            setInternalValue(newItems)
            onChange(newItems)
        }

    }

    return <VStack w="100%">
        {options.map(m => {
            return <SimpleCheckboxInput
                key={`opt_${m.key}`}
                checked={internalValue.includes(m.key)}
                onChange={(checked) => setOptions(m.key, checked)}
                description={m.text}

            ></SimpleCheckboxInput>
        })}

    </VStack>
}