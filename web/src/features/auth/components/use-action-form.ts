"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import type { DefaultValues, FieldValues, Path } from "react-hook-form";
import type { z } from "zod";

import { useZodForm } from "@/components/common/form-fields";

import type { FormState } from "../lib/form-state";

/**
 * Binds a react-hook-form + zod form to a server action:
 * - Before hydration the plain <form action> posts to the server action, so
 *   a tap on a slow phone still submits (the server validates again).
 * - After hydration zod validates first; only a valid form is sent, once
 *   (pending guard), with js=1 so the action answers with a redirect target.
 * - API field errors land on their fields; on success the browser does a
 *   full page load so the next request carries the new session cookie and
 *   no client cache from a previous account survives.
 */
export function useActionForm<
  Schema extends z.ZodType<FieldValues, FieldValues>,
  State extends FormState,
>(
  schema: Schema,
  action: (state: State, formData: FormData) => Promise<State>,
  initial: State,
  defaultValues?: DefaultValues<z.input<Schema>>,
) {
  const form = useZodForm(schema, { defaultValues });
  const [state, formAction, pending] = useActionState<State, FormData>(
    action,
    initial as Awaited<State>,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Text typed before hydration (slow phones, password managers) lives only
  // in the DOM. Copy it into the form state once, so React does not wipe it.
  useEffect(() => {
    const element = formRef.current;
    if (!element) return;
    for (const input of Array.from(element.querySelectorAll("input"))) {
      if (!input.name || !input.value) continue;
      if (["hidden", "checkbox", "radio", "submit"].includes(input.type)) {
        continue;
      }
      const name = input.name as Path<z.input<Schema>>;
      if (!form.getValues(name)) {
        form.setValue(name, input.value as never, { shouldDirty: true });
      }
    }
  }, [form]);

  useEffect(() => {
    for (const name of state.resetFields ?? []) {
      form.setValue(name as Path<z.input<Schema>>, "" as never);
    }
    if (state.fieldErrors) {
      for (const [name, messages] of Object.entries(state.fieldErrors)) {
        form.setError(name as Path<z.input<Schema>>, {
          type: "server",
          message: messages.join(" "),
        });
      }
    }
    if (state.status === "success" && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state, form]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || (state.status === "success" && state.redirectTo)) return;
    void form.handleSubmit(() => {
      const element = formRef.current;
      if (!element) return;
      const data = new FormData(element);
      data.set("js", "1");
      startTransition(() => formAction(data));
    })(event);
  };

  return {
    form,
    state,
    pending,
    done: state.status === "success" && !!state.redirectTo,
    formProps: {
      ref: formRef,
      action: formAction,
      onSubmit,
      noValidate: true,
    },
  };
}
