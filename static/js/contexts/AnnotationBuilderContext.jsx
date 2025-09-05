import React, { useState, createContext } from "react";
import PropTypes from "prop-types";
import { useFilterManipulation, useFilterFactories } from "../hooks/useFilter";
import { useDialogStates } from "../hooks/useDialog";
import {
  convertToMongoAggregation,
  formatMongoAggregation,
  isValidPipeline,
} from "../utils/mongoConverter";

export const AnnotationBuilderContext = createContext();

export const AnnotationBuilderProvider = ({ children }) => {
  // Core state - separate from filters
  const [annotations, setAnnotations] = useState([]);
  const [collapsedBlocks, setCollapsedBlocks] = useState({});

  // Projection fields state with objectId included by default
  const [projectionFields, setProjectionFields] = useState([]);

  // Custom data state - separate from filters
  const [customBlocks, setCustomBlocks] = useState([]);
  const [customVariables, setCustomVariables] = useState([]);
  const [customListVariables, setCustomListVariables] = useState([]);

  // Get hook functionalities (using annotations instead of filters)
  const annotationManipulation = useFilterManipulation(
    annotations,
    setAnnotations,
  );
  const factories = useFilterFactories();
  const dialogs = useDialogStates();

  // MongoDB aggregation conversion (using annotations)
  const generateMongoQuery = () => {
    return convertToMongoAggregation(
      annotations,
      customVariables,
      customListVariables,
    );
  };

  const getFormattedMongoQuery = () => {
    const pipeline = generateMongoQuery();
    return formatMongoAggregation(pipeline);
  };

  const hasValidQuery = () => {
    const pipeline = generateMongoQuery();
    return isValidPipeline(pipeline);
  };

  // Context value
  const value = {
    // Core state (renamed for clarity)
    filters: annotations,
    setFilters: setAnnotations,
    collapsedBlocks,
    setCollapsedBlocks,

    // Custom data
    customBlocks,
    setCustomBlocks,
    customVariables,
    setCustomVariables,
    customListVariables,
    setCustomListVariables,

    // Projection fields state
    projectionFields,
    setProjectionFields,

    // Spread hook functionalities
    ...annotationManipulation,
    ...factories,
    ...dialogs,

    // MongoDB aggregation functions
    generateMongoQuery,
    getFormattedMongoQuery,
    hasValidQuery,
  };

  return (
    <AnnotationBuilderContext.Provider value={value}>
      {children}
    </AnnotationBuilderContext.Provider>
  );
};

// props validation
AnnotationBuilderProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
