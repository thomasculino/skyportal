import { useContext } from "react";
import { useLocation } from "react-router-dom";

import { AnnotationBuilderContext } from "../contexts/AnnotationBuilderContext";
import { ConditionContext } from "../contexts/ConditionContext";
import { FilterBuilderContext } from "../contexts/FilterBuilderContext";

export const useAnnotationBuilder = () => {
  const context = useContext(AnnotationBuilderContext);

  if (!context) {
    throw new Error(
      "useAnnotationBuilder must be used within an AnnotationBuilderProvider",
    );
  }

  return context;
};

export const useConditionContext = () => {
  const context = useContext(ConditionContext);
  if (!context) {
    throw new Error(
      "useConditionContext must be used within a ConditionProvider",
    );
  }
  return context;
};

export const useFilterBuilder = () => {
  const context = useContext(FilterBuilderContext);
  if (!context) {
    throw new Error(
      "useFilterBuilder must be used within FilterBuilderProvider",
    );
  }
  return context;
};

export const useCurrentBuilder = () => {
  const location = useLocation();
  const annotationContext = useContext(AnnotationBuilderContext);
  const filterContext = useContext(FilterBuilderContext);

  // Determine which context to use based on the current route
  if (location.pathname === "/annotations") {
    if (annotationContext && filterContext) {
      // For annotation page, use annotation context for most things,
      // but use filter context for MongoDB query functionality
      return {
        ...annotationContext,
        // Override MongoDB-related functions to use filter context
        mongoDialog: filterContext.mongoDialog,
        setMongoDialog: filterContext.setMongoDialog,
        generateMongoQuery: filterContext.generateMongoQuery,
        getFormattedMongoQuery: filterContext.getFormattedMongoQuery,
        hasValidQuery: filterContext.hasValidQuery,
      };
    }
    throw new Error(
      "useCurrentBuilder: AnnotationBuilderProvider or FilterBuilderProvider not found on annotation page",
    );
  } else {
    // Default to filter context for all other routes (including '/')
    if (filterContext) {
      return filterContext;
    }
    throw new Error(
      "useCurrentBuilder: FilterBuilderProvider not found on filter page",
    );
  }
};
