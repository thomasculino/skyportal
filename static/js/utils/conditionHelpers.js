import {
  fieldOptions,
  nestedFieldOptions,
} from "../constants/filterConstants.js";

// Helper functions for field type checking
export const getFieldType = (
  field,
  customVariables,
  fieldOptionsList,
  customListVariables = [],
) => {
  // First check custom variables and list variables
  const fieldVar = customVariables?.find((v) => v.name === field);
  const listVar = customListVariables?.find((lv) => lv.name === field);
  const fieldObjList = fieldOptionsList
    ? fieldOptionsList.find((f) => f.label === field)
    : null;

  if (fieldVar?.type) return fieldVar.type;
  if (listVar?.type) return listVar.type;
  if (fieldObjList?.type) return fieldObjList.type;

  // Check for exact match first (backward compatibility)
  const exactMatch = fieldOptions.find((f) => f.label === field);
  if (exactMatch?.type) return exactMatch.type;

  // Handle nested field paths (e.g., "Candidate.isdiffpos", "cross_matches.NED_BetaV3.z")
  const fieldParts = field.split(".");

  if (fieldParts.length >= 2) {
    const rootField = fieldParts[0];
    const nestedPath = fieldParts.slice(1);

    // Find the root field in the nested schema - access fields array from the schema
    const schemaFields = nestedFieldOptions.fields || [];
    const rootFieldObj = schemaFields.find((f) => f.name === rootField);

    if (rootFieldObj) {
      // Handle object type with nested values
      if (
        rootFieldObj.type === "object" &&
        rootFieldObj.values &&
        Array.isArray(rootFieldObj.values)
      ) {
        return findNestedFieldType(rootFieldObj.values, nestedPath);
      }

      // Handle array type with nested objects
      if (
        rootFieldObj.type === "array" &&
        rootFieldObj.values &&
        Array.isArray(rootFieldObj.values)
      ) {
        // For array fields, the first part after root is the array object type (e.g., "NED_BetaV3")
        if (nestedPath.length >= 1) {
          const arrayObjectName = nestedPath[0];
          const remainingPath = nestedPath.slice(1);

          // Find the specific array object type
          const arrayObject = rootFieldObj.values.find(
            (v) => v.label === arrayObjectName,
          );
          if (arrayObject && arrayObject.values) {
            return findNestedFieldType([arrayObject], remainingPath, true);
          }
        }
      }
    }
  }

  return undefined;
};

// Helper function to find field type in nested structure
const findNestedFieldType = (values, fieldPath, isArrayObject = false) => {
  if (!fieldPath || fieldPath.length === 0) return undefined;

  const currentField = fieldPath[0];
  const remainingPath = fieldPath.slice(1);

  if (isArrayObject && values.length > 0 && values[0].values) {
    // For array objects, look in the values property
    const targetValues = values[0].values;

    if (remainingPath.length === 0) {
      // Final field, return its type
      return targetValues[currentField];
    } else {
      // More nesting, continue traversal
      const nestedObj = targetValues[currentField];
      if (typeof nestedObj === "object" && nestedObj !== null) {
        return findNestedFieldType(
          [{ values: nestedObj }],
          remainingPath,
          true,
        );
      }
    }
  } else {
    // For regular object types
    for (const value of values) {
      if (value.label === currentField) {
        if (remainingPath.length === 0) {
          // Final field, return its type
          return value.type;
        } else if (value.values) {
          // More nesting, continue traversal
          if (Array.isArray(value.values)) {
            return findNestedFieldType(value.values, remainingPath);
          } else if (typeof value.values === "object") {
            return findNestedFieldType(
              [{ values: value.values }],
              remainingPath,
              true,
            );
          }
        }
      }
    }
  }

  return undefined;
};

export const isFieldType = (
  field,
  type,
  customVariables,
  fieldOptionsList,
  customListVariables = [],
) => {
  return (
    getFieldType(
      field,
      customVariables,
      fieldOptionsList,
      customListVariables,
    ) === type
  );
};

// Helper function to get operators for a field
export const getOperatorsForField = (
  field,
  customVariables,
  fieldOptionsList,
  customListVariables = [],
) => {
  // Use getFieldType to determine the type, which handles nested fields properly
  const type = getFieldType(
    field,
    customVariables,
    fieldOptionsList,
    customListVariables,
  );

  // If we can't determine the type, return empty array
  if (!type) return [];

  const baseOperators = ["$exists", "$isNumber"]; // Available for all field types

  switch (type) {
    case "number":
      return [
        "$eq",
        "$ne",
        "$gt",
        "$gte",
        "$lt",
        "$lte",
        "$round",
        ...baseOperators,
      ];
    case "string":
      return ["$eq", "$ne", "$regex", "$type", ...baseOperators];
    case "array":
    case "array_variable": // List variables should have the same operators as regular arrays
      return [
        "$in",
        "$nin",
        "$anyElementTrue",
        "$allElementsTrue",
        "$filter",
        "$map",
        "$lengthGt",
        "$lengthLt",
        "$min",
        "$max",
        "$avg",
        "$sum",
        ...baseOperators,
      ];
    case "boolean":
      return ["$eq", "$ne", ...baseOperators];
    default:
      return baseOperators;
  }
};

// Helper function to compose field options with variables
export const getFieldOptionsWithVariable = (
  baseFieldOptions,
  fieldOptionsList,
  customVariables,
  customListVariables,
) => {
  const listVariableOptions =
    customListVariables?.map((lv) => {
      // If the list operator is anyElementTrue or allElementsTrue, set type to array_variable_boolean
      const operator = lv.listCondition?.operator;
      const isBooleanArray =
        operator === "$anyElementTrue" || operator === "$allElementsTrue";
      return {
        label: lv.name,
        type: isBooleanArray ? "array_variable_boolean" : "array_variable",
        isListVariable: true,
        listCondition: lv.listCondition,
      };
    }) || [];

  const variableOptions =
    customVariables?.map((eq) => ({
      label: eq.name,
      type: "number",
      isVariable: true,
      equation: eq.variable,
    })) || [];

  // Use fieldOptionsList if provided, otherwise use the imported fieldOptions from constants
  const baseOptions = fieldOptionsList || baseFieldOptions || fieldOptions;

  return [...baseOptions, ...variableOptions, ...listVariableOptions];
};

// Helper function to update conditions in the filter tree
export const createUpdateConditionFunction = (filters, setFilters) => {
  return (blockId, conditionId, key, value) => {
    const updateBlock = (block) => {
      if (block.id !== blockId) {
        return {
          ...block,
          children: block.children?.map((child) =>
            child.category === "block" ? updateBlock(child) : child,
          ),
        };
      }
      return {
        ...block,
        children: block.children.map((child) =>
          child.id === conditionId ? { ...child, [key]: value } : child,
        ),
      };
    };
    setFilters(filters.map(updateBlock));
  };
};

// Helper function to remove items from the filter tree
export const createRemoveItemFunction = (
  filters,
  setFilters,
  defaultCondition,
) => {
  return (blockId, itemId) => {
    const removeFromBlock = (block) => {
      if (block.id !== blockId) {
        return {
          ...block,
          children: block.children.map((child) =>
            child.category === "block" ? removeFromBlock(child) : child,
          ),
        };
      }
      const filteredChildren = block.children.filter(
        (child) => child.id !== itemId,
      );
      // If this is the root block and removing would leave it empty, always keep at least one condition
      if (filteredChildren.length === 0 && blockId === filters[0].id) {
        return {
          ...block,
          children: [defaultCondition()],
        };
      }
      return {
        ...block,
        children: filteredChildren,
      };
    };
    setFilters(filters.map(removeFromBlock));
  };
};
