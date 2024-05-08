import { RequestHandler, Router as ExpressRouter } from 'express';

export interface RouteDefinition {
    verb: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    handler: RequestHandler
}

export abstract class BaseController {
    public abstract basePath: string;
    // public router = Router();
    public routes: RouteDefinition[] = [];

    public Router() {
        const router = ExpressRouter();

        const methodMap: { [key: string]: Function } = {
            get: router.get,
            post: router.post,
            put: router.put,
            delete: router.delete,
        };

        this.routes.forEach((route: RouteDefinition) => {
            const method = route.verb.toLowerCase();
            if (methodMap[method]) {
                console.log(route.path.replace(this.basePath, ''));
                methodMap[method].call(router, route.path.replace(this.basePath, ''), route.handler);
            }
        });
        return router;
    }
}
