import { BaseController, RouteDefinition } from './Base.controller';
import { Request, Response } from 'express';

export class AuthController extends BaseController {
    public basePath = '/auth';
    public routes: RouteDefinition[] = [
        { verb: 'GET', path: '/login', handler: this.login }
    ]

    public login(req: Request, res: Response) {
        return res.json({status: "success", message: "APIs under development"})
    }

    public signup(req: Request, res: Response) {
        // Signup logic
    }
}
