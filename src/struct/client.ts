import {
  ApplicationCommandDataResolvable,
  BitFieldResolvable,
  ClientEvents,
  Collection,
  Client as DiscordClient,
  GatewayIntentsString,
  IntentsBitField,
  Partials,
} from "discord.js";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { EventType } from "./types/Event";
import {
  CommandType,
  ComponentsButton,
  ComponentsModal,
  ComponentsRoleSelect,
  ComponentsSelect,
} from "./types/Commands";
config();

const fileFilter = (filename: string) =>
  filename.endsWith(".ts") || filename.endsWith(".js");

export class Client extends DiscordClient {
  public commands: Collection<String, CommandType> = new Collection();
  public buttons: ComponentsButton = new Collection();
  public selects: ComponentsSelect = new Collection();
  public rolesSelectMenu: ComponentsRoleSelect = new Collection();
  public modals: ComponentsModal = new Collection();

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
    this.registerModules();
    this.registerEvents();
    this.login(process.env.TOKEN);
    this.once("ready", this.whenReady);
  }

  private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
    this.application?.commands
      .set(commands)
      .catch((e) =>
        console.log(
          `An error occurred while trying to set the Slash Commands (/): \n${e}`
            .red
        )
      );
  }

  private registerModules() {
    const slashCommands: Array<ApplicationCommandDataResolvable> = new Array();

    const commandsPath = path.join(__dirname, "..", "commands");

    fs.readdirSync(commandsPath).forEach((dir) => {
      fs.readdirSync(commandsPath + `/${dir}/`)
        .filter(fileFilter)
        .forEach(async (fileName) => {
          const command: CommandType = (
            await import(`../commands/${dir}/${fileName}`)
          )?.default;

          const { name, buttons, selects, modals, rolesSelect } = command;

          if (name) {
            this.commands.set(name, command);
            slashCommands.push(command);
            if (buttons)
              buttons.forEach((run, key) => this.buttons.set(key, run));
            if (selects)
              selects.forEach((run, key) => this.selects.set(key, run));
            if (modals) modals.forEach((run, key) => this.modals.set(key, run));
            if (rolesSelect)
              rolesSelect.forEach((run, key) =>
                this.rolesSelectMenu.set(key, run)
              );
          }
        });
    });

    this.on("ready", () => {
      this.registerCommands(slashCommands);
    });
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
