import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { TextInput } from "@/components/ui/TextInput";
import { supabase } from "@/lib/supabase";
import { emailPasswordSchema } from "@/schemas/auth";
import type { AuthMode } from "@/types/auth";

interface EmailPasswordFormProps {
  mode: AuthMode;
  onToggleMode: () => void;
  onConfirmationRequired: (email: string) => void;
}

export function EmailPasswordForm({
  mode,
  onToggleMode,
  onConfirmationRequired,
}: EmailPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: emailPasswordSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);

      if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword(value);
        if (error) {
          setServerError(error.message);
        } else {
          await router.invalidate();
        }
        return;
      }

      const { data, error } = await supabase.auth.signUp(value);
      if (error) {
        setServerError(error.message);
      } else if (data.session) {
        await router.invalidate();
      } else {
        onConfirmationRequired(value.email);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="email">
        {(field) => (
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              value={field.state.value}
              onChange={field.handleChange}
              placeholder="you@example.com"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 font-sans text-xs text-amber">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div>
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              type="password"
              value={field.state.value}
              onChange={field.handleChange}
              placeholder="••••••••"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 font-sans text-xs text-amber">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {serverError && (
        <p className="font-sans text-xs text-amber">{serverError}</p>
      )}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {mode === "signIn" ? "Sign in" : "Create account"}
          </Button>
        )}
      </form.Subscribe>

      <button
        type="button"
        onClick={onToggleMode}
        className="font-sans text-xs text-muted text-center mt-1"
      >
        {mode === "signIn"
          ? "No account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
