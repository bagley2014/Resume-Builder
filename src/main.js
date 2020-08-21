var Parser = require("./parser")

class Resume {
    resume = require("./renderer")
    parser = null;

    constructor(tags, all = false) {
        parser = new Parser(tags, all);
    }

    css = resume.css;
    heading = resume.heading;
    section = resume.section;
    sections = resume.sections;
    entry = resume.entry;
    render = resume.render;    

    parse = function (pathString) {
        if (path.extname(pathString) == '.json') return parser.parseFile(pathString);
        else return parser.parseFolder(pathString);
    }
}

module.exports = Resume;