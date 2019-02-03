export class Utils {
  /**
   * Checks if the input value is a date or not.
   * @param {any} input - input to check if is type of Date.
   */
  public isDate(input: any) {
    if (Object.prototype.toString.call(input) === '[object Date]') return true;
    return false;
  }
}
