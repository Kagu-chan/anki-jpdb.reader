# Notes for Reviewers

## Building

**Environment:**

```
OS: Windows 11  
node 24.20.0
npm 11.19.0
```

**Build steps:**

```sh
# Install dependencies
npm i

# Build the production Firefox version of the extension to packages/anki-jpdb.reader-firefox.xpi
npm run pack firefox
```
