const path = require('path')
var Parser = require("./parser")

class Resume {

    constructor(tags, all = false) {
        this.parser = new Parser(tags, all);

        delete require.cache[require.resolve("./renderer")];

        this.resume = require("./renderer");
        this.css = this.resume.css;
        this.heading = this.resume.heading;
        this.section = this.resume.section;
        this.sections = this.resume.sections;
        this.entry = this.resume.entry;
        this.render = this.resume.render;
    }

    parse = function (pathString) {
        if (path.extname(pathString) == '.json') return this.parser.parseFile(pathString);
        else return this.parser.parseFolder(pathString);
    }
}

module.exports = Resume;