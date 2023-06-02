import {
  ApplicationCommandData,
  ButtonInteraction,
  Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import { Client } from "../client";

interface CommandProps {
  client: Client;
  interaction: CommandInteraction;
  options: CommandInteractionOptionResolver;
}

export type ComponentsButton = Collection<
  string,
  (interaction: ButtonInteraction) => any
>;
export type ComponentsSelect = Collection<
  string,
  (interaction: StringSelectMenuInteraction) => any
>;
export type ComponentsRoleSelect = Collection<
  string,
  (interaction: RoleSelectMenuInteraction) => any
>;
export type ComponentsModal = Collection<
  string,
  (interaction: ModalSubmitInteraction) => any
>;

interface CommandComponents {
  buttons?: ComponentsButton;
  selects?: ComponentsSelect;
  modals?: ComponentsModal;
  rolesSelect?: ComponentsRoleSelect;
}

export type CommandType = ApplicationCommandData &
  CommandComponents & {
    run(interaction: CommandProps): any;
  };

export class Command {
  constructor(options: CommandType) {
    options.dmPermission = false;
    Object.assign(this, options);
  }
}
