# Notes for Reviewers

## Building

**Environment:**

```
OS: Windows 11  
Node: 22.13.1  
npm: 10.9.2
```

**Build steps:**

```sh
# Install dependencies
npm i

# Build the production Firefox version of the extension to packages/anki-jpdb.reader-firefox.xpi
npm run pack firefox
```
