
import { homeController } from '../modules/visitor/home/homeController.js';



export const routes = {

    "/": {
        view: "/modules/visitor/home/home.html",
        controller: homeController,
    },

}

