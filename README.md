# PowerPoint Compressor for NodeJS

A CLI tool to compress PowerPoint files. This script compresses the size of your .pptx presentations, making them easier to store and share. Just run it, choose your file, and watch the tool compress it without losing quality.

## Features

- Go through all images and compress their file size
  All raster images are converted to JPG, excepted PNG images with transparency.  
  Size is restricted to a maximum width or height of 2000 pixels.

- Remove all videos (using a CLI flag)
  The videos are actually not entirely removed but rather replaced by a one black frame video placeholder.  
  This helps simplify the implementation by avoiding having to parse traverse and update the XML content.  
  In the output file, the video preview is preserved, but nothing happens if we click on the play button.

- Remove embeded fonts

## Setup

Using [npm](https://www.npmjs.com/)
```
npm install
```

or

Using [Yarn](https://yarnpkg.com/)
```
yarn install
```

## Requirements

You need to have [7Zip](https://www.7-zip.org) installed because under the hood `unzip` is used to unarchive and archive the pptx files.

## Usage

```
npm run start <INPUT_FILE_PATH> <OUTPUT_FILE_PATH>
```

or

```
yarn start <INPUT_FILE_PATH> <OUTPUT_FILE_PATH>
```

The processed file is written at the given `<OUTPUT_FILE_PATH>`.

Example:  
`npm run start --remove-videos ./examples/example.pptx ./examples/example-reduced.pptx`  
or  
`yarn start --remove-videos ./examples/example.pptx ./examples/example-reduced.pptx`

### Compression Options

- `--remove-videos` Removes all videos.

- `--debug` Duplicate and open the processed file after processing.  
  This makes the feedback loop faster when developing.

## License 

Apache License 2.0: See `LICENSE` file

## Author

Written and maintained by [SlideSpeak.co](https://slidespeak.co)

