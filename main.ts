namespace APDS9960 {
    const ADDR = 0x39

    function writeReg(reg: number, val: number) {
        const buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = val
        pins.i2cWriteBuffer(ADDR, buf)
    }

    function readReg(reg: number): number {
        pins.i2cWriteNumber(ADDR, reg, NumberFormat.UInt8BE)
        return pins.i2cReadNumber(ADDR, NumberFormat.UInt8BE)
    }

    function read16(lsb: number): number {
        let low = readReg(lsb)
        let high = readReg(lsb + 1)
        return (high << 8) | low
    }

    export function init() {
        writeReg(0x80, 0x03)
        writeReg(0x81, 0xFF)
        writeReg(0x8F, 0x01)
        writeReg(0x83, 0x07)
    }

    export function clear(): number {
        return read16(0x94)
    }

    export function red(): number {
        return read16(0x96)
    }

    export function green(): number {
        return read16(0x98)
    }

    export function blue(): number {
        return read16(0x9A)
    }

    export function proximity(): number {
        return readReg(0x9C)
    }
}
