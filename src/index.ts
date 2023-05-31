import { Client } from "./struct/client";
export * from "colors";

const client = new Client();
client.start();

export { client };
