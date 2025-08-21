import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" }); // i have add this for security and ts check
  const token = authHeader.split(" ")[1]; // this is splite the token from the header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  Jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    (req as any).userId = user.userId;
    next();
  });
};
