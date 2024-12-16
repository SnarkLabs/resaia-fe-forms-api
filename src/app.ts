import express, { Application } from 'express';
import { BaseController } from './controllers/base.controller';
import { HelloController } from './controllers/hello.controller';

class App {
    public app: Application;
    public port = 3000;
    public prefix = 'api';

    constructor(controllers: BaseController[], prefix: string = 'api') {
        this.prefix = prefix;
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
    }

    private initializeControllers(controllers: BaseController[]) {
        controllers.forEach((controller) => {
            this.app.use(controller.basePath, controller.Router());
        });
    }
}

const app = new App([new HelloController()]).app;

export default app;
