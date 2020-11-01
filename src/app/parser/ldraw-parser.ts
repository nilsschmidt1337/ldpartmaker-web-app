export class LDrawParser {
  /**
   * Parses and formats an LDraw text line
   * @param line the plaintext of the current line (without HTML tags, etc.)
   */
  public parse(line: string): string {
    const trimmedPlaintext = line.replace('&nbsp;', ' ').trim();
    const dataSegments = trimmedPlaintext.split(/\s+/g);
    if (trimmedPlaintext.startsWith('0')) {
      return this.parseComment(line);
    }
    return line;
  }

  private parseComment(line: string): string {
    return '<p style="color:blue">' + line + '</p>';
  }
}
