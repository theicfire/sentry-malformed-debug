## Client (runs on MacOS):

SDLWindow object creates a window.
Callbacks for input events are registed (e.g. onMouseUp) and stored on SDLWindow object.
Input loop starts and when it finds a relevant event, calls the callback.
JS layer sends events and their metadata via TCP and UDP to Remote.

`cd ./client`
`npm i` to install dependencies
`npm run build` to compile node addon (anytime you change C++)
`node index.js` to run js

## Remote (runs on Linux):

Listens for TCP and UDP messages.
Passes events to an xdo addon which performs simulation on running Chrome Window.

`cd ./sender`
`npm i` to install dependencies
`npm run build` to build node-addon
Launch a Chrome Window
`npm start`

## Supported Input Events

- Mouse movements (UDP)
- Mouse clicks (TCP)
- Copy/Paste (TCP)
- 2 finger scroll (UDP)
- Keyboard Presses (TCP)
  - Alphanumerics
  - Arrow Keys
  - Backspace, return, tab
  - Command and Shift modifiers
- Window Resizing (TCP)