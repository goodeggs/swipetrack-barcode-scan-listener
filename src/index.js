/* eslint-env browser */

export default {
  /**
   * Listen for SwipeTrack scan with specified characteristics
   * @param  {String} scanCharacteristics.barcodePrefix
   * @param  {RegExp} scanOptions.barcodeValueTest - RegExp defining valid scan value (not including prefix).
   * @param  {Function} scanHandler - called with the results of the scan
   * @return {Function} remove this listener
   */
  onScan ({barcodePrefix, barcodeValueTest} = {}, scanHandler) {
    if (typeof barcodePrefix !== 'string') {
      throw new TypeError('barcodePrefix must be a string');
    }
    if (typeof barcodeValueTest !== 'object' || typeof barcodeValueTest.test !== 'function') {
      throw new TypeError('barcodeValueTest must be a regular expression');
    }
    if (typeof scanHandler !== 'function') {
      throw new TypeError('scanHandler must be a function');
    }

    /**
     * SwipeTrack calls this function, if defined, whenever a barcode is scanned
     * within the SwipeTrack browser.  See "SwipeTrack Browser JavaScript Functions" section of
     * SwipeTrack API: http://swipetrack.net/SwipeTrack-API-v5.pdf
    */
    if (typeof window.stBrowserDidScanBarcode !== 'function') {
      window.stBrowserDidScanBarcode = function (type, barcode) {
        window.stBrowserDidScanBarcode.scanHandlers.forEach((handler) => handler(barcode));
        return true;
      };
      window.stBrowserDidScanBarcode.scanHandlers = [];
    }

    /**
     * `stBrowserDidScanBarcode` was named `onScanAppBarCodeData in the old version
     * of the SwipeTrack API:
     * http://swipetrack.net/support/osfaq.php?cid=3&answer=11
     * If not defined, SwipeTrack throws a ReferenceError on every barcode scan.
     */
    window.onScanAppBarCodeData = undefined;

    const swipeTrackHandler = function (barcode) {
      if (barcode.match(`^${barcodePrefix}`) !== null) {
        const barcodeValue = barcode.slice(barcodePrefix.length);
        if (barcodeValueTest.test(barcodeValue)) {
          scanHandler(barcodeValue);
        }
      }
    };

    window.stBrowserDidScanBarcode.scanHandlers.push(swipeTrackHandler);

    const removeListener = function () {
      const swipeTrackHandlerIndex = window.stBrowserDidScanBarcode.scanHandlers.indexOf(swipeTrackHandler);
      if (swipeTrackHandlerIndex >= 0) {
        window.stBrowserDidScanBarcode.scanHandlers.splice(swipeTrackHandlerIndex, 1);
      }
    };

    return removeListener;
  },
};
