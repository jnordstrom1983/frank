import { Field } from "@/models/field";
import { ValidateNumberFieldValue } from "./Number/FieldEditorNumberHelper";
import { ValidateStringFieldValue } from "./String/FieldEditorStringHelper";
import { ValidateReferenceFieldValue } from "./Reference/FieldEditorReferenceHelper";
import { ValidateReferenceArrayFieldValue } from "./ReferenceArray/FieldEditorReferenceArrayHelper";
import { ValidateBlockFieldValue } from "./Block/FieldEditorBlockHelper";
import { ValidateTableFieldValue } from "./Table/FieldEditorTableHelper";
import { ValidateAssetFieldValue } from "./Asset/FieldEditorAssetHelper";
import { ValidateAssetArrayFieldValue } from "./AssetArray/FieldEditorAssetHelper";

export function GetFieldValidationErrors(field: Field, value: any) {

    const result = ValidateFieldValueschema(field, value);
    if (!result) {
        return [`Validator for data type not found ${field.dataTypeId}`]
    }
    if (!result.success) {
        return result.error.errors.map((e: any) => e.message)
    }



}

export function ValidateFieldValueschema(field: Field, value: any) {
    switch (field.dataTypeId) {
        case "string":
            return ValidateStringFieldValue(field, value as string | undefined);
        case "number":
            return ValidateNumberFieldValue(field, value as number | undefined);
        case "reference":
            return ValidateReferenceFieldValue(field, value as string | undefined);
        case "referenceArray":
            return ValidateReferenceArrayFieldValue(field, value as string[] | undefined);
        case "blocks":
            return ValidateBlockFieldValue(field, value)
        case "table":
            return ValidateTableFieldValue(field, value);
        case "asset":
            return ValidateAssetFieldValue(field, value);
        case "assetArray":
            return ValidateAssetArrayFieldValue(field, value);

    }
}