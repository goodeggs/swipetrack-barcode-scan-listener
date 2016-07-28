# SwipeTrack Barcode Scan Listener

Listen for SwipeTrack barcode scan events in the browser.

## Usage
```
npm i swipetrack-barcode-scan-listener --save
```

```js
import swiptrackBarcodeScanListener from 'swipetrack-barcode-scan-listener';

const removeScanListener = swiptrackBarcodeScanListener.onScan({
  barcodePrefix: 'L%',
  barcodeValueTest: /^123.*$/,
}, function (barcode) {
  console.log(barcode);
});

// Now, scanning a barcode 'L%123abc' will log '123abc'
removeScanListener()
```

## Contributing

This module is written in ES2015 and converted to node-friendly CommonJS via
[Babel](http://babeljs.io/).

To compile the `src` directory to `build`:

```
npm run build
```

## Deploying a new version

```
npm version [major|minor|patch]
npm run build
npm publish build # publish the build directory instead of the main directory
git push --follow-tags # update github
```
