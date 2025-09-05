export const defaultFieldOptions = {
  type: "record",
  name: "ZTFAlert",
  fields: [
    {
      name: "objectId",
      type: "double",
    },
    {
      name: "candidate",
      type: {
        type: "record",
        name: "Candidate",
        fields: [
          { name: "jd", type: "double" },
          { name: "fid", type: "int" },
          { name: "pid", type: "long" },
          { name: "diffmaglim", type: "float" },
          { name: "pdiffimfilename", type: "string" },
          { name: "programpi", type: "string" },
          { name: "programid", type: "int" },
          { name: "candid", type: "long" },
          { name: "isdiffpos", type: "boolean" },
          { name: "tblid", type: "long" },
          { name: "nid", type: "int" },
          { name: "rcid", type: "int" },
          { name: "field", type: "int" },
          { name: "xpos", type: "float" },
          { name: "ypos", type: "float" },
          { name: "ra", type: "double" },
          { name: "dec", type: "double" },
          { name: "magpsf", type: "float" },
          { name: "sigmapsf", type: "float" },
          { name: "chipsf", type: "float" },
          { name: "magap", type: "float" },
          { name: "sigmagap", type: "float" },
          { name: "distnr", type: "float" },
          { name: "magnr", type: "float" },
          { name: "sigmagnr", type: "float" },
          { name: "chinr", type: "float" },
          { name: "sharpnr", type: "float" },
          { name: "sky", type: "float" },
          { name: "magdiff", type: "float" },
          { name: "fwhm", type: "float" },
          { name: "classtar", type: "float" },
          { name: "mindtoedge", type: "float" },
          { name: "magfromlim", type: "float" },
          { name: "seeratio", type: "float" },
          { name: "aimage", type: "float" },
          { name: "bimage", type: "float" },
          { name: "aimagerat", type: "float" },
          { name: "bimagerat", type: "float" },
          { name: "elong", type: "float" },
          { name: "nneg", type: "int" },
          { name: "nbad", type: "int" },
          { name: "rb", type: "float" },
          { name: "rbversion", type: "string" },
          { name: "drb", type: "float" },
          { name: "drbversion", type: "string" },
          { name: "ssdistnr", type: "float" },
          { name: "ssmagnr", type: "float" },
          { name: "ssnamenr", type: "string" },
          { name: "sumrat", type: "float" },
          { name: "magapbig", type: "float" },
          { name: "sigmagapbig", type: "float" },
          { name: "ranr", type: "double" },
          { name: "decnr", type: "double" },
          { name: "ndethist", type: "int" },
          { name: "ncovhist", type: "int" },
          { name: "jdstarthist", type: "double" },
          { name: "jdendhist", type: "double" },
          { name: "scorr", type: "double" },
          { name: "tooflag", type: "int" },
          { name: "objectidps1", type: "long" },
          { name: "sgmag1", type: "float" },
          { name: "srmag1", type: "float" },
          { name: "simag1", type: "float" },
          { name: "szmag1", type: "float" },
          { name: "sgscore1", type: "float" },
          { name: "distpsnr1", type: "float" },
          { name: "objectidps2", type: "float" },
          { name: "sgmag2", type: "float" },
          { name: "srmag2", type: "float" },
          { name: "simag2", type: "float" },
          { name: "szmag2", type: "float" },
          { name: "sgscore2", type: "float" },
          { name: "distpsnr2", type: "float" },
          { name: "objectidps3", type: "long" },
          { name: "sgmag3", type: "float" },
          { name: "srmag3", type: "float" },
          { name: "simag3", type: "float" },
          { name: "szmag3", type: "float" },
          { name: "sgscore3", type: "float" },
          { name: "distpsnr3", type: "float" },
          { name: "nmtchps", type: "int" },
          { name: "rfid", type: "long" },
          { name: "jdstartref", type: "double" },
          { name: "jdendref", type: "double" },
          { name: "nframesref", type: "int" },
          { name: "dsnrms", type: "float" },
          { name: "ssnrms", type: "float" },
          { name: "dsdiff", type: "float" },
          { name: "magzpsci", type: "float" },
          { name: "magzpsciunc", type: "float" },
          { name: "magzpscirms", type: "float" },
          { name: "nmatches", type: "int" },
          { name: "clrcoeff", type: "float" },
          { name: "clrcounc", type: "float" },
          { name: "zpclrcov", type: "float" },
          { name: "zpmed", type: "float" },
          { name: "clrmed", type: "float" },
          { name: "clrrms", type: "float" },
          { name: "neargaia", type: "float" },
          { name: "neargaiabright", type: "float" },
          { name: "maggaia", type: "float" },
          { name: "maggaiabright", type: "float" },
          { name: "exptime", type: "float" },
        ],
      },
    },
    {
      name: "prv_candidates",
      type: {
        type: "array",
        items: "Candidate",
      },
    },
    {
      name: "fp_hists",
      type: {
        type: "array",
        items: {
          type: "record",
          name: "fp_hist",
          fields: [
            { name: "field", type: "int" },
            { name: "rcid", type: "int" },
            { name: "fid", type: "int" },
            { name: "pid", type: "long" },
            { name: "rfid", type: "long" },
            { name: "sciinpseeing", type: "float" },
            { name: "scibckgnd", type: "float" },
            { name: "scisigpix", type: "float" },
            { name: "magzpsci", type: "float" },
            { name: "magzpsciunc", type: "float" },
            { name: "magzpscirms", type: "float" },
            { name: "clrcoeff", type: "float" },
            { name: "clrcounc", type: "float" },
            { name: "exptime", type: "float" },
            { name: "adpctdif1", type: "float" },
            { name: "adpctdif2", type: "float" },
            { name: "diffmaglim", type: "float" },
            { name: "programid", type: "int" },
            { name: "jd", type: "double" },
            { name: "forcediffimflux", type: "float" },
            { name: "forcediffimfluxunc", type: "float" },
            { name: "procstatus", type: "string" },
            { name: "distnr", type: "float" },
            { name: "ranr", type: "double" },
            { name: "decnr", type: "double" },
            { name: "magnr", type: "float" },
            { name: "sigmagnr", type: "float" },
            { name: "chinr", type: "float" },
            { name: "sharpnr", type: "float" },
            { name: "snr", type: "float" },
            { name: "mag", type: "float" },
            { name: "magerr", type: "float" },
          ],
        },
      },
    },
    {
      name: "cross_matches",
      type: {
        type: "array",
        items: {
          type: "record",
          name: "CrossMatch",
          fields: [
            {
              name: "AllWISE",
              type: [
                "null",
                {
                  type: "record",
                  name: "AllWISEMatch",
                  fields: [
                    { name: "_id", type: "double" },
                    { name: "w1mpro", type: "double" },
                    { name: "w1sigmpro", type: "double" },
                    { name: "w2mpro", type: "double" },
                    { name: "w2sigmpro", type: "double" },
                    { name: "w3mpro", type: "double" },
                    { name: "w3sigmpro", type: "double" },
                    { name: "w4mpro", type: "double" },
                    { name: "w4sigmpro", type: "double" },
                    { name: "ph_qual", type: "string" },
                    {
                      name: "coordinates",
                      type: {
                        type: "record",
                        name: "WiseCoordinates",
                        fields: [
                          {
                            name: "radec_str",
                            type: { type: "array", items: "double" },
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
              default: null,
            },
            {
              name: "CLU_20190625",
              type: [
                "null",
                {
                  type: "record",
                  name: "CLUEntry",
                  fields: [
                    { name: "_id", type: "double" },
                    { name: "name", type: "string" },
                    { name: "ra", type: "double" },
                    { name: "dec", type: "double" },
                    { name: "z", type: "double" },
                    { name: "a", type: "double" },
                    { name: "b2a", type: "double" },
                    { name: "pa", type: "double" },
                    { name: "sfr_ha", type: "double" },
                    { name: "sfr_fuv", type: "double" },
                    { name: "mstar", type: "double" },
                    {
                      name: "coordinates",
                      type: {
                        type: "record",
                        name: "CLUCoordinates",
                        fields: [
                          {
                            name: "radec_str",
                            type: { type: "array", items: "double" },
                          },
                          { name: "distance_arcsec", type: "double" },
                          { name: "distance_kpc", type: "double" },
                        ],
                      },
                    },
                  ],
                },
              ],
              default: null,
            },
            {
              name: "NED_BetaV3",
              type: [
                "null",
                {
                  type: "record",
                  name: "NED_BetaV3Match",
                  fields: [
                    { name: "_id", type: "double" },
                    { name: "objname", type: "string" },
                    { name: "ra", type: "double" },
                    { name: "dec", type: "double" },
                    { name: "objtype", type: "double" },
                    { name: "z", type: "double" },
                    { name: "z_unc", type: "double" },
                    { name: "z_tech", type: "double" },
                    { name: "z_qual", type: "double" },
                    { name: "DistMpc", type: "string" },
                    { name: "DistMpc_unc", type: "float" },
                    { name: "ebv", type: "float" },
                    { name: "m_Ks", type: "float" },
                    { name: "m_Ks_unc", type: "float" },
                    { name: "tMASSphot", type: "string" },
                    {
                      name: "coordinates",
                      type: {
                        type: "record",
                        name: "Coordinates",
                        fields: [
                          {
                            name: "radec_str",
                            type: { type: "array", items: "string" },
                          },
                          { name: "distance_arcsec", type: "double" },
                          { name: "distance_kpc", type: "double" },
                        ],
                      },
                    },
                  ],
                },
              ],
              default: null,
            },
            {
              name: "Gaia_EDR3",
              type: [
                "null",
                {
                  type: "record",
                  name: "Gaia_EDR3Match",
                  fields: [
                    { name: "_id", type: "double" },
                    // { "name": "objname", "type": "string" },
                    // { "name": "ra", "type": "double" },
                    // { "name": "dec", "type": "double" },
                    { name: "parallax", type: "double" },
                    { name: "parallax_error", type: "double" },
                    // { "name": "pmra", "type": "double" },
                    // { "name": "pmra_unc", "type": "double" },
                    // { "name": "pmdec", "type": "double" },
                    // { "name": "pmdec_unc", "type": "double" },
                    { name: "phot_g_mean_mag", type: "double" },
                    { name: "phot_bp_mean_mag", type: "double" },
                    { name: "phot_rp_mean_mag", type: "double" },
                    {
                      name: "coordinates",
                      type: {
                        type: "record",
                        name: "Coordinates",
                        fields: [
                          {
                            name: "radec_str",
                            type: { type: "array", items: "string" },
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
              default: null,
            },
          ],
        },
      },
    },
  ],
};

/**
 * Helper function to validate Avro field schema
 * @param {Object} avroSchema - Avro schema object
 * @returns {boolean} - True if schema is valid
 */
export const validateFieldSchema = (avroSchema) => {
  if (!avroSchema || typeof avroSchema !== "object") {
    console.error("Avro schema must be an object");
    return false;
  }

  if (
    avroSchema.type !== "record" ||
    !avroSchema.fields ||
    !Array.isArray(avroSchema.fields)
  ) {
    console.error("Avro schema must be a record type with fields array");
    return false;
  }

  const validateField = (field) => {
    if (!field.name || typeof field.name !== "string") {
      console.error(`Invalid field name: ${field.name}`);
      return false;
    }

    if (!field.type) {
      console.error(`Missing type for field: ${field.name}`);
      return false;
    }

    // Handle union types (e.g., ["null", "string"])
    if (Array.isArray(field.type)) {
      return field.type.every(
        (t) => typeof t === "string" || (typeof t === "object" && t.type),
      );
    }

    // Handle complex types
    if (typeof field.type === "object") {
      if (field.type.type === "record" && field.type.fields) {
        return field.type.fields.every(validateField);
      }
      if (field.type.type === "array" && field.type.items) {
        if (typeof field.type.items === "string") return true;
        if (typeof field.type.items === "object") {
          return validateField({ name: "items", type: field.type.items });
        }
      }
    }

    return true;
  };

  return avroSchema.fields.every(validateField);
};

/**
 * Helper function to flatten Avro field schema for autocomplete display
 * Converts nested record and array structures into flat field options
 *
 * Array handling is automatic and generic:
 * - Cross-match style arrays: Arrays with record items containing union type fields
 *   (e.g., catalog fields with ["null", record] types) appear as "arrayName.catalogName"
 * - Expandable arrays: Arrays with simple record items appear as just "arrayName"
 *   and their nested fields are available in the list condition dialog
 * - Primitive arrays: Arrays of primitives appear as "arrayName" with itemType
 *
 * @param {Object} avroSchema - Avro schema object
 * @returns {Array} - Flattened array of field options
 */
export const flattenFieldOptions = (avroSchema) => {
  const flattenedOptions = [];

  // Helper to resolve named types
  const resolveNamedType = (typeName, schema) => {
    if (typeof typeName !== "string") return null;

    // Look for named type definitions in the schema
    const findNamedType = (fields) => {
      for (const field of fields) {
        const fieldType = Array.isArray(field.type)
          ? field.type.find((t) => t !== "null")
          : field.type;

        if (typeof fieldType === "object" && fieldType.name === typeName) {
          return fieldType;
        }

        // Recursively search in nested records
        if (
          typeof fieldType === "object" &&
          fieldType.type === "record" &&
          fieldType.fields
        ) {
          const found = findNamedType(fieldType.fields);
          if (found) return found;
        }

        if (
          typeof fieldType === "object" &&
          fieldType.type === "array" &&
          typeof fieldType.items === "object" &&
          fieldType.items.fields
        ) {
          const found = findNamedType(fieldType.items.fields);
          if (found) return found;
        }
      }
      return null;
    };

    return findNamedType(schema.fields || []);
  };

  const getSimpleType = (avroType) => {
    if (typeof avroType === "string") {
      // Map Avro primitive types to our system types
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
    }

    if (Array.isArray(avroType)) {
      // Handle union types - get the non-null type
      const nonNullType = avroType.find((t) => t !== "null");
      return getSimpleType(nonNullType);
    }

    if (typeof avroType === "object") {
      if (avroType.type === "array") return "array";
      if (avroType.type === "record") return "object";
      return getSimpleType(avroType.type);
    }

    return "string";
  };

  const processField = (field, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}.${field.name}` : field.name;
    const fieldType = field.type;

    // Handle union types (e.g., ["null", {...}])
    let actualType = fieldType;
    if (Array.isArray(fieldType)) {
      actualType = fieldType.find((t) => t !== "null") || fieldType[0];
    }

    if (typeof actualType === "object") {
      if (actualType.type === "record" && actualType.fields) {
        // For record fields, recursively process nested fields
        actualType.fields.forEach((nestedField) => {
          processField(nestedField, currentPath);
        });
      } else if (actualType.type === "array" && actualType.items) {
        // Handle array items - check if it's a named type reference
        let itemsType = actualType.items;

        // If items is a string, it's a named type reference
        if (typeof itemsType === "string") {
          const resolvedType = resolveNamedType(itemsType, avroSchema);
          if (resolvedType) {
            itemsType = resolvedType;
          }
        }

        // Automatically detect the array type based on structure:
        // - Cross_matches-style: arrays with record items that have union type fields (catalog fields)
        // - Expandable arrays: arrays with simple record items (no union types)
        const isCrossMatchStyle =
          typeof itemsType === "object" &&
          itemsType.type === "record" &&
          itemsType.fields &&
          itemsType.fields.some((catalogField) =>
            Array.isArray(catalogField.type),
          );

        if (isCrossMatchStyle) {
          // For cross_matches-style arrays, create entries for each catalog/database
          // These appear as "arrayName.catalogName" in the main autocomplete
          itemsType.fields.forEach((catalogField) => {
            flattenedOptions.push({
              label: `${currentPath}.${catalogField.name}`,
              type: "array", // Mark as array type since it represents an array element
              group: field.name, // Use the actual field name as group
              parentArray: currentPath,
              arrayObject: catalogField.name,
              catalogName: catalogField.name,
            });
          });
        } else if (
          typeof itemsType === "object" &&
          itemsType.type === "record"
        ) {
          // For expandable arrays (simple record arrays), only show the array itself as selectable
          // The nested fields will be available in the list condition dialog
          flattenedOptions.push({
            label: currentPath,
            type: "array",
            group: parentPath ? parentPath.split(".")[0] : "Simple",
            arrayItems: itemsType,
            isExpandableArray: true, // Mark as expandable for UI behavior
          });

          // Do NOT process the record fields for the main autocomplete
          // They will be handled separately in the list condition dialog
        } else {
          // Array of primitives
          flattenedOptions.push({
            label: currentPath,
            type: "array",
            group: parentPath ? parentPath.split(".")[0] : "Simple",
            itemType: getSimpleType(itemsType),
          });
        }
      } else {
        // Other complex types, treat as objects
        flattenedOptions.push({
          label: currentPath,
          type: getSimpleType(actualType),
          group: parentPath ? parentPath.split(".")[0] : "Simple",
        });
      }
    } else {
      // Simple field types
      flattenedOptions.push({
        label: currentPath,
        type: getSimpleType(actualType),
        group: parentPath ? parentPath.split(".")[0] : "Simple",
      });
    }
  };

  if (avroSchema && avroSchema.fields) {
    avroSchema.fields.forEach((field) => processField(field));
  }

  return flattenedOptions;
};

/**
 * Helper function to get nested field options for expandable arrays (prv_candidates, fp_hists)
 * This is used in the list condition dialog to show the available fields within array items
 * @param {Object} avroSchema - Avro schema object
 * @param {string} arrayFieldName - Name of the array field (e.g., 'prv_candidates', 'fp_hists')
 * @returns {Array} - Array of nested field options
 */
export const getExpandableArrayFields = (avroSchema, arrayFieldName) => {
  if (!avroSchema || !avroSchema.fields) return [];

  const arrayField = avroSchema.fields.find((f) => f.name === arrayFieldName);
  if (!arrayField) return [];

  let fieldType = arrayField.type;

  // Handle union types
  if (Array.isArray(fieldType)) {
    fieldType = fieldType.find((t) => t !== "null") || fieldType[0];
  }

  if (fieldType.type !== "array" || !fieldType.items) return [];

  let itemsType = fieldType.items;

  // Helper to resolve named types
  const resolveNamedType = (typeName, schema) => {
    if (typeof typeName !== "string") return null;

    const findNamedType = (fields) => {
      for (const field of fields) {
        const fieldTypeName = Array.isArray(field.type)
          ? field.type.find((t) => t !== "null")
          : field.type;

        if (
          typeof fieldTypeName === "object" &&
          fieldTypeName.name === typeName
        ) {
          return fieldTypeName;
        }

        if (
          typeof fieldTypeName === "object" &&
          fieldTypeName.type === "record" &&
          fieldTypeName.fields
        ) {
          const found = findNamedType(fieldTypeName.fields);
          if (found) return found;
        }

        if (
          typeof fieldTypeName === "object" &&
          fieldTypeName.type === "array" &&
          typeof fieldTypeName.items === "object" &&
          fieldTypeName.items.fields
        ) {
          const found = findNamedType(fieldTypeName.items.fields);
          if (found) return found;
        }
      }
      return null;
    };

    return findNamedType(schema.fields || []);
  };

  // If items is a string, it's a named type reference
  if (typeof itemsType === "string") {
    const resolvedType = resolveNamedType(itemsType, avroSchema);
    if (resolvedType) {
      itemsType = resolvedType;
    }
  }

  if (
    typeof itemsType !== "object" ||
    itemsType.type !== "record" ||
    !itemsType.fields
  ) {
    return [];
  }

  const getSimpleType = (avroType) => {
    if (typeof avroType === "string") {
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
    }

    if (Array.isArray(avroType)) {
      const nonNullType = avroType.find((t) => t !== "null");
      return getSimpleType(nonNullType);
    }

    if (typeof avroType === "object") {
      if (avroType.type === "array") return "array";
      if (avroType.type === "record") return "object";
      return getSimpleType(avroType.type);
    }

    return "string";
  };

  // Convert fields to flattened options
  const nestedFields = [];

  const processNestedField = (field, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}.${field.name}` : field.name;
    const fieldItemsType = field.type;

    let actualType = fieldItemsType;
    if (Array.isArray(fieldItemsType)) {
      actualType =
        fieldItemsType.find((t) => t !== "null") || fieldItemsType[0];
    }

    if (typeof actualType === "object") {
      if (actualType.type === "record" && actualType.fields) {
        // For nested records, recursively process fields
        actualType.fields.forEach((nestedField) => {
          processNestedField(nestedField, currentPath);
        });
      } else if (actualType.type === "array") {
        // Handle nested arrays
        nestedFields.push({
          label: currentPath,
          type: "array",
          itemType: getSimpleType(actualType.items),
        });
      } else {
        nestedFields.push({
          label: currentPath,
          type: getSimpleType(actualType),
        });
      }
    } else {
      nestedFields.push({
        label: currentPath,
        type: getSimpleType(actualType),
      });
    }
  };

  itemsType.fields.forEach((field) => processNestedField(field));

  return nestedFields.sort((a, b) => a.label.localeCompare(b.label));
};
