declare module "https://esm.sh/@supabase/supabase-js@2" {
  export const createClient: (...args: unknown[]) => unknown
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
