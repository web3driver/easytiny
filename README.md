
[中文文档](http://yvshuo.me/blog/2017/04/01/2017-04-01-easytiny-1/)

`easytiny` is a simple CLI for compressing jpg/png images by [tinypng](https://tinypng.com/) api.

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=7.x preferred), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ npm install -g easytiny
```

### Config

Set your tinypng api key. Get your api key by visiting [tinypng](https://tinypng.com/developers), 500 images limited every month, but you can register more api keys.
```bash
$ easytiny config set key XXXX-XXXX-XXXXXXXXXXXX
```

Set Proxy
```bash
$ easytiny config set proxy http://user:pass@192.168.0.1:8080
```

### Usage

Run with default mode, no resize and compressed images output into a new `easytiny` folder with a timestamp
``` bash
$ easytiny start
```

Run with overwrite mode, the original images will be overwritten by compressed images
```bash
$ easytiny start --overwrite
```
shorthand for overwrite mode
```bash
$ easytiny start -o
```

Run with resize mode, images will be resized before compressing
```bash
$ easytiny start --resize
```
shorthand for resize mode
```bash
$ easytiny start -r
```

There are three methed for resizing, `scale`、`fit`、 `cover`. You can learn more [here](https://tinypng.com/developers/reference/nodejs).
- scale

Scales the image down proportionally. You must provide either a target width or a target height, but not both. The scaled image will have exactly the provided width or height.
- fit

Scales the image down proportionally so that it fits within the given dimensions. You must provide both a width and a height. The scaled image will not exceed either of these dimensions.
- cover

Scales the image proportionally and crops it if necessary so that the result has exactly the given dimensions. You must provide both a width and a height. Which parts of the image are cropped away is determined automatically. An intelligent algorithm determines the most important areas and leaves these intact.

Overwrite mode and resize mode can be joined together.
```bash
$ easytiny start -ro
```

### Help

Get the main help.
``` bash
$ easytiny -h
```

Get the detail help.
```bash
$ easytiny start -h
$ easytiny config -h
```

### License

[MIT](http://opensource.org/licenses/MIT)
