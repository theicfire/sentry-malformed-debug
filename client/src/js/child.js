/**
 *
 * We use a child process because the SDL event loop blocks CPU
 * which is required to send UDP packets.
 *
 * When the child process is called back from the node-addon, it
 * sends a message to the parent process.
 *
 */

const { SDLWindow, SDLUtils } = require('bindings')('addon');

const WindowWidth = 500,
  WindowHeight = 500;

const utils = new SDLUtils();

const window = new SDLWindow(WindowWidth, WindowHeight);

window.onMouseMove((x, y) => {
  process.send({ mode: 'UDP', type: 'MOUSE_MOVE', value: { x: x, y: y } });
});

window.onMouseUp((button) => {
  process.send({ mode: 'TCP', type: 'MOUSE_UP', value: { value: button } });
});

window.onMouseDown((button) => {
  process.send({ mode: 'TCP', type: 'MOUSE_DOWN', value: { value: button } });
});

window.onResizeWindow((width, height) => {
  process.send({ mode: 'TCP', type: 'RESIZE_WINDOW', value: { width, height } });
});

window.onMouseScroll((x, y) => {
  process.send({ mode: 'UDP', type: 'MOUSE_SCROLL', value: { x, y } });
});

/**
 * xdo is the tool we use on the remote side to simulate keyboard events.
 * It has xdo_send_keysequence_window command which takes a keysequence
 * Keysequence can be one or more X11 Key Symbols joined with a '+'
 * For instance, ctrl+a would simulate ctrl and 'a' pressed at same time
 * You can also pass unicode in place of key symbols
 * For instance, a = U0064
 *
 * One catch is that users will be on Mac pressing Mac modifiers which
 * have different effects on Linux. For instance, pressing ctrl+a on Mac
 * moves cursor to beginning of line, while on Linux it highlights all text.
 *
 * Mac also has cmd key which does nothing on Linux.
 * Mac ctrl+a = ctrl+shift+a on linux
 */
window.onKeyPress(
  ({ tab, backspace, unicode, returnKey, cmd, ctrl, shift, alt, left, right, up, down }) => {
    // Restrict certain modifiers

    if (ctrl || alt) return;

    const cmd_w = cmd && unicode === 113; // close current tab
    const cmd_shift_w = cmd && shift && unicode === 113; // close current window
    const cmd_q = cmd && unicode === 119;
    const cmd_n = cmd && unicode === 110;
    const cmd_o = cmd && unicode === 111; // opens file in chrome
    const cmd_shift_n = cmd && shift && unicode === 110; // incognito
    if (cmd_w || cmd_q || cmd_n || cmd_shift_n || cmd_shift_w || cmd_o) {
      return;
    }

    // Intercept paste. Send different type of event to host.

    if (cmd && unicode === 118) {
      const clipboardText = utils.getClipboardText();
      return process.send({ mode: 'TCP', type: 'ENTER_TEXT', value: { value: clipboardText } });
    }

    // Build xdo keysequence and send to host

    const prefixCmdShift = (value) => {
      if (cmd) value = `ctrl+${value}`;
      if (shift) value = `shift+${value}`;
      return value;
    };

    if (backspace) {
      value = 'BackSpace';
    } else if (returnKey) {
      value = 'Return';
    } else if (tab) {
      value = 'Tab';
    } else if (left) {
      value = prefixCmdShift('Left');
    } else if (right) {
      value = prefixCmdShift('Right');
    } else if (up) {
      value = prefixCmdShift('Up');
    } else if (down) {
      value = prefixCmdShift('Down');
    } else if (unicode) {
      value = prefixCmdShift(`U${unicode.toString(16).padStart(4, '0')}`);
    }

    process.send({ mode: 'TCP', type: 'KEY_PRESS', value: { value } });
  },
);

window.startInputLoop();
