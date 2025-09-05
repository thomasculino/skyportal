import { defaultFieldOptions, validateFieldSchema } from "./fieldSchema.js";

let activeFieldOptions = defaultFieldOptions;

export const setCustomFieldOptions = (customOptions) => {
  if (validateFieldSchema(customOptions)) {
    activeFieldOptions = customOptions;
    console.log("Custom field schema loaded successfully");
    return true;
  } else {
    console.error("Invalid field schema provided");
    return false;
  }
};

export const getActiveFieldOptions = () => {
  return activeFieldOptions;
};

export const resetToDefaultFieldOptions = () => {
  activeFieldOptions = defaultFieldOptions;
  console.log("Reset to default field schema");
};

export const loadFieldSchemaFromSource = async (source) => {
  try {
    let response;
    if (source.startsWith("http://") || source.startsWith("https://")) {
      // Load from URL
      response = await fetch(source);
    } else {
      // Load from local file
      response = await fetch(source);
    }

    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.statusText}`);
    }

    const schemaData = await response.json();
    return setCustomFieldOptions(schemaData);
  } catch (error) {
    console.error("Error loading field schema:", error);
    return false;
  }
};

export const fieldOptions = () => activeFieldOptions;
