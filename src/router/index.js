const { APIError, ErrorCodes } = require("../utils/apierror");

const userPOST = require("../controllers/userPOST");

const packageGET = require("../controllers/package/packageGET");
const packagePOST = require("../controllers/package/packagePOST");

class RouterClass {
  constructor() {
    this.routes = {};
  }

  addRoute(path, method, controller) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }

    this.routes[path][method] = controller;
  }

  async route(ctx) {
    let route = this.routes[ctx.path];

    if (route && route[ctx.method]) {
      await route[ctx.method](ctx);
    } else {
      throw new APIError(ErrorCodes.BAD_REQUEST, "InvalidRoute");
    }
  }
}

const Router = new RouterClass();

Router.addRoute("/user", "POST", userPOST);

Router.addRoute("/packages", "GET", packageGET);
Router.addRoute("/packages", "POST", packagePOST);

module.exports = Router;
