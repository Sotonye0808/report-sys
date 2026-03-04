/**
 * components/ui/Input.tsx
 * Wrappers for Ant Design form inputs with consistent ds-token styling.
 */

import { Input as AntInput, type InputProps } from "antd";

export function Input(props: InputProps) {
  return <AntInput {...props} />;
}

Input.Password = AntInput.Password;
Input.TextArea = AntInput.TextArea;
Input.Search = AntInput.Search;

export default Input;
