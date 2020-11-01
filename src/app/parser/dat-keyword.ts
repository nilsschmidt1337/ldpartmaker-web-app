

export class DatKeyword {

  private static keywords: Array<string> = [];

  static formatKeywords(line: string) {
    DatKeyword.initKeywordList();
    for (const keyword of this.keywords) {
      const regExp = new RegExp( keyword , 'gi');
      line = line.replace(regExp, '<b><i>' + keyword + '</i></b>');
    }
    return line;
  }

  private static initKeywordList() {
    if (DatKeyword.keywords.length === 0) {
      DatKeyword.keywords.push('!:');
      DatKeyword.keywords.push('!CATEGORY');
      DatKeyword.keywords.push('!CMDLINE');
      DatKeyword.keywords.push('!COLOUR');
      DatKeyword.keywords.push('!HELP');
      DatKeyword.keywords.push('!HISTORY');
      DatKeyword.keywords.push('!KEYWORDS');
      DatKeyword.keywords.push('!LDRAW_ORG');
      DatKeyword.keywords.push('!LICENSE');
      DatKeyword.keywords.push('!TEXMAP');
      DatKeyword.keywords.push('ALPHA');
      DatKeyword.keywords.push('BFC');
      DatKeyword.keywords.push('CCW');
      DatKeyword.keywords.push('CERTIFY');
      DatKeyword.keywords.push('CHROME');
      DatKeyword.keywords.push('CLIP');
      DatKeyword.keywords.push('CODE');
      DatKeyword.keywords.push('CW');
      DatKeyword.keywords.push('CYLINDRICAL');
      DatKeyword.keywords.push('EDGE');
      DatKeyword.keywords.push('END');
      DatKeyword.keywords.push('FALLBACK');
      DatKeyword.keywords.push('FRACTION ');
      DatKeyword.keywords.push('GLITTER ');
      DatKeyword.keywords.push('GLOSSMAP');
      DatKeyword.keywords.push('INVERTNEXT');
      DatKeyword.keywords.push('LUMINANCE');
      DatKeyword.keywords.push('MATERIAL');
      DatKeyword.keywords.push('MATTE_METALLIC');
      DatKeyword.keywords.push('MAXSIZE');
      DatKeyword.keywords.push('METAL');
      DatKeyword.keywords.push('MINSIZE');
      DatKeyword.keywords.push('NEXT');
      DatKeyword.keywords.push('NOCERTIFY');
      DatKeyword.keywords.push('NOCLIP');
      DatKeyword.keywords.push('PEARLESCENT');
      DatKeyword.keywords.push('PLANAR');
      DatKeyword.keywords.push('RUBBER');
      DatKeyword.keywords.push('SIZE');
      DatKeyword.keywords.push('SPECKLE');
      DatKeyword.keywords.push('SPHERICAL');
      DatKeyword.keywords.push('START');
      DatKeyword.keywords.push('UPDATE');
      DatKeyword.keywords.push('VALUE');
      DatKeyword.keywords.push('VFRACTION');
      DatKeyword.keywords.push('ORIGINAL');
      DatKeyword.keywords.push('STEP');

      DatKeyword.keywords.push('!LPE');

      DatKeyword.keywords.push('TODO');
      DatKeyword.keywords.push('VERTEX');

      DatKeyword.keywords.push('DISTANCE');
      DatKeyword.keywords.push('PROTRACTOR');

      DatKeyword.keywords.push('PNG');

      DatKeyword.keywords.push('INLINE');
      DatKeyword.keywords.push('INLINE_END');

      DatKeyword.keywords.push('CSG_UNION');
      DatKeyword.keywords.push('CSG_DIFFERENCE');
      DatKeyword.keywords.push('CSG_INTERSECTION');
      DatKeyword.keywords.push('CSG_TRANSFORM');

      DatKeyword.keywords.push('DEFAULT');

      DatKeyword.keywords.push('false');
      DatKeyword.keywords.push('true');

      DatKeyword.keywords.push('seg_len=');
      DatKeyword.keywords.push('no_of_tr=');
      DatKeyword.keywords.push('curve=');
      DatKeyword.keywords.push('center=');
      DatKeyword.keywords.push('rot=');
      DatKeyword.keywords.push('comp=');
      DatKeyword.keywords.push('invert=');

      DatKeyword.keywords.push('CSG_EXTRUDE');
      DatKeyword.keywords.push('CSG_EXT_CFG');
      DatKeyword.keywords.push('CSG_MESH');
      DatKeyword.keywords.push('CSG_CUBOID');
      DatKeyword.keywords.push('CSG_ELLIPSOID');
      DatKeyword.keywords.push('CSG_CYLINDER');
      DatKeyword.keywords.push('CSG_CONE');
      DatKeyword.keywords.push('CSG_QUAD');
      DatKeyword.keywords.push('CSG_CIRCLE');
      DatKeyword.keywords.push('CSG_COMPILE');

      DatKeyword.keywords.push('CSG_QUALITY');
      DatKeyword.keywords.push('CSG_EPSILON');
      DatKeyword.keywords.push('CSG_TJUNCTION_EPSILON');
      DatKeyword.keywords.push('CSG_EDGE_COLLAPSE_EPSILON');
      DatKeyword.keywords.push('CSG_DONT_OPTIMIZE');
      DatKeyword.keywords.push('CSG_DONT_OPTIMISE');
    }
  }
}
