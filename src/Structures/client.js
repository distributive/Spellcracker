/**
 * The primary module for the bot. This should handle startup.
 *
 * @file   This files defines the top level module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
  Partials,
} from "discord.js";
import { init as initCommands } from "./commands.js";
import { init as initHandler } from "./handler.js";
import { init as initEvents } from "./events.js";
import { init as initWR } from "../WitchesRevel/api.js";
import { loadWhitelist } from "../Permissions/serverWhitelist.js";
import { readBool } from "../Utility/env.js";

///////////////////////////////////////////////////////////////////////////////

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
  presence: {
    activities: [{ name: "/help for help", type: ActivityType.Custom }],
    status: "online",
  },
});

client.commands = new Collection();

///////////////////////////////////////////////////////////////////////////////

export async function start(config) {
  client.config = config;

  // Initialise card data so it can be accessed by commands on initialisation
  console.log("initialising witches revel api...");
  await initWR();

  // Set up whitelist
  if (readBool("WHITELIST_SERVERS")) {
    console.log("server whitelist is enabled; loading saved data...");
    loadWhitelist();
  }

  // Initialise bot features
  console.log("loading commands...");
  await initCommands(client);
  console.log("loading handler...");
  await initHandler(client);
  console.log("loading events...");
  await initEvents(client);

  await client.login(process.env.TOKEN);
}
