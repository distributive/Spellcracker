/**
 * A module for building WR-based Discord embeds.
 *
 * @file   This files defines the WitchesRevel/embed module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";
import { getExpansion } from "./api.js";
import {
  cardToColor,
  cardToStitchIconEmote,
  formatCardText,
} from "./discord.js";
import { toTitleCase } from "../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {Object} card A card.
 * @return {Object} A Discord embed displaying the title, game text, stats, and image of the card.
 */
export function createCardEmbed(card) {
  const url = card.links[0].url;
  const embed = new EmbedBuilder()
    .setColor(cardToColor(card))
    .setTitle(card.frontFace.title)
    .setURL(url)
    .setDescription(cardToEmbedBody(card))
    .setThumbnail(card.images[0].frontFace.scale3x)
    .setFooter({
      text: cardToFooter(card),
    });
  return embed;
}

/**
 * @param {Object} card A card.
 * @return {Object} A Discord embed displaying the title and image of the card.
 */
export function createCardImageEmbed(card) {
  const url = card.links[0].url;
  const embed = new EmbedBuilder()
    .setColor(cardToColor(card))
    .setTitle(card.frontFace.title)
    .setURL(url)
    .setImage(card.images[0].frontFace.scale3x);
  return embed;
}

///////////////////////////////////////////////////////////////////////////////
// PRIVATE

/**
 * @param {Object} card A card.
 * @return {string} A multiline string containing the stats and game text of the card.
 */
function cardToEmbedBody(card) {
  const type = card.frontFace.typeLine;

  const iconEmote = cardToStitchIconEmote(card);
  const stitchIcon = iconEmote ? ` (${iconEmote})` : "";

  const stats = card.frontFace.value
    ? Object.keys(card.frontFace.value)
        .map((key) => {
          toTitleCase(key) + ": " + card.frontFace.value[key];
        })
        .join(" • ")
    : "";

  return `${type}${stitchIcon}${
    stats ? `\n${stats}` : ""
  }\n>>> ${formatCardText(card)}`;
}

/**
 * @param {Object} card A card.
 * @return {string} A single line containing the domain, expansion, and printed position of the card.
 */
function cardToFooter(card) {
  const stitchIcon = card.frontFace.stitchIcon
    ? `${card.frontFace.stitchIcon} • `
    : "";

  const expansionData = Object.values(card.prints.printsByID)[0];
  const expansion = getExpansion(expansionData.expansionID).collationName;

  return `${stitchIcon}${expansion} #${expansionData.id}`;
}
