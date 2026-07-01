
import { homeController } from '../modules/visitor/home/homeController.js';
import { initLoginPlanet } from '../modules/visitor/login/loginController.js';
import { initCreateCollaboratorPlanet } from '../modules/admin/createCollaborator/createCollaboratorController.js';


export const routes = {

    "/": {
        view: "/modules/visitor/home/home.html",
        controller: homeController,
    },

    "/iniciarSesion": {
        view: "/modules/visitor/login/login.html",
        controller: initLoginPlanet,
    },

    "/crearColaborador": {
        view: "/modules/admin/createCollaborator/createCollaborator.html",
        controller: initCreateCollaboratorPlanet,
    },




}

