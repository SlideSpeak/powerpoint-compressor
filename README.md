# PowerPoint file optimizer

This tool takes in a PowerPoint file and process it to lower its size.

## Setup

```
npm install
```

or

```
yarn install
```

### Native dependencies

You need to have [7Zip](https://www.7-zip.org) installed because the `unzip` command is used for now.

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

### Options

- `--remove-videos` Remove all the videos.

- `--debug` Duplicate and open the processed file after processing.  
  This makes the feedback loop faster when developping.

## Features

- [x] Go through all images and optimize their file size  
  All raster images are converted to JPG, excepted PNG images with transparency.  
  Size is restricted to a maximum width or height of 2000 pixels.

- [x] Remove all videos (using a CLI flag)  
  The videos are actually not entirely removed but rather replaced by a one black frame video placeholder.  
  This helps simplify the implementation by avoiding having to parse traverse and update the XML content.  
  In the output file, the video preview is preserved, but nothing happens if we click on the play button.

- [x] Remove embeded fonts
