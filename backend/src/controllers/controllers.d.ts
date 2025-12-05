import { Request, Response } from "express";

export interface IAuthController {
    register: (req: Request, res: Response) => Promise<Response>;
    login: (req: Request, res: Response) => Promise<Response>;
    session: (req: Request, res: Response) => Promise<Response>;
}
