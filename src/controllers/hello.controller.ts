import { BaseController, RouteDefinition } from './base.controller';
import { Request, Response } from 'express';

export class HelloController extends BaseController {
    public basePath = '/hello';
    public routes: RouteDefinition[] = [
        { verb: 'GET', path: '/world', handler: this.helloWorld }
    ]

    public helloWorld(req: Request, res: Response) {
        return res.json({ status: "success", message: "Hello World" });
    }
}
