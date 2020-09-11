/**
 * Specify exchanges as key and their channels as an array of strings.
 */
export type Filter = { [key: string]: string[] };

/**
 * @internal
 */
export function checkParamFilter(objContainingFilter: { [key: string]: any }, attrName: string): void {
  if (!(attrName in objContainingFilter)) throw new Error(`"${attrName}" is undefined, there must be at least one channel to filter.`);
  if (Object.keys(objContainingFilter[attrName]).length === 0) throw new Error(`"${attrName}" must contain at least one channel to filter, found no exchange.`);
  for (const [exchange, channels] of Object.entries(objContainingFilter[attrName])) {
    if (typeof exchange !== 'string') throw new Error(`"${attrName}" must have exchange as key which is string, found ${typeof exchange}.`);
    if (!Array.isArray(channels)) throw new Error(`"${attrName}.${exchange}" must be an array of channels.`);
    if (!channels.every((ch) => typeof ch === 'string')) throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
  }
}