import BaseForm, { FormProps } from "@rjsf/core"
import { FieldTemplateProps, FormContextType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils"
import clsx from "clsx"

const titleize = (label: string): string => label
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .split(" ")
  .map((labelPart) => labelPart.charAt(0).toUpperCase() + labelPart.slice(1))
  .join(" ")

const FieldTemplate = <T, S extends StrictRJSFSchema, F extends FormContextType>({ classNames, style, id, label, required, description, children, errors, help }: FieldTemplateProps<T, S, F>) => {
  return <div className={clsx(classNames, "margin-bottom--md")} style={style}>
    <div>
      <label htmlFor={id}>
        {titleize(label)}
        {required ? '*' : null}
      </label>
    </div>
    {description}
    {children}
    {errors}
    {help}
  </div>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Form = <T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(props: FormProps<T, S, F>) => <BaseForm<T, S, F> {...props} templates={{ FieldTemplate: FieldTemplate<T, S, F> }} />
