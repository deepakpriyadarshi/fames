import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IRequest extends Request {
    currentUser?: any;
}

export interface IJWTTokenData extends JwtPayload {
    userId: string;
}
