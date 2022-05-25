import { ReactNode } from "react";

export interface FormProps {
  accountId: string,
  formId: string | number,
  css?: string,
  prefill?: Record<string, any>,
  loading?: ReactNode,
  onReady?: () => any,
  onSubmit?: () => any,
  onPageChange?: () => any,
}

declare function Form(props: FormProps);
export default Form;
