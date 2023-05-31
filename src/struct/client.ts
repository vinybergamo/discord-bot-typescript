import {
  BitFieldResolvable,
  ClientEvents,
  Client as DiscordClient,
  GatewayIntentsString,
  IntentsBitField,
  Partials,
} from "discord.js";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { EventType } from "./types/Event";
config();

const fileFilter = (filename: string) =>
  filename.endsWith(".ts") || filename.endsWith(".js");

export class Client extends DiscordClient {
  constructor() {
    super({
      intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<
        GatewayIntentsString,
        number
      >,
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
      ],
      failIfNotExists: false,
    });
  }

  public async start() {
    this.registerEvents();
    this.login(process.env.TOKEN);
    this.once("ready", this.whenReady);
  }

  private registerEvents() {
    const eventsPaths = path.join(__dirname, "..", "events");

    fs.readdirSync(eventsPaths).forEach((dir) => {
      fs.readdirSync(`${eventsPaths}/${dir}`)
        .filter(fileFilter)
        .forEach(async (fileName) => {
          const { name, run, once }: EventType<keyof ClientEvents> = (
            await import(`../events/${dir}/${fileName}`)
          )?.default;

          try {
            if (name) once ? this.once(name, run) : this.on(name, run);
          } catch (error) {
            console.error(`An error ocurred on event: ${name}\n`.red);
          }
        });
    });
  }

  private whenReady() {
    console.clear();
    console.log("Bot is ready".green);
  }
}
