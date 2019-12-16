
import csv from 'csvtojson';
import { ObjectOf } from './type';

export function csvToJson(file: string, delimiter: string = ';') {
    return csv({ delimiter }).fromFile(file);
}


export type Row = ObjectOf<string>;

export function toCsv(json: Row[]) {
    let header: string[] = [];

    for (const row of json) {
        const headers = Object.keys(row);
        if (headers.length > header.length)
            header = headers;
    }

    let csv = header.join(';');

    for (const row of json) {
        const fullRow = {};

        for (const h of header)
            fullRow[ h ] = row[ h ] || '';

        csv += '\n' + Object.values(fullRow).join((';'));
    }

    return csv;
}
