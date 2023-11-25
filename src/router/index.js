const { APIError, ErrorCodes } = require("../utils/apierror");

const postUser = require("../controllers/postUser");

const getPackage = require("../controllers/package/getPackage");
const postPackage = require("../controllers/package/postPackage");

const setYankStatus = require("../controllers/package/setYankStatus");

const router = require("koa-router");

const Router = router();

Router.post("/user", postUser);

Router.get("/packages/:name", getPackage);
Router.post("/packages/:name/yank", (ctx) => setYankStatus(ctx, true));
Router.post("/packages/:name/unyank", (ctx) => setYankStatus(ctx, false));
Router.post("/packages", postPackage);

module.exports = Router;
