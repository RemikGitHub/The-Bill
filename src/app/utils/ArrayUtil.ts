export default class ArrayUtil {
  static objectsEqual(o1, o2): boolean {
    return JSON.stringify(o1) === JSON.stringify(o2);
  }
}
