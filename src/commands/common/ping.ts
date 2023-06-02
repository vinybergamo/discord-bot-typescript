import { Command } from "../../struct/types/Commands";

export default new Command({
  name: "ping",
  description: "Send ping to bot",
  run({ interaction }) {
    interaction.reply({
      ephemeral: true,
      content: "Pong!",
    });
  },
});
