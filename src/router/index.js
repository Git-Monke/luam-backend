const { APIError, ErrorCodes } = require("../utils/apierror");

const postUser = require("../controllers/signupController");

const getPackage = require("../controllers/package/getController");
const postPackage = require("../controllers/package/postController");

const setYankStatus = require("../controllers/package/yankController");

const router = require("koa-router");

const Router = router();

Router.post("/users", postUser);

Router.get("/packages/:name", getPackage);
Router.post("/packages/:name/yank", (ctx) => setYankStatus(ctx, true));
Router.post("/packages/:name/unyank", (ctx) => setYankStatus(ctx, false));
Router.post("/packages", postPackage);

module.exports = Router;
