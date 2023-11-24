const Koa = require("koa");
const { MongoClient } = require("mongodb");
const app = new Koa();
const bodyParser = require("koa-bodyparser");

const signup = require("./signup.js");
const post_package = require("./post-package.js");
const pull_package = require("./pull-package.js");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const db = client.db("luam_registry");
const users = db.collection("users");

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected successfully!");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
}

connectToMongo();

app.use(bodyParser());

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get("response_time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = performance.now();
  await next();
  const end = performance.now();
  ctx.set("response_time", `${(end - start).toLocaleString()}ms`);
});

app.use(async (ctx) => {
  if (ctx.path == "/") {
    ctx.body = "Hello World!";
    return;
  }

  if (ctx.path == "/signup") {
    await signup(ctx, users);
    return;
  }

  if (ctx.path == "/post_package") {
    await post_package(ctx);
    return;
  }

  if (ctx.path == "/pull_package") {
    await pull_package(ctx);
    return;
  }

  ctx.throw(404, "Invalid Path");
});

app.listen(3000, () => {
  console.log("Server started!");
});