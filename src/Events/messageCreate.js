/**
 * A module for responding to messages sent in servers containing this bot.
 *
 * @file   This files defines the message-response module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { applyAlias } from "../WitchesRevel/aliases.js";
import { getClosestCard } from "./../WitchesRevel/api.js";
import {
  createCardEmbed,
  createCardImageEmbed,
} from "./../WitchesRevel/embed.js";

///////////////////////////////////////////////////////////////////////////////

import { readBool } from "../Utility/env.js";
import { logError } from "../Utility/error.js";
import * as wl from "../Permissions/serverWhitelist.js";

///////////////////////////////////////////////////////////////////////////////

export default async function execute(message) {
  const { author, content } = message;

  // Ignore bot/empty messages
  if (author.bot || !content) {
    return;
  }

  // If the whitelist is active, and we're in a server, check the server is whitelisted
  if (
    message.guildId &&
    readBool("WHITELIST_SERVERS") &&
    !wl.isServerWhitelisted(message.guildId)
  ) {
    return;
  }

  // If the message was posted in a DM, check DMs are enabled
  if (!message.guildId && !readBool("ALLOW_DIRECT_MESSAGES")) {
    return;
  }

  // Parse the message
  parseInlineCommands(message).catch(logError);
}

///////////////////////////////////////////////////////////////////////////////

/**
 * Parses a Discord message for inline commands and generates responses.
 *
 * @param {Object} message A Discord message.
 */
async function parseInlineCommands(message) {
  const { client, content } = message;

  const filteredContent = content.replace(/(?<!\\)```[\s\S]*?```/g, ""); // Ignore code blocks
  const regex = /\[\[.*?\]\]|\{\{.*?\}\}|<<.*?>>/g; // Find inline commands
  const matches = filteredContent.match(regex);

  // Ignore messages with no commands
  if (!matches) {
    return;
  }

  const channel = client.channels.cache.get(message.channelId);

  // Pass the parser a list to update with the card that gets fetched
  // If the card is already in the list, do not display it again
  let cards = [];

  // Limit number of card embeds per message
  let countdown = process.env.RESULT_LIMIT;

  // Parse each command
  for (const match of matches) {
    if (countdown < 1) {
      return;
    }

    const rawInput = match.substring(2, match.length - 2).trim();

    // Ignore empty inputs and excessively long inputs
    if (!rawInput || rawInput.length > 255) {
      return;
    }

    const success = parseCard(match, rawInput, channel, cards);
    if (success) {
      countdown--;
    }
  }
}

/**
 * Parses an inline command requesting a card and generates a respose.
 *
 * @param {string} match The full inline command matched (includes brackets).
 * @param {string} query The contents of the command (excludes brackets).
 * @param {Object} channel The Discord channel to send the response to.
 * @param {string[]} previousCards An array of card IDs already parsed from this message to avoid reposting any. Must be updated within.
 * @return {bool} Whether a card embed was successfully sent.
 */
async function parseCard(match, query, channel, previousCards) {
  const card = getClosestCard(applyAlias(query));

  // Ensure a card was found
  if (!card) {
    logError(new Error(`Card not found with query "${rawInput}"`));
    return false;
  }

  // Do not post more than one copy of each card per message
  if (previousCards.includes(card.id)) {
    return false;
  }
  previousCards.push(card.id);

  // Create and send embed
  const outEmbed =
    match[0] == "[" ? createCardEmbed(card) : createCardImageEmbed(card);
  channel.send({ embeds: [outEmbed] });

  return true;
}
