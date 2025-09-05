import React from "react";
import { FilterBuilderProvider } from "../contexts/FilterBuilderContext";
import AnnotationBuilderContent from "./AnnotationBuilderContent.jsx";

const AnnotationBuilder = () => {
  return (
    <FilterBuilderProvider>
      <AnnotationBuilderContent />
    </FilterBuilderProvider>
  );
};

export default AnnotationBuilder;
