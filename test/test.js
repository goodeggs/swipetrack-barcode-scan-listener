/* eslint-env goodeggs/server-side-test */
/* eslint-env browser */

import chai from 'chai';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';

import barcodeScanListener from '../build';

chai.use(sinonChai);
chai.use(dirtyChai);
const expect = chai.expect;

const scanBarcode = function (barcode, {scanDuration} = {scanDuration: 100}) {
  const clock = sinon.useFakeTimers();
  const triggerKeypressEvent = function (char) {
    const event = new Event('keypress');
    event.which = char.charCodeAt(0);
    document.dispatchEvent(event);
  };
  barcode.split('').forEach(triggerKeypressEvent);
  clock.tick(scanDuration);
};

describe('swipetrackBarcodeScanListener.onScan()', function () {
  describe('validation', function () {
    it('errors if no barcode prefix', function () {
      const createOnScan = () => barcodeScanListener.onScan({}, sinon.stub());
      expect(createOnScan).to.throw('barcodePrefix must be a string');
    });

    it('errors if barcodeValueTest is not a RegExp', function () {
      const createOnScan = () => barcodeScanListener.onScan({barcodePrefix: 'L%', barcodeValueTest: {}}, sinon.stub());
      expect(createOnScan).to.throw('barcodeValueTest must be a regular expression');
    });

    it('errors if callback not a function', function () {
      const createOnScan = () => barcodeScanListener.onScan({barcodePrefix: 'L%', barcodeValueTest: /.*/}, 5);
      expect(createOnScan).to.throw('scanHandler must be a function');
    });
  });

  it('does not call through to scanHandler if prefix does not match', function () {
    const scanHandler = sinon.stub();
    barcodeScanListener.onScan({
      barcodePrefix: 'L%',
      barcodeValueTest: /.*/,
    }, scanHandler);
    window.onScanAppBarCodeData('S%123abc');
    expect(scanHandler).not.to.have.been.called();
  });

  it('does not call through to scanHandler if test does not match', function () {
    const scanHandler = sinon.stub();
    barcodeScanListener.onScan({
      barcodePrefix: 'L%',
      barcodeValueTest: /^123.*/,
    }, scanHandler);
    window.onScanAppBarCodeData('S%312abc');
    expect(scanHandler).not.to.have.been.called();
  });

  it('calls through to scanHandler if prefix and test match', function () {
    const scanHandler = sinon.stub();
    barcodeScanListener.onScan({
      barcodePrefix: 'L%',
      barcodeValueTest: /^123.*/,
    }, scanHandler);
    window.onScanAppBarCodeData('L%123abc');
    expect(scanHandler).to.have.been.calledOnce();
    expect(scanHandler).to.have.been.calledWith('123abc');
  });

  it('works with multiple listeners', function () {
    const lotScanHandler = sinon.stub();
    barcodeScanListener.onScan({
      barcodePrefix: 'L%',
      barcodeValueTest: /.*/,
    }, lotScanHandler);

    const sheepScanHandler = sinon.stub();
    barcodeScanListener.onScan({
      barcodePrefix: 'S%',
      barcodeValueTest: /.*/,
    }, sheepScanHandler);

    window.onScanAppBarCodeData('L%mylot');
    window.onScanAppBarCodeData('S%mysheep');

    expect(lotScanHandler).to.have.been.calledOnce();
    expect(lotScanHandler).to.have.been.calledWith('mylot');

    expect(sheepScanHandler).to.have.been.calledOnce();
    expect(sheepScanHandler).to.have.been.calledWith('mysheep');
  });

  it('removes the listener on remove', function () {
    const lotScanHandler = sinon.stub();
    const removeListener = barcodeScanListener.onScan({
      barcodePrefix: 'L%',
      barcodeValueTest: /.*/,
    }, lotScanHandler);

    const sheepScanHandler = sinon.stub();
    barcodeScanListener.onScan({
      barcodePrefix: 'S%',
      barcodeValueTest: /.*/,
    }, sheepScanHandler);

    removeListener();

    window.onScanAppBarCodeData('S%123abc');
    expect(sheepScanHandler).to.have.been.calledOnce();

    window.onScanAppBarCodeData('L%123abc');
    expect(lotScanHandler).not.to.have.been.called();
  });
});
