export function chunks<T>(arr: T[], len: number) {

    var chunks = [],
        i = 0,
        n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}


export const slugify = (str: string) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');




export function camelize(str : string) {
    const a = str.toLowerCase().replace(/[^0-9a-z _-]/gi, '')
        .replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    return a.substring(0, 1).toLowerCase() + a.substring(1);
}


export function padZero(num:number, size:number): string {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
