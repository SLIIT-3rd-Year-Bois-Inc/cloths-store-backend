import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    customer_id: string;
    admin_id: string;
  }
}
