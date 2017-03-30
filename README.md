
A simple CLI for compressing jpg/png images by [tinypng]() api.

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=7.x preferred), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ git clone https://github.com/yvshuo/easytiny.git
$ cd easytiny
$ npm install
$ npm link
```

### Config

Set your tinypig api key. Get your api key by visiting [tinypng](https://tinypng.com/developers), 500 images limit every month, but you can register more api keys.
```bash
$ easytiny config set key XXXX-XXXX-XXXXXXXXXXXX
```

### Usage

``` bash
$ easytiny start
```

### Help

``` bash
$ easytiny -h
```

### License

[MIT](http://opensource.org/licenses/MIT)