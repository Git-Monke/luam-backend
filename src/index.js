const Koa = require("koa");
const Router = require("./router/index");

const app = new Koa();
const bodyParser = require("koa-bodyparser");
// const ccParser = require("./middleware/ccBodyParser");

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

app.use(Router.routes());

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
