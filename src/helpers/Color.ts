export type RgbaColor = {
  r: number
  g: number
  b: number
  a: number
}

/**
 * Project Colors and helper
 */
export class Color {
  primary = "darkblue"
  background = "white"
  altBackground = "lightgrey"
  highlight = "dodgerblue"
  border = "lightgrey"
  disabled = "grey"
  icon = "grey"
  danger = "red"
  warning = "yellow"
  fallBackColor: RgbaColor = { r: 0, g: 0, b: 0, a: 1 } // aka black

  /**
   * A single function to return various potential color definitions as a unified RGBA value,
   * which is generally easier to work with in JS.
   * I assume we can be responsible and not make me do a lot of parsing, so I only cover the basic color formats (html name, hex, rgb/a)
   * html name -> "white", "blue", etc
   * hex -> #number
   * rgb/a -> rgb(150,150,150), rgba(150,150,150,1)
   * @param colorValue take whatever form the color was entered in and convert it to uniform RGB for easy use
   * @returns returns an RGBA object {r, g, b, a}; black if the conversaion failed
   */
  variableInputToRGBA = (colorValue: string): RgbaColor => {
    // if hex
    if (colorValue.charAt(0) == "#") {
      const hexReturn = this.hexToRgb(colorValue)
      if (hexReturn)
        return {
          r: hexReturn.r,
          g: hexReturn.g,
          b: hexReturn.b,
          a: 1,
        }
      // error is handled in hextoRgb, so don't handle again
      else return this.fallBackColor
      // if rgba
    } else if (colorValue.includes("rgba")) {
      const rgbaReturn = colorValue.substring(4, colorValue.length - 1).split(",") // 2, because we also don't want the trailing paren
      if (rgbaReturn.length < 4) {
        console.error("ERROR: Improperly formatted RGBA value entered")
        return this.fallBackColor
      } else
        return {
          r: Number(rgbaReturn[0]),
          g: Number(rgbaReturn[1]),
          b: Number(rgbaReturn[2]),
          a: Number(rgbaReturn[3]),
        }
      // if rgb
    } else if (colorValue.includes("rgb")) {
      const rgbReturn = colorValue.substring(4, colorValue.length - 1).split(",") // 2, because we also don't want the trailing paren
      if (rgbReturn.length < 3) {
        console.error("ERROR: Improperly formatted RGB value entered")
        return this.fallBackColor
      } else
        return {
          r: Number(rgbReturn[0]),
          g: Number(rgbReturn[1]),
          b: Number(rgbReturn[2]),
          a: 1,
        }
      // catchall for HTML color names, which, if an incorrect name is entered, will still spit out black (0, 0, 0, 1)
    } else {
      const nameReturn = this.nameToRgb(colorValue)
      if (nameReturn) return { r: nameReturn.r, g: nameReturn.g, b: nameReturn.b, a: 1 }
      else return this.fallBackColor
    }
  }

  /**
   * Helper to make my life easier for times when we need a formated string (e.g. for css v-bind's)
   * @param rgbaValue
   * @param returnAlpha optional flag on whether to return the alpha value or not
   * @returns a string representation of the rgba object, of the format "rgba(number,...)"
   */
  toString = (colorValue: RgbaColor, returnAlpha: boolean = false): string => {
    if (returnAlpha) return [colorValue.r, colorValue.g, colorValue.b, colorValue.a].toString()
    else return [colorValue.r, colorValue.g, colorValue.b].toString()
  }

  // simplified method for getting html color values via DOM from https://stackoverflow.com/questions/26414770/getting-the-rgb-values-for-a-css-html-named-color-in-javascript

  /**
   * Normally, the only way to convert the HTML color short-hand name to RGBA would be comparing against a chart
   * Instead, this makes a dummy canvas element and pulls and returns the RGB value from that
   * @param colorName string name of the HTML color
   * @returns returns an RGB object {r:number, g:number, b:number}
   */
  nameToRgb = (colorName: string): RgbaColor | undefined => {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (context) {
      context.fillStyle = colorName
      context.fillRect(0, 0, 1, 1)
      const returnColor = context.getImageData(0, 0, 1, 1).data
      return { r: returnColor[0], g: returnColor[1], b: returnColor[2], a: 1 }
    } else {
      console.error("ERROR: Failed to create temp color element")
    }
  }

  //variable sources and not complex to do custom, but these specific solutions are from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

  /**
   * Convert a HEX color to it's associated RGB values
   * @param hex string representing the hex color (value only or #value)
   * @returns returns an RGB object {r:number, g:number, b:number}
   */
  hexToRgb = (hex: string): RgbaColor | undefined => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (hex.length < 6) {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b
      })
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    } else {
      console.error("ERROR: hex conversion failed, please verify input was a proper hex value")
    }
  }

  /**
   * Convert a RGB color to it's associated hex code
   * Probably not as commonly needed, but added for completeness
   * @param r number representing the red value
   * @param g number representing the green value
   * @param b number representing the blue value
   * @returns hex string of the format "#value"
   */
  rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
  }
}

export default new Color()
