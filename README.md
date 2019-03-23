# aspectify

Converts one or more images to a given aspect ratio by cropping.  
Requires node.js >= 8.

## Installation

Not yet published to npm. Trying to wrangle my way to the `aspectify` npm module.

## Usage

```
Usage
  $ aspectify <...files>

Options
  -a, --aspect       Aspect ratio to use (eg: 16:9, 4:3, 1.77) - default is 16:9
  -o, --output       Output filename (default: <filename>.<aspect>.<ext>)
  -r, --replace      Replace the original file
  -c, --concurrency  Maximum number of crops to perform simultaneously
  -v, --verbose      Be verbose about operations performed

Examples
  $ aspectify you.jpg
  $ aspectify -o target.png source.png
  $ aspectify -r replace-me.webp
  $ aspectify 1.jpg 2.jpg 3.jpg
  $ aspectify -c 3 *.jpg
```

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
