import {
  defaultFieldOptions,
  flattenFieldOptions,
  getExpandableArrayFields,
} from "./fieldSchema.js";

// Re-export fieldOptions for backward compatibility
export const fieldOptions = flattenFieldOptions(defaultFieldOptions);

// Export the original nested field options for schema operations
export const nestedFieldOptions = defaultFieldOptions;

// Add operator types
export const mongoOperatorLabels = {
  $eq: "=",
  $ne: "≠",
  $gt: ">",
  $gte: "≥",
  $lt: "<",
  $lte: "≤",
  $in: "In",
  $nin: "Not In",
  $anyElementTrue: "Any Element True",
  $allElementsTrue: "All Elements True",
  $filter: "Filter",
  $map: "Map",
  $exists: "Exists",
  $isNumber: "Is Number",
  $min: "Minimum",
  $max: "Maximum",
  $avg: "Average",
  $sum: "Sum",
  $round: "Round",
  $lengthGt: "Length >",
  $lengthLt: "Length <",
  $regex: "Regex Match",
  $type: "Type Check",
};

export const mongoOperatorTypes = {
  $eq: "comparison",
  $ne: "comparison",
  $gt: "comparison",
  $gte: "comparison",
  $lt: "comparison",
  $lte: "comparison",
  $in: "array_boolean",
  $nin: "array_boolean",
  $anyElementTrue: "array",
  $allElementsTrue: "array",
  $filter: "array",
  $map: "array",
  $exists: "exists",
  $isNumber: "exists",
  $min: "aggregation",
  $max: "aggregation",
  $avg: "aggregation",
  $sum: "aggregation",
  $round: "aggregation",
  $lengthGt: "array_single",
  $lengthLt: "array_single",
  $regex: "string",
  $type: "string",
};

// Helper functions for handling nested objects in arrays
export function flattenObject(obj, prefix = "", separator = ".") {
  const flattened = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      const value = obj[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey, separator));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

export function unflattenObject(flatObj, separator = ".") {
  const result = {};

  for (const key in flatObj) {
    if (Object.prototype.hasOwnProperty.call(flatObj, key)) {
      const keys = key.split(separator);
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }

      current[keys[keys.length - 1]] = flatObj[key];
    }
  }

  return result;
}

// Helper to get all array and aggregation operators
export function getArrayOperators() {
  return Object.keys(mongoOperatorTypes).filter(
    (op) =>
      mongoOperatorTypes[op] === "array" ||
      mongoOperatorTypes[op] === "array_boolean" ||
      mongoOperatorTypes[op] === "array_single" ||
      mongoOperatorTypes[op] === "array_number" ||
      mongoOperatorTypes[op] === "aggregation",
  );
}

// Helper to get comparison operators
export function getComparisonOperators() {
  return Object.keys(mongoOperatorTypes).filter(
    (op) => mongoOperatorTypes[op] === "comparison",
  );
}

// Helper to extract array field subkeys for list condition dialog
export function getArrayFieldSubOptions(arrayFieldLabel) {
  // Handle null/undefined input
  if (!arrayFieldLabel || typeof arrayFieldLabel !== "string") {
    return [];
  }

  // Handle different array field formats
  if (arrayFieldLabel.startsWith("cross_matches.")) {
    // Extract the catalog name (e.g., 'AllWISE' from 'cross_matches.AllWISE')
    const catalogName = arrayFieldLabel.replace("cross_matches.", "");

    // Find the cross_matches field in the Avro schema
    const crossMatchesField = nestedFieldOptions.fields?.find(
      (field) => field.name === "cross_matches",
    );
    if (!crossMatchesField) return [];

    let crossMatchType = crossMatchesField.type;
    if (Array.isArray(crossMatchType)) {
      crossMatchType =
        crossMatchType.find((t) => t !== "null") || crossMatchType[0];
    }

    if (
      crossMatchType.type === "array" &&
      crossMatchType.items &&
      crossMatchType.items.type === "record" &&
      crossMatchType.items.fields
    ) {
      // Find the specific catalog field
      const catalogField = crossMatchType.items.fields.find(
        (f) => f.name === catalogName,
      );
      if (!catalogField) return [];

      let catalogType = catalogField.type;
      if (Array.isArray(catalogType)) {
        catalogType = catalogType.find((t) => t !== "null") || catalogType[0];
      }

      if (
        typeof catalogType === "object" &&
        catalogType.type === "record" &&
        catalogType.fields
      ) {
        // Convert Avro fields to our field options format
        const convertAvroField = (field, prefix = "") => {
          const fieldPath = prefix ? `${prefix}.${field.name}` : field.name;
          let fieldType = field.type;

          if (Array.isArray(fieldType)) {
            fieldType = fieldType.find((t) => t !== "null") || fieldType[0];
          }

          const result = [];

          if (typeof fieldType === "object") {
            if (fieldType.type === "record" && fieldType.fields) {
              // Recursively process nested records
              fieldType.fields.forEach((nestedField) => {
                result.push(...convertAvroField(nestedField, fieldPath));
              });
            } else if (fieldType.type === "array") {
              result.push({
                label: fieldPath,
                type: "array",
              });
            } else {
              result.push({
                label: fieldPath,
                type: getAvroFieldType(fieldType.type),
              });
            }
          } else {
            result.push({
              label: fieldPath,
              type: getAvroFieldType(fieldType),
            });
          }

          return result;
        };

        const getAvroFieldType = (avroType) => {
          switch (avroType) {
            case "double":
            case "float":
            case "int":
            case "long":
              return "number";
            case "string":
              return "string";
            case "boolean":
              return "boolean";
            default:
              return "string";
          }
        };

        const allFields = [];
        catalogType.fields.forEach((field) => {
          allFields.push(...convertAvroField(field));
        });

        return allFields.sort((a, b) => a.label.localeCompare(b.label));
      }
    }

    return [];
  }

  // Check if this is an expandable array (direct array field name without dots)
  if (!arrayFieldLabel.includes(".")) {
    // Try to get expandable array fields for any single field name
    const expandableFields = getExpandableArrayFields(
      nestedFieldOptions,
      arrayFieldLabel,
    );
    if (expandableFields.length > 0) {
      return expandableFields;
    }
  }

  // Legacy format handling (kept for backward compatibility if needed)
  if (arrayFieldLabel.includes(".")) {
    // These are likely cross_matches-style or legacy formats
    return [];
  }

  return [];
}
