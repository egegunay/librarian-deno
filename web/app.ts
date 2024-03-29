import { Application, Router } from "../deps.ts"
import { port, CHANNEL } from "../config/config.ts";
import { baseClient } from "../src/mod.ts";
import { client } from "../src/mod.ts";

// https://github.com/oakserver/oak/issues/483#issuecomment-1060109388
const app = new Application({logErrors: false});

const router = new Router();

router.get("/v1/ping", (ctx) => {
  console.log('We got pinged!')
  baseClient.gateway.connected ? console.log('Client is connected') : console.error('Client is not connected?')
  ctx.response.body = "Hello world!";
});

router.put("/v1/channel", async (ctx) => {
    try {
        const requestBody = (await ctx.request.body({ type: "json" }).value)

        CHANNEL.value = requestBody.channel

        ctx.response.status = 200
        ctx.response.body = "Changed channel to " + CHANNEL.value
        console.log(`Channel changed to ${CHANNEL.value}`)
    } catch (err) {
        console.error(err)

        ctx.response.status = 400
        ctx.response.body = "Bad request"
    }
});

router.get("/v1/kill", (ctx) => {
    console.log('Uh oh.')
    ctx.response.body = "Goodbye!"
    baseClient.destroy().catch(console.log); // Might fail.
    client.destroy().catch(console.log);
});

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({port: port});