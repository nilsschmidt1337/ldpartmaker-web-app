import {DatKeyword} from './dat-keyword';

export class LDrawParser {
  /**
   * Parses and formats an LDraw text line
   * @param line the plaintext of the current line (without HTML tags, etc.)
   */
  public parse(line: string): string {
    const plainLine = line.replace(/&nbsp;/g, ' ');
    const formattedResult = this.format(line, plainLine);
    return formattedResult;
  }

  private format(line: string, plainLine: string) {
    const trimmedPlaintext = plainLine.trim();
    const dataSegments = trimmedPlaintext.split(/\s+/g);
    if (trimmedPlaintext.startsWith('0')) {
      return this.formatComment(plainLine);
    }
    return line;
  }

  private formatComment(line: string): string {
    line = DatKeyword.formatKeywords(line);
    return '<p style="color:blue">' + line.replace(/ /g, '&nbsp;') + '</p>';
  }
}
