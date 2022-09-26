import { NextFunction, Request, Response } from "express";
import sanitize from "mongo-sanitize";

export function cleanBody(req: Request, res: Response, next: NextFunction) {
  req.body = sanitize(req.body);
  next();
}
