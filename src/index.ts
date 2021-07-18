import fs from 'fs';
import readline from 'readline';
import { parseLine } from 'teeny-csv';
import { isNonNull } from './utils';

export type ParsedRow<K extends string = string> = { [Key in K]: string };

export interface ParseFileOptions<H extends string> {
  headers?: H[];
}

export const parseFile = async <H extends string = string>(
  p: string,
  { headers }: ParseFileOptions<H> = {},
): Promise<ParsedRow<H>[]> => {
  const rs = fs.createReadStream(p, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: rs });

  const it = rl[Symbol.asyncIterator]();
  const { value } = await it.next();
  const rows: ParsedRow<H>[] = [];
  const parsedHeaders = parseLine(value);

  for await (const line of it) {
    const result = parseLine(line);
    const row: ParsedRow<string> = Object.fromEntries(
      parsedHeaders
        .map((header, i) => (header ? [header, result[i]] : null))
        .filter(isNonNull),
    );
    const curatedRow: ParsedRow<H> = headers
      ? Object.fromEntries(headers.map(header => [header, row[header] ?? '']))
      : row;
    rows.push(curatedRow);
  }

  return rows;
};
