/**
 * A module for fetching data from the Witches' Revel API.
 *
 * @file   This files defines the WitchesRevel/api module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { bestMatch } from "../Utility/fuzzySearch.js";
import { normalise, readId } from "./../Utility/text.js";
import { loadAliases } from "./aliases.js";
import { randomElement } from "../Utility/random.js";

///////////////////////////////////////////////////////////////////////////////
// Init

/**
 * @typedef WrData
 * @type {Object}
 * @property {string[]} normalisedCardTitles - An array of lowercase card titles with special characters removed.
 * @property {Object} normalisedToUnnormalisedCardTitles - A map of normalised card titles to their unmodified versions.
 * @property {Object} acronymsToCardIds - A map of strings to card IDs they are acronyms of.
 * @property {Object} mappedCardTitles - A map of characters to a list of normalised card titles starting with that character.
 * @property {Object} expansions - A map of expansion IDs to expansion API data.
 */

/**
 * An object to store all card data used throughout the bot's lifetime.
 * @type {WrData}
 */
const DATA = {};

/**
 * Initialises the api.
 *
 * This function should be called exactly once (at startup) to initialise data
 * from the API.
 */
export async function init() {
  await loadApiData();
  loadAliases();
}

/**
 * Loads a data object storing all required data from the WR API.
 *
 * This function should be called exactly once (at startup) to initialise and
 * cache the WR data. Some data sets are precalculated here (see the typedef
 * for WrData).
 *
 * The WR API should ideally not be accessed again, except to reload this data.
 */
async function loadApiData() {
  const data = await fetchData(`${process.env.API_URL}cards/all.json`);

  // Cache cards
  DATA.cards = data.cards;
  data.cards.forEach((card) => {
    DATA.cards[readId(card.fullNames.frontFace)] = card;
  });

  // Cache card titles
  DATA.normalisedCardTitles = [];
  DATA.normalisedToUnnormalisedCardTitles = {};
  DATA.acronymsToCardIds = {};
  data.cards.forEach((card) => {
    const normalised = normalise(card.fullNames.frontFace);
    DATA.normalisedCardTitles.push(normalised);
    DATA.normalisedToUnnormalisedCardTitles[normalised] =
      card.fullNames.frontFace;
    const acronym = normalised
      .split(/[ ]/)
      .map((s) => s[0])
      .join("");
    if (!DATA.acronymsToCardIds[acronym]) {
      DATA.acronymsToCardIds[acronym] = card.id;
    }
  });

  // Searchable object of normalised card titles
  // An object where each key is a character whose value is a list of normalised card titles starting with that character
  DATA.mappedCardTitles = {};
  DATA.normalisedCardTitles.forEach((title) => {
    const char = title[0];
    if (DATA.mappedCardTitles[char]) {
      DATA.mappedCardTitles[char].push(title);
    } else {
      DATA.mappedCardTitles[char] = [title];
    }
  });

  // Cache expansion data
  DATA.expansions = {};
  data.expansions.forEach((expansion) => {
    DATA.expansions[expansion.id] = expansion;
  });
}

/**
 * A generic function for fetching data from the API.
 *
 * @param {string} url The URL to fetch the data from.
 * @return {*} The contents of the API page.
 */
export async function fetchData(url) {
  return await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok with url: ${url}`);
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error("Failed to load data from API: " + error);
    });
}

///////////////////////////////////////////////////////////////////////////////
// Cards

/**
 * Finds the card with the title closest to the given string.
 *
 * This function uses Levenshtein distance to find the card whose title most
 * closely matches the given string. It first attempts to limit the search to
 * card titles that contain the input as a leading substring. If there are
 * none, it attempts to limit the search to card titles that contain the input
 * as a substring anywhere. If there are none, it applies the search to the
 * entire card pool.
 *
 * @param {string} input A string to find a card match for.
 * @return {Object} The card whose title most closely matches the input.
 */
export function getClosestCard(input) {
  const query = normalise(input);

  // If the input is all uppercase, attempt to treat it as an acronym
  if (
    query.length > 1 &&
    input.toUpperCase() == input &&
    DATA.acronymsToCardIds[query]
  ) {
    return getCard(DATA.acronymsToCardIds[query]);
  }

  // Regular queries
  const superStrings = DATA.normalisedCardTitles.filter((title) =>
    title.includes(query)
  );
  const leadingStrings = superStrings.filter((title) =>
    title.startsWith(query)
  );
  const name =
    leadingStrings.length > 0
      ? bestMatch(query, leadingStrings)
      : superStrings.length > 0
      ? bestMatch(query, superStrings)
      : bestMatch(query, DATA.normalisedCardTitles);
  const id = readId(name);
  return getCard(id);
}

/**
 * @param {string} cardId A card's ID.
 * @return {Object} The card with the given ID.
 */
export function getCard(cardId) {
  return DATA.cards[cardId];
}

/**
 * @return {string} A randomly selected card ID.
 */
export function getRandomCardId() {
  const randomCard = randomElement(Object.keys(DATA.cards));
  return randomCard;
}

/**
 * @return {Object} A randomly selected card object from the API.
 */
export async function getRandomCard() {
  return getCard(getRandomCardId());
}

/**
 * @return {string[]} The array of every card title in the game, normalised. Do not modify.
 */
export function getNormalisedCardTitles() {
  return DATA.normalisedCardTitles;
}

/**
 * @param {string} input A normalised card title.
 * @return {string} The title of that card in its original form.
 */
export function denormaliseCardTitle(cardTitle) {
  return DATA.normalisedToUnnormalisedCardTitles[cardTitle];
}

/**
 * @param {string} query A card title search query (must be normalised).
 * @return {string} The title of that card in its original form.
 */
export function searchNormalisedCardTitles(query) {
  if (query && query.length > 0) {
    const firstResults = DATA.mappedCardTitles[query[0]];
    if (firstResults) {
      return firstResults.filter((title) => title.startsWith(query));
    }
  }
  return [];
}

///////////////////////////////////////////////////////////////////////////////
// Expansions

/**
 * Gets the expansion with the given ID from the cache.
 *
 * @param {string} expansionId An expansion's ID.
 * @return {Object} The corresponding expansion.
 */
export function getExpansion(expansionId) {
  return DATA.expansions[expansionId];
}

/**
 * Returns the array of all expansions. Do not modify.
 *
 * @return {Object[]} An array of all WR expansions.
 */
export function getAllExpansions() {
  return DATA.expansions;
}
