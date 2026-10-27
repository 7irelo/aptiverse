"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import {
  Controller,
  useForm,
  type Control,
  type FieldPath,
  type FieldValues,
  type Resolver,
  type UseFormProps,
} from "react-hook-form";
import type { z } from "zod";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Form helpers bound to react-hook-form and zod. Pass the zod schema that
 * Orval generates from the OpenAPI spec, so client validation matches the
 * API exactly. Field wrappers wire the label, description and error to the
 * control with the right ids and aria attributes.
 */
export function useZodForm<Schema extends z.ZodType<FieldValues, FieldValues>>(
  schema: Schema,
  options?: Omit<
    UseFormProps<z.input<Schema>, unknown, z.output<Schema>>,
    "resolver"
  >,
) {
  return useForm<z.input<Schema>, unknown, z.output<Schema>>({
    mode: "onTouched",
    ...options,
    // zodResolver infers loose FieldValues for a generic schema; the schema's own input and output are exact.
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<Schema>,
      unknown,
      z.output<Schema>
    >,
  });
}

type BaseFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
};

type TextFieldProps<T extends FieldValues> = BaseFieldProps<T> &
  Omit<ComponentProps<typeof Input>, "name" | "defaultValue" | "value">;

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: TextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const id = `field-${name}`;
        const descriptionId = description ? `${id}-description` : undefined;
        const errorId = fieldState.error ? `${id}-error` : undefined;
        return (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
              {...inputProps}
              {...field}
              value={field.value ?? ""}
              id={id}
              aria-invalid={fieldState.invalid || undefined}
              aria-describedby={
                [descriptionId, errorId].filter(Boolean).join(" ") || undefined
              }
              className={className ?? "h-11 text-base"}
            />
            {description ? (
              <FieldDescription id={descriptionId}>
                {description}
              </FieldDescription>
            ) : null}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}

type SelectFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  placeholder = "Choose one",
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const id = `field-${name}`;
        const descriptionId = description ? `${id}-description` : undefined;
        const errorId = fieldState.error ? `${id}-error` : undefined;
        return (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select
              name={field.name}
              value={field.value ?? ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id={id}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={
                  [descriptionId, errorId].filter(Boolean).join(" ") ||
                  undefined
                }
                className="h-11 w-full text-base"
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="min-h-11"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description ? (
              <FieldDescription id={descriptionId}>
                {description}
              </FieldDescription>
            ) : null}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
