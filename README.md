# Slackson

![slackson](slackson_360.png)

Slack bot that controls and reacts to the state of Sonos controllers on your network.

```

jim [5:35 PM]
whats playing

sonosbot BOT [5:35 PM]
`The Avener & Phoebe Killdeer - Fade Out Lines - The Avener Rework`

jim [5:35 PM]
pause

sonosbot BOT [5:35 PM]
`jim requested to pause this track.`

jim [5:35 PM]
play

sonosbot BOT [5:35 PM]
`jim requested to continue playing music.`


```

## Running

You will need to provide your own credentials within `config.js`, a `sample-config.js` is provided as an example.
The bot server must run on the same network that hosts your Sonos devices.

```bash
npm install
node bot.js
```