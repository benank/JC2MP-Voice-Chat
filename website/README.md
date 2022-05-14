# JC2MP-Voice-Chat

This is a script for Just Cause 2 Multiplayer Mod that enables proximity voice chat. It comes in two parts: the JC2MP script and the website.

Players will get a code ingame that they can enter on the website to connect. Once connected on the website, they will be able to talk to other nearby players.

## Get started

Install the dependencies...

```bash
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run start-dev
```

Navigate to [localhost:3001](http://localhost:3001). You should see your app running. All changes are hot-reloaded.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`.

## Ports

You'll need to make sure access to these ports is properly set up before using it.

The development server runs on port 3001.

The PeerJS server port runs on 2083.

The Express server port runs on port 8080 if in production mode (`npm run build` and `npm run start`).

The socket to JC2MP runs on port 4002.

To connect to your website, you can enter `<your server ip>:8080` to connect, or do some fancier configuration if you want to use a domain name (like I did for [panausurvival.com](https://panausurvival.com))