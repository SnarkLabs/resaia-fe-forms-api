import express, { Application } from 'express';
import { BaseController } from './controllers/Base.controller';
import { AuthController } from './controllers/Auth.controller';

class App {
    public app: Application;
    public port = 3000;
    public prefix = 'api';

    constructor(controllers: BaseController[], prefix: string = 'api') {
        this.prefix = prefix;
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.listen();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
    }

    private initializeControllers(controllers: BaseController[]) {
        controllers.forEach((controller) => {
            this.app.use(controller.basePath, controller.Router());
        });
    }

    private listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }
}

const app = new App([new AuthController()]).app;

export default app;
