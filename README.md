On my machine, this produces an "error: malformed debug info file" error:

- `npm install`
- ` npm run-script build`
- `dsymutil build/Release/addon.node`
- `(cd build/Release/ && sentry-cli upload-dif --include-sources addon.node.dSYM --wait)`

It seems to be something related to ffmpeg.
