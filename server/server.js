import dotenv from 'dotenv';
import App from './app.js';

import AuthHttpController from './controllers/auth.js';
import UserHttpController from './controllers/user.js';
import AlertsHttpController from './controllers/alerts.js';

import SearchController from './socket-controllers/search.js';
import UserController from './socket-controllers/user.js';
import AlertsController from './socket-controllers/alerts.js';
import PoliceController from './socket-controllers/police.js';

dotenv.config();
const app = new App([
    new AuthHttpController(),
    new UserHttpController(),
    new AlertsHttpController()
], [
    new SearchController(),
    new UserController(),
    new AlertsController(),
    new PoliceController(),
], +process.env.PORT);
export default app.listen();