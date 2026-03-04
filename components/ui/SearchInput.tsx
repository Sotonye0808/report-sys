"use client";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { InputProps } from "antd";

interface SearchInputProps extends Omit<InputProps, "prefix"> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ onSearch, ...props }: SearchInputProps) {
  return (
    <Input
      prefix={<SearchOutlined className="text-ds-text-subtle" />}
      allowClear
      onChange={(e) => {
        if (!e.target.value && onSearch) onSearch("");
        props.onChange?.(e);
      }}
      onPressEnter={(e) => {
        if (onSearch) onSearch((e.target as HTMLInputElement).value);
      }}
      {...props}
    />
  );
}

export default SearchInput;
