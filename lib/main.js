function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Parser = require("./parser");

class Resume {
  constructor(tags, all = false) {
    _defineProperty(this, "resume", require("./renderer"));

    _defineProperty(this, "parser", null);

    _defineProperty(this, "css", resume.css);

    _defineProperty(this, "heading", resume.heading);

    _defineProperty(this, "section", resume.section);

    _defineProperty(this, "sections", resume.sections);

    _defineProperty(this, "entry", resume.entry);

    _defineProperty(this, "render", resume.render);

    _defineProperty(this, "parse", function (pathString) {
      if (path.extname(pathString) == '.json') return parser.parseFile(pathString);else return parser.parseFolder(pathString);
    });

    parser = new Parser(tags, all);
  }

}

module.exports = Resume;