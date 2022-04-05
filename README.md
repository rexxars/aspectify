# aspectify

Converts one or more images to a given aspect ratio by cropping.  
Requires node.js >= 14.

## Installation

```
npm install -g aspectify
```

## Usage

```
Usage
  $ aspectify <...files>

Options
  -a, --aspect       Aspect ratio to use (eg: 16:9, 4:3, 1.77) - default is 16:9
  -o, --output       Output filename (default: <filename>.<aspect>.<ext>)
  -r, --replace      Replace the original file
  -w, --max-width    Max width of the image
  -h, --max-height   Max height of the image
  -c, --concurrency  Maximum number of crops to perform simultaneously
  -v, --verbose      Be verbose about operations performed

Examples
  $ aspectify you.jpg
  $ aspectify -o target.png source.png
  $ aspectify -r replace-me.webp
  $ aspectify 1.jpg 2.jpg 3.jpg
  $ aspectify -c 3 *.jpg
  $ apectify -a 16:10 -r -w 2000 *.jpg
```

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
