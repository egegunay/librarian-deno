import { parse } from "../deps.ts";

export const CHANNEL = { _value: "", set value(v) { this._value = v }, get value() { return this._value } }
CHANNEL.value = Deno.env.get("CHANNEL")!

export const DISCORD_TOKEN = Deno.env.get('DISCORD_TOKEN')
export const NSFW_IMAGE = Deno.env.get('NSFW_IMAGE')
export const SAUCETOKEN = Deno.env.get('SAUCETOKEN')
export const FORCESFW = (Deno.env.get('FORCESFW') === "true");
export const hide = "2"
export const dedupe = "2"
export const numres = "5"
export const minsim = "80!"
export const db = "999"
export const testmode = "1"
export const VERSION = "3.1.0 - Unsupported"

const website = Deno.env.get('website')
const { args } = Deno;
const DEFAULT_PORT = 8000;
const argPort = parse(args).port;
export const port = argPort ? Number(argPort) : DEFAULT_PORT

export const url = `https://${website}/search.php\
?output_type=2\
&hide=${hide}\
&dedupe=${dedupe}\
&numres=${numres}\
&minsim=${minsim}\
&dbs[]=${db}\
&testmode=${testmode}\
&api_key=${SAUCETOKEN}\
&url=`

// deno compile --allow-net --unstable --target x86_64-pc-windows-msvc --output out/librarian.exe ./src/mod.ts