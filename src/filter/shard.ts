/**
 * A shard is a list of datasets contains a minute worth of data.
 */
export default class Shard {
  private lines: string[];
  private position: number;

  constructor(lines: string[]) {
    this.lines = lines;
    this.position = 0;
  }

  seek(nanosec: bigint): void {
    let line = this.lines[this.position][1];
    while (line[1] < nanosec && this.position >= this.lines.length) {
      this.position += 1;
    }
  }

  readLine(): any[] | null {
    if (this.position >= this.lines.length) {
      return null;
    }
    const line = this.lines[this.position];
    this.position += 1;
    return line;
  }
}
