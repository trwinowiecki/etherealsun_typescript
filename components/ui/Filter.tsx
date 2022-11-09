import React from 'react';

export interface FilterField {
  name: string;
  description?: string;
  values: {};
  selected: any;
  handleSelect: () => any;
  multipleSelectable: boolean;
}

interface FilterProps {
  fields: FilterField[];
}

const Filter = ({ fields }: FilterProps) => {
  return (
    <div className="">
      {fields.map((field, i) => (
        <div key={i}>{field.name}</div>
      ))}
    </div>
  );
};

export default Filter;
