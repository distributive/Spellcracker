A card-fetching Discord bot for the card game [Witches' Revel](https://witches-revel.games).

## Client use

This bot supports a number of interactions (slash commands) and some inline commands:

### Searching for Witches' Revel cards

You can fetch cards by including the following in a Discord message:

- [[card]] to view a card
- {{card}} to view its art

Each Discord message is limited to 5 (by default) inline commands. Any additional commands will be ignored.

## Server use

### Running the bot

```bash
cp .env.example .env # You will need to add your application token and bot ID to the new file
npm install
node index.js
```

## Acknowledgements

This software is based on the template [Slash Bot Template](https://github.com/GuriZenit/slash-bot-template) by GuriZenit.
