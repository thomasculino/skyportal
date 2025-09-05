import React from "react";
import { FilterBuilderProvider } from "../contexts/FilterBuilderContext";
import FilterBuilderContent from "./FilterBuilderContent.jsx";

const FilterBuilder = () => {
  return (
    <FilterBuilderProvider>
      <FilterBuilderContent />
    </FilterBuilderProvider>
  );
};

export default FilterBuilder;
