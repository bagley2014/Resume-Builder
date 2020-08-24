const path = require('path')
var Parser = require("./parser")

class Resume {
    resume = require("./renderer")
    parser = null;

    constructor(tags, all = false) {
        this.parser = new Parser(tags, all);
    }

    css = this.resume.css;
    heading = this.resume.heading;
    section = this.resume.section;
    sections = this.resume.sections;
    entry = this.resume.entry;
    render = this.resume.render;    

    parse = function (pathString) {
        if (path.extname(pathString) == '.json') return this.parser.parseFile(pathString);
        else return this.parser.parseFolder(pathString);
    }
}

module.exports = Resume;