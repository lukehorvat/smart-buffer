import { Buffer } from 'buffer';
import { SmartBuffer, SmartBufferOptions } from '../src/smartbuffer';
import { assert } from 'chai';
import 'mocha';

describe('Constructing a SmartBuffer', () => {
    describe('Constructing with an existing Buffer', () => {
        const buff = new Buffer([0xAA, 0xBB, 0xCC, 0xDD, 0xFF, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99]);
        const reader = new SmartBuffer(buff);

        it('should have the exact same internal Buffer when constructed with a Buffer', () => {
            assert.strictEqual(reader.internalBuffer, buff);
        });

        it('should return a buffer with the same content', () => {
            assert.deepEqual(reader.toBuffer(), buff);
        });
    });

    describe('Constructing with an existing Buffer and setting the encoding', () => {
        const buff = new Buffer([0xAA, 0xBB, 0xCC, 0xDD, 0xFF, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99]);
        const reader = new SmartBuffer(buff, 'ascii');

        it('should have the exact same internal Buffer', () => {
            assert.strictEqual(reader.internalBuffer, buff);
        });

        it('should have the same encoding that was set', () => {
            assert.strictEqual(reader.encoding, 'ascii');
        });
    });

    describe('Constructing with a specified size', () => {
        const size = 128;
        const reader = new SmartBuffer(size);

        it('should have an internal Buffer with the same length as the size defined in the constructor', () => {
            assert.strictEqual(reader.internalBuffer.length, size);
        });
    });

    describe('Constructing with a specified encoding', () => {
        const encoding: BufferEncoding = 'utf8';

        it('should have an internal encoding with the encoding given to the constructor (1st argument)', () => {
            const reader = new SmartBuffer(encoding);
            assert.strictEqual(reader.encoding, encoding);
        });

        it('should have an internal encoding with the encoding given to the constructor (2nd argument)', () => {
            const reader = new SmartBuffer(1024, encoding);
            assert.strictEqual(reader.encoding, encoding);
        });

    });

    describe('Constructing with SmartBufferOptions', () => {
        const validOptions1: SmartBufferOptions = {
            size: 1024,
            encoding: 'ascii'
        };

        const validOptions2: SmartBufferOptions = {
            buff: Buffer.alloc(1024)
        };

        const validOptions3: SmartBufferOptions = {
            encoding: 'utf8'
        };

        const invalidOptions1: any = {
            encoding: 'invalid'
        };

        const invalidOptions2: any = {
            size: -1
        };

        const invalidOptions3: any = {
            buff: 'notabuffer'
        };

        it('should create a SmartBuffer with size 1024 and ascii encoding', () => {
            const sbuff = new SmartBuffer(validOptions1);
            assert.strictEqual(sbuff.encoding, validOptions1.encoding);
            assert.strictEqual(sbuff.internalBuffer.length, validOptions1.size);
        });

        it('should create a SmartBuffer with the provided buffer as the initial value', () => {
            const sbuff = new SmartBuffer(validOptions2);
            assert.deepEqual(sbuff.internalBuffer, validOptions2.buff);
        });

        it('should create a SmartBuffer with the provided ascii encoding, and create a default buffer size', () => {
            const sbuff = new SmartBuffer(validOptions3);
            assert.strictEqual(sbuff.encoding, validOptions3.encoding);
            assert.strictEqual(sbuff.internalBuffer.length, 4096);
        });

        it('should throw an error when given an options object with an invalid encoding', () => {
            assert.throws(function () {
                // tslint:disable-next-line:no-unused-variable
                const sbuff = new SmartBuffer(invalidOptions1);
            });
        });

        it('should throw an error when given an options object with an invalid size', () => {
            assert.throws(function () {
                // tslint:disable-next-line:no-unused-variable
                const sbuff = new SmartBuffer(invalidOptions2);
            });
        });

        it('should throw an error when given an options object with an invalid buffer', () => {
            assert.throws(function () {
                // tslint:disable-next-line:no-unused-variable
                const sbuff = new SmartBuffer(invalidOptions3);
            });
        });
    });

    describe('Constructing with invalid parameters', () => {
        it('should throw an exception when given an invalid number size', () => {
            assert.throws(() => {
                // tslint:disable-next-line:no-unused-variable
                const reader = new SmartBuffer(-100);
            }, Error);
        });

        it('should throw an exception when give a invalid encoding', () => {
            assert.throws(() => {
                // tslint:disable-next-line:no-unused-variable
                const reader = new SmartBuffer('invalid');
            }, Error);

            assert.throws(() => {
                const invalidEncoding: any = 'invalid';
                // tslint:disable-next-line:no-unused-variable
                const reader = new SmartBuffer(1024, invalidEncoding);
            }, Error);
        });

        it('should throw and exception when given an object that is not a Buffer', () => {
            assert.throws(() => {
                // tslint:disable-next-line:no-unused-variable
                const reader = new SmartBuffer(null);
            }, Error);
        });
    });

    describe('Constructing with factory methods', () => {
        const originalBuffer = new Buffer(10);

        const sbuff1 = SmartBuffer.fromBuffer(originalBuffer);

        it('Should create a SmartBuffer with a provided internal Buffer as the initial value', () => {
            assert.deepEqual(sbuff1.internalBuffer, originalBuffer);
        });

        const sbuff2 = SmartBuffer.fromSize(1024);

        it('Should create a SmartBuffer with a set provided initial Buffer size', () => {
            assert.strictEqual(sbuff2.internalBuffer.length, 1024);
        });

        const options: any = {
            size: 1024,
            encoding: 'ascii'
        };

        const sbuff3 = SmartBuffer.fromOptions(options);

        it('Should create a SmartBuffer instance with a given SmartBufferOptions object', () => {
            assert.strictEqual(sbuff3.encoding, options.encoding);
            assert.strictEqual(sbuff3.internalBuffer.length, options.size);
        });
    });
});

describe('Reading/Writing To/From SmartBuffer', function () {
    /**
     * Technically, if one of these works, they all should. But they're all here anyways.
     */
    describe('Numeric Values', function () {
        let reader = new SmartBuffer();
        reader.writeInt8(0x44);
        reader.writeUInt8(0xFF);
        reader.writeInt16BE(0x6699);
        reader.writeInt16LE(0x6699);
        reader.writeUInt16BE(0xFFDD);
        reader.writeUInt16LE(0xFFDD);
        reader.writeInt32BE(0x77889900);
        reader.writeInt32LE(0x77889900);
        reader.writeUInt32BE(0xFFDDCCBB);
        reader.writeUInt32LE(0xFFDDCCBB);
        reader.writeFloatBE(1.234);
        reader.writeFloatLE(1.234);
        reader.writeDoubleBE(1.234567890);
        reader.writeDoubleLE(1.234567890);
        reader.writeUInt8(0xC8, 0);
        reader.writeUInt16LE(0xC8, 4);
        reader.insertUInt16LE(0x6699, 6);
        reader.writeUInt16BE(0x6699);
        reader.insertUInt16BE(0x6699, reader.length - 1);

        let iReader = new SmartBuffer();

        iReader.insertInt8(0x44, 0);
        iReader.insertUInt8(0x44, 0);
        iReader.insertInt16BE(0x6699, 0);
        iReader.insertInt16LE(0x6699, 0);
        iReader.insertUInt16BE(0x6699, 0);
        iReader.insertUInt16LE(0x6699, 0);
        iReader.insertInt32BE(0x6699, 0);
        iReader.insertInt32LE(0x6699, 0);
        iReader.insertUInt32BE(0x6699, 0);
        iReader.insertUInt32LE(0x6699, 0);
        iReader.insertFloatBE(0x6699, 0);
        iReader.insertFloatLE(0x6699, 0);
        iReader.insertDoubleBE(0x6699, 0);
        iReader.insertDoubleLE(0x6699, 0);
        iReader.writeStringNT('h', 2);
        iReader.insertBuffer(new Buffer('he'), 2);
        iReader.insertBufferNT(new Buffer('he'), 2);
        iReader.readInt8(0);




        it('should equal the correct values that were written above', function () {
            assert.strictEqual(reader.readUInt8(), 0xC8);
            assert.strictEqual(reader.readUInt8(), 0xFF);
            assert.strictEqual(reader.readInt16BE(), 0x6699);
            assert.strictEqual(reader.readInt16LE(), 0xC8);
            assert.strictEqual(reader.readInt16LE(), 0x6699)
            assert.strictEqual(reader.readUInt16BE(), 0xFFDD);
            assert.strictEqual(reader.readUInt16LE(), 0xFFDD);
            assert.strictEqual(reader.readInt32BE(), 0x77889900);
            assert.strictEqual(reader.readInt32LE(), 0x77889900);
            assert.strictEqual(reader.readUInt32BE(), 0xFFDDCCBB);
            assert.strictEqual(reader.readUInt32LE(), 0xFFDDCCBB);
            assert.closeTo(reader.readFloatBE(), 1.234, 0.001);
            assert.closeTo(reader.readFloatLE(), 1.234, 0.001);
            assert.closeTo(reader.readDoubleBE(), 1.234567890, 0.001);
            assert.closeTo(reader.readDoubleLE(), 1.234567890, 0.001);
            assert.equal(reader.readUInt8(0), 0xC8);
        });


        it('should throw an exception if attempting to read numeric values from a buffer with not enough data left', function () {
            assert.throws(function () {
                reader.readUInt32BE();
            });
        });

        it('should throw an exception if attempting to write numeric values to a negative offset.', function () {
            assert.throws(() => {
                reader.writeUInt16BE(20, -5);
            });
        });

    });

    describe('Basic String Values', function () {
        let reader = new SmartBuffer();
        reader.writeStringNT('hello');
        reader.writeString('world');
        reader.writeStringNT('✎✏✎✏✎✏');
        reader.insertStringNT('first', 0);

        it('should equal the correct strings that were written prior', function () {
            assert.strictEqual(reader.readStringNT(), 'first');
            assert.strictEqual(reader.readStringNT(), 'hello');
            assert.strictEqual(reader.readString(5), 'world');
            assert.strictEqual(reader.readStringNT(), '✎✏✎✏✎✏');
        });
    });

    describe('Mixed Encoding Strings', function () {
        let reader = new SmartBuffer('ascii');
        reader.writeStringNT('some ascii text');
        reader.writeStringNT('ѕσмє υтƒ8 тєχт', 'utf8');
        reader.insertStringNT('first', 0, 'ascii');

        it('should equal the correct strings that were written above', function () {
            assert.strictEqual(reader.readStringNT(), 'first');
            assert.strictEqual(reader.readStringNT(), 'some ascii text');
            assert.strictEqual(reader.readStringNT('utf8'), 'ѕσмє υтƒ8 тєχт');
        });

        it('should throw an error when an invalid encoding is provided', function () {
            assert.throws(function () {
                // tslint:disable-next-line
                const invalidBufferType: any = 'invalid';
                reader.writeString('hello', invalidBufferType);
            });
        })

        it('should throw an error when an invalid encoding is provided along with a valid offset', function () {
            assert.throws(function () {
                const invalidBufferType: any = 'invalid';
                reader.writeString('hellothere', 2, invalidBufferType);
            });
        });
    });

    describe('Null/non-null terminating strings', function () {
        let reader = new SmartBuffer();
        reader.writeString('hello\0test\0bleh');

        it('should equal hello', function () {
            assert.strictEqual(reader.readStringNT(), 'hello');
        });

        it('should equal: test', function () {
            assert.strictEqual(reader.readString(4), 'test');
        });

        it('should have a length of zero', function () {
            assert.strictEqual(reader.readStringNT().length, 0);
        });

        it('should return an empty string', function () {
            assert.strictEqual(reader.readString(0), '');
        });

        it('should equal: bleh', function () {
            assert.strictEqual(reader.readStringNT(), 'bleh');
        });
    });

    describe('Reading string without specifying length', function () {
        let str = 'hello123';
        let writer = new SmartBuffer();
        writer.writeString(str);

        let reader = new SmartBuffer(writer.toBuffer());

        assert.strictEqual(reader.readString(), str);
    });

    describe('Write string as specific position', function () {
        let str = 'hello123';
        let writer = new SmartBuffer();
        writer.writeString(str, 10);

        let reader = new SmartBuffer(writer.toBuffer());

        reader.readOffset = 10;
        it('Should read the correct string from the original position it was written to.', function () {
            assert.strictEqual(reader.readString(), str);
        });


    });

    describe('Buffer Values', function () {
        describe('Writing buffer to position 0', function () {
            let buff = new SmartBuffer();
            let frontBuff = new Buffer([1, 2, 3, 4, 5, 6]);
            buff.writeStringNT('hello');
            buff.writeBuffer(frontBuff, 0);

            it('should write the buffer to the front of the smart buffer instance', function () {
                let readBuff = buff.readBuffer(frontBuff.length);
                assert.deepEqual(readBuff, frontBuff);
            });
        });

        describe('Writing null terminated buffer to position 0', function () {
            let buff = new SmartBuffer();
            let frontBuff = new Buffer([1, 2, 3, 4, 5, 6]);
            buff.writeStringNT('hello');
            buff.writeBufferNT(frontBuff, 0);

            it('should write the buffer to the front of the smart buffer instance', function () {
                let readBuff = buff.readBufferNT();
                assert.deepEqual(readBuff, frontBuff);
            });
        });

        describe('Explicit lengths', function () {
            let buff = new Buffer([0x01, 0x02, 0x04, 0x08, 0x16, 0x32, 0x64]);
            let reader = new SmartBuffer();
            reader.writeBuffer(buff);

            it('should equal the buffer that was written above.', function () {
                assert.deepEqual(reader.readBuffer(7), buff);
            });
        });

        describe('Implicit lengths', function () {
            let buff = new Buffer([0x01, 0x02, 0x04, 0x08, 0x16, 0x32, 0x64]);
            let reader = new SmartBuffer();
            reader.writeBuffer(buff);

            it('should equal the buffer that was written above.', function () {
                assert.deepEqual(reader.readBuffer(), buff);
            });
        });

        describe('Null Terminated Buffer Reading', function () {
            let buff = new SmartBuffer();
            buff.writeBuffer(new Buffer([0x01, 0x02, 0x03, 0x04, 0x00, 0x01, 0x02, 0x03]));

            let read1 = buff.readBufferNT();
            let read2 = buff.readBufferNT();

            it('Should return a length of 4 for the four bytes before the first null in the buffer.', function () {
                assert.equal(read1.length, 4);
            });

            it('Should return a length of 3 for the three bytes after the first null in the buffer after reading to end.', function () {
                assert.equal(read2.length, 3);
            });
        });

        describe('Null Terminated Buffer Writing', function () {
            let buff = new SmartBuffer();
            buff.writeBufferNT(new Buffer([0x01, 0x02, 0x03, 0x04]));

            let read1 = buff.readBufferNT();

            it('Should read the correct null terminated buffer data.', function () {
                assert.equal(read1.length, 4);
            });

        });

        describe('Inserting values into specific positions', function () {
            let reader = new SmartBuffer();

            reader.writeUInt16LE(0x0060);
            reader.writeStringNT('something');
            reader.writeUInt32LE(8485934);
            reader.writeUInt16LE(6699);
            reader.writeStringNT('else');
            reader.insertUInt16LE(reader.length - 2, 2);


            it('should equal the size of the remaining data in the buffer', function () {
                reader.readUInt16LE();
                let size = reader.readUInt16LE();
                assert.strictEqual(reader.remaining(), size);
            });
        });

        describe('Adding more data to the buffer than the internal buffer currently allows.', function () {
            it('Should automatically adjust internal buffer size when needed', function () {
                let writer = new SmartBuffer();
                let largeBuff = new Buffer(10000);

                writer.writeBuffer(largeBuff);

                assert.strictEqual(writer.length, largeBuff.length);
            });
        });

    });


});


describe('Skipping around data', function () {
    let writer = new SmartBuffer();
    writer.writeStringNT('hello');
    writer.writeUInt16LE(6699);
    writer.writeStringNT('world!');

    it('Should equal the UInt16 that was written above', function () {
        let reader = new SmartBuffer(writer.toBuffer());
        reader.readOffset += 6;
        assert.strictEqual(reader.readUInt16LE(), 6699);
        reader.readOffset = 0;
        assert.strictEqual(reader.readStringNT(), 'hello');
        reader.readOffset -= 6;
        assert.strictEqual(reader.readStringNT(), 'hello');
    });

    it('Should throw an error when attempting to skip more bytes than actually exist.', function () {
        let reader = new SmartBuffer(writer.toBuffer());

        assert.throws(function () {
            reader.readOffset = 10000;
        });
    });
});

describe('Setting write and read offsets', () => {
    const writer = SmartBuffer.fromSize(100);
    writer.writeString('hellotheremynameisjosh');

    it('should set the write offset to 10', () => {
        writer.writeOffset = 10;
        assert.strictEqual(writer.writeOffset, 10);
    });

    it('should set the read offset to 10', () => {
        writer.readOffset = 10;
        assert.strictEqual(writer.readOffset, 10);
    });

    it('should throw an error when given an offset that is out of bounds', () => {
        assert.throws(() => {
            writer.readOffset = -1;
        });
    });

    it('should throw an error when given an offset that is out of bounds', () => {
        assert.throws(() => {
            writer.writeOffset = 1000;
        });
    });

});

describe('Setting encoding', () => {
    const writer = SmartBuffer.fromSize(100);
    it('should have utf8 encoding by default', () => {
        assert.strictEqual(writer.encoding, 'utf8');
    });

    it('should have ascii encoding after being set', () => {
        writer.encoding = 'ascii';
        assert.strictEqual(writer.encoding, 'ascii');
    });

})

describe('Automatic internal buffer resizing', function () {
    let writer = new SmartBuffer();

    it('Should not throw an error when adding data that is larger than current buffer size (internal resize algo fails)', function () {
        let str = 'String larger than one byte';
        writer = new SmartBuffer(1);
        writer.writeString(str);

        assert.strictEqual(writer.internalBuffer.length, str.length);

    });

    it('Should not throw an error when adding data that is larger than current buffer size (internal resize algo succeeds)', function () {
        writer = new SmartBuffer(100);
        let buff = new Buffer(105);

        writer.writeBuffer(buff);

        // Test internal array growth algo.
        assert.strictEqual(writer.internalBuffer.length, (100 * 3 / 2 + 1));
    });
});

describe('Clearing the buffer', function () {
    let writer = new SmartBuffer();
    writer.writeString('somedata');

    it('Should contain some data.', function () {
        assert.notStrictEqual(writer.length, 0);
    });

    it('Should contain zero data after being cleared.', function () {
        writer.clear();
        assert.strictEqual(writer.length, 0);
    });
});

describe('Displaying the buffer as a string', function () {
    let buff = new Buffer([1, 2, 3, 4]);
    let sbuff = new SmartBuffer(buff);

    let str = buff.toString();
    let str64 = buff.toString('binary');

    it('Should return a valid string representing the internal buffer', function () {
        assert.strictEqual(str, sbuff.toString());
    });

    it('Should return a valid base64 string representing the internal buffer', function () {

        assert.strictEqual(str64, sbuff.toString('binary'));
    });

    it('Should throw an error if an invalid encoding is provided', function () {
        assert.throws(function() {
            const invalidencoding:any = 'invalid';
            let strError = sbuff.toString(invalidencoding);
        });
    })
});

describe('Destroying the buffer', function () {
    let writer = new SmartBuffer();
    writer.writeString('hello123');

    writer.destroy();

    it('Should have a length of zero when buffer is destroyed', function () {
        assert.strictEqual(0, writer.length);
    });
});

describe('ensureWritable()', function () {
    let sbuff: any = new SmartBuffer(10);

    it('should increase the internal buffer size to accomodate given size.', function () {
        sbuff.ensureWriteable(100);

        assert.strictEqual(sbuff.internalBuffer.length >= 100, true);
    });
});

describe('isSmartBufferOptions()', function () {
    it('should return true when encoding is defined', function () {
        assert.strictEqual(SmartBuffer.isSmartBufferOptions({
            encoding: 'utf8'
        }), true);
    });

    it('should return true when size is defined', function () {
        assert.strictEqual(SmartBuffer.isSmartBufferOptions({
            size: 1024
        }), true);
    });

    it('should return true when buff is defined', function () {
        assert.strictEqual(SmartBuffer.isSmartBufferOptions({
            buff: Buffer.alloc(4096)
        }), true);
    });
});