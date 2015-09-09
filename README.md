# Slackson
Slack bot that controls and reacts to the state of Sonos controllers on your network.

```

jim [5:35 PM]
whats playing

sonosbotBOT [5:35 PM]
`The Avener & Phoebe Killdeer - Fade Out Lines - The Avener Rework`

jim [5:35 PM]
pause

sonosbotBOT [5:35 PM]
`jim requested to pause this track.`

jim [5:35 PM]
play

sonosbotBOT [5:35 PM]
`jim requested to continue playing music.`


```

## Running

You will need to provide your own credentials within `config.js`, a `sample-config.js` is provided as an example.

```bash
npm install
node bot.js
```