import "express-session";

declare module "express-session" {
  interface SessionData {
    impersonating_user_id?: string;
    impersonation_started_at?: string;
    return_brand_id?: string;
  }
}
