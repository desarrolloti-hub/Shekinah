
import { homeController } from '../modules/visitor/home/homeController.js';
import {loginController } from '../modules/visitor/login/loginController.js'



export const routes = {

    "/": {
        view: "/modules/visitor/home/home.html",
        controller: homeController,
    },

    "/iniciarSesion": {
        view: "/modules/visitor/login/login.html",
        controller: loginController,
    },


}

