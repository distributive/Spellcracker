/**
 * A module for supporting the Discord-specific display of WR elements.
 *
 * @file   This files defines the WitchesRevel/discord module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { toTitleCase } from "../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {string} domainId The domain's ID.
 * @return {string} The name of the domain.
 */
export function domainToName(domainId) {
  return toTitleCase(domainId);
}

/**
 * @param {string} domainId The domain's ID.
 * @return {int} The hex code of the domain's color.
 */
export function domainToColor(domainId) {
  let color = process.env.COLOR_ERROR;
  switch (domainId) {
    case "flames":
      color = process.env.COLOR_FLAMES;
      break;
    case "currents":
      color = process.env.COLOR_CURRENTS;
      break;
    case "moonlight":
      color = process.env.COLOR_MOONLIGHT;
      break;
  }
  return +color;
}

/**
 * Cards are colored to match their stitch icon, if any.
 *
 * @param {Object} card A card.
 * @return {int} The hex code of the card's color.
 */
export function cardToColor(card) {
  return card.frontFace.stitchIcon
    ? domainToColor(card.frontFace.stitchIcon)
    : +process.env.COLOR_INFO;
}

/**
 * @param {string} card A card.
 * @return {string} The emoji code for that card's stitch icon.
 */
export function cardToStitchIconEmote(card) {
  switch (card.frontFace.stitchIcon) {
    case "flames":
      return process.env.EMOJI_FLAMES;
    case "currents":
      return process.env.EMOJI_CURRENTS;
    case "moonlight":
      return process.env.EMOJI_MOONLIGHT;
  }
}
