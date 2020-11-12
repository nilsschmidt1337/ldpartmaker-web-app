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
    if (dataSegments.length > 0) {
      if (dataSegments[0].length > 1) {
        dataSegments[0] = '-1';
      }
      const lineTypeNumber = Number(dataSegments[0]);
      switch (lineTypeNumber) {
        case 0:
          return this.formatComment(plainLine);
          break;
        case 3:
          return this.formatTriangle(plainLine, dataSegments);
          break;
        default:
          return this.formatInvalidLineType(plainLine);
          break;
      }
    }
    return line;
  }

  private formatComment(line: string): string {
    line = DatKeyword.formatKeywords(line);
    return '<p style="color:blue">' + this.replaceNbsp(line) + '</p>';
  }

  private formatTriangle(line: string, data: string[]): string {
    let result = '';
    const whitespaceSegments = line.split(/\S+/g);
    let i = 0;
    for (const entry of data) {
      if (whitespaceSegments.length > i) {
        result += this.replaceNbsp(whitespaceSegments[i]);
      }
      if (i === 0) {
        result += entry;
      } else if (i === 1) {
        result += '<a style="border: solid black 1px">' + entry + '</a>';
      } else if ((i > 1 && i < 5) || (i > 7 && i < 11) ) {
        result += '<a style="color:darkred">' + entry + '</a>';
      } else if (i > 4 && i < 8) {
        result += '<a style="color:darkgreen">' + entry + '</a>';
      } else {
        result += entry;
      }
      i++;
    }
    if (whitespaceSegments.length > i) {
      result += this.replaceNbsp(whitespaceSegments[i]);
    }
    return result;
  }

  private formatInvalidLineType(line: string): string {
    return '<p style="text-decoration: underline wavy red">' + this.replaceNbsp(line) + '</p>';
  }

  private replaceNbsp(line: string): string {
    return line.replace(/ /g, '&nbsp;');
  }
}
