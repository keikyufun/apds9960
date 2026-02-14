//% color=#AA278D icon="\uf0eb" block="APDS9960"
namespace APDS9960 {
    const ADDR = 0x39

    //% block="APDS9960 初期化"
    export function init() {
        // ALS + Proximity + Gesture を有効化
        writeReg(0x80, 0x0D)  // PON + AEN + PEN + GEN
        writeReg(0x81, 0xFF)  // ALS のゲイン
        writeReg(0x8F, 0x01)  // Proximity ゲイン
        writeReg(0x83, 0xFF)  // Gesture の設定（簡易）
    }

    //% block="APDS9960 Clear値"
    export function clear(): number {
        return read16(0x94)
    }

    //% block="APDS9960 赤"
    export function red(): number {
        return read16(0x96)
    }

    //% block="APDS9960 緑"
    export function green(): number {
        return read16(0x98)
    }

    //% block="APDS9960 青"
    export function blue(): number {
        return read16(0x9A)
    }

    //% block="APDS9960 近接値"
    export function proximity(): number {
        return readReg(0x9C)
    }

    // ---------------------------------------------------------
    // 追加①：ジェスチャー読み取り（簡易版）
    // ---------------------------------------------------------

    //% block="APDS9960 ジェスチャー"
    export function gesture(): string {
        // GSTATUS (0xAF) bit0 = GVALID
        let gstatus = readReg(0xAF)
        if ((gstatus & 0x01) == 0) return "none"

        // GFIFO の最初の4バイト（U, D, L, R）
        let u = readReg(0xFC)
        let d = readReg(0xFD)
        let l = readReg(0xFE)
        let r = readReg(0xFF)

        let maxVal = Math.max(u, d, l, r)
        if (maxVal < 30) return "none"

        if (maxVal == u) return "up"
        if (maxVal == d) return "down"
        if (maxVal == l) return "left"
        if (maxVal == r) return "right"

        return "none"
    }

    // ---------------------------------------------------------
    // 追加②：RGB から色名を判定
    // ---------------------------------------------------------

    //% block="APDS9960 色を判定"
    export function detectColor(): string {
        let r = red()
        let g = green()
        let b = blue()

        // 正規化
        let sum = r + g + b
        if (sum == 0) return "unknown"

        let rn = r / sum
        let gn = g / sum
        let bn = b / sum

        // 簡易判定
        if (rn > 0.45 && gn < 0.3) return "red"
        if (gn > 0.45 && rn < 0.3) return "green"
        if (bn > 0.45 && rn < 0.3) return "blue"
        if (rn > 0.33 && gn > 0.33 && bn > 0.33) return "white"
        if (sum < 200) return "black"

        return "unknown"
    }

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
}
