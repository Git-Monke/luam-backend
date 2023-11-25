const Koa = require("koa");
const Router = require("./router/index");

const app = new Koa();
const bodyParser = require("koa-bodyparser");

const handleError = require("./middleware/errorhandling");
const { APIError } = require("./utils/apierror");

app.use(handleError);

app.use(
  bodyParser({
    onerror: () => {
      throw new APIError(422, "JSONParseError");
    },
  })
);

app.use(async (ctx) => Router.route(ctx));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
