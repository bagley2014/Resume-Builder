function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const path = require('path');

var Parser = require("./parser");

class Resume {
  constructor(tags, all = false) {
    _defineProperty(this, "resume", require("./renderer"));

    _defineProperty(this, "parser", null);

    _defineProperty(this, "css", this.resume.css);

    _defineProperty(this, "heading", this.resume.heading);

    _defineProperty(this, "section", this.resume.section);

    _defineProperty(this, "sections", this.resume.sections);

    _defineProperty(this, "entry", this.resume.entry);

    _defineProperty(this, "render", this.resume.render);

    _defineProperty(this, "parse", function (pathString) {
      if (path.extname(pathString) == '.json') return this.parser.parseFile(pathString);else return this.parser.parseFolder(pathString);
    });

    this.parser = new Parser(tags, all);
  }

}

module.exports = Resume;