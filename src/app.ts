import express, { Application } from 'express';
import { BaseController } from './controllers/base.controller';
import { FormsController } from './controllers/forms.controller';

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
        this.app.get('/health', (req, res) => {
            return res.json({
                status: 'success',
                message: 'API is running...'
            });
        })
    }
}

const app = new App([new FormsController()]).app;

export default app;
