import { useEffect } from "react";
import { checkStatus } from "@/app/actions/ppdb";
import { statusSchema } from "@/lib/validation";
type StatusResult = Awaited<ReturnType<typeof checkStatus>>;
type Tool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
};
type ModelDocument = Document & {
  modelContext?: {
    registerTool: (
      tool: Tool,
      options: { signal: AbortSignal },
    ) => void | Promise<void>;
  };
};
export function useStatusTool(
  setNumber: (v: string) => void,
  setToken: (v: string) => void,
  setResult: (v: StatusResult) => void,
) {
  useEffect(() => {
    const ctx = (document as ModelDocument).modelContext;
    if (!ctx?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        ctx.registerTool(
          {
            name: "check_ppdb_registration_status",
            description:
              "Check registration status using the registration number and private access code supplied by the applicant. Updates the visible status result.",
            inputSchema: {
              type: "object",
              properties: {
                registration_number: { type: "string" },
                access_token: { type: "string" },
              },
              required: ["registration_number", "access_token"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            async execute(input) {
              const p = statusSchema.safeParse(input);
              if (!p.success)
                return { error: "Nomor atau kode akses tidak valid." };
              setNumber(p.data.registration_number);
              setToken(p.data.access_token);
              const result = await checkStatus(p.data);
              setResult(result);
              return result;
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser capability. */
    }
    return () => lifecycle.abort();
  }, [setNumber, setToken, setResult]);
}
