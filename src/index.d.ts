import { ReactNode } from "react";

export interface FormProps {
  accountId: string,
  formId: string | number,
  css?: string | ((formId: string) => string),
  prefill?: Record<string, any>,
  loading?: ReactNode,
  onReady?: () => any,
  onSubmit?: () => any,
  onPageChange?: () => any,
}

declare function Form(props: FormProps): JSX.Element;
export default Form;
