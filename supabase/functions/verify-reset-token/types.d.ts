declare module "https://esm.sh/@supabase/supabase-js@2" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const createClient: (...args: unknown[]) => any
}

declare module "https://esm.sh/resend@latest" {
  export class Resend {
    constructor(apiKey: string)
    emails: {
      send: (options: {
        from: string
        to: string[]
        subject: string
        html: string
      }) => Promise<unknown>
    }
  }
}

declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
  serve: (handler: (req: Request) => Response | Promise<Response>) => void
}
