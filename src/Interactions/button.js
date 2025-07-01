/**
 * A module for handling the registration and handling of button interactions.
 *
 * @file   This files defines the Interactions/button module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////

const BUTTONS = {}; // Persistent data

/**
 * @name ButtonCallback
 * @function
 * @param {Object} originalInteraction The interaction that registered the button.
 * @param {Object} buttonInteraction The interaction sent by the button.
 */

/**
 * Register a button on creation with its callback function.
 *
 * @param {Object} interaction The interaction that registered the button.
 * @param {string} buttonId A unique identifier for the button (must be unique to the original interaction).
 * @param {ButtonCallback} callback The function to call when the button is pressed.
 */
export function registerButton(interaction, buttonId, callback) {
  BUTTONS[buttonId] = {
    parentInteraction: interaction,
    callback: callback,
  };
}

/**
 * When a button interaction is detected, this can map it to its callback.
 *
 * @param {Object} interaction The interaction sent by the button.
 * @param {string} buttonId The unique identifier for the button.
 */
export function callButton(interaction, buttonId) {
  if (BUTTONS[buttonId]) {
    BUTTONS[buttonId].callback(
      BUTTONS[buttonId].parentInteraction,
      interaction
    );
    delete BUTTONS[buttonId];
  } else {
    const embed = new EmbedBuilder() // TODO: add error module
      .setColor(+process.env.COLOR_ERROR)
      .setTitle("Button Interaction Failed!")
      .setDescription(
        "This button interaction failed. It is possible it has expired."
      );
    interaction.client.reply({ embeds: [embed], ephemeral: true });
  }
}
