import express, { Request, Response, NextFunction } from "express";

export function customerAuthRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let id = req.session.customer_id;
  if (typeof id == "string" && id.length > 0) {
    next();
    return;
  }

  res.sendStatus(401);
}

export function adminAuthRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let id = req.session.admin_id;
  if (typeof id == "string" && id.length > 0) {
    next();
    return;
  }

  res.sendStatus(401);
}
