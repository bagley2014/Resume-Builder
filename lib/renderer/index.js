const React = require('react');

const ReactDOMServer = require('react-dom/server');

const fs = require('fs');

const puppeteer = require('puppeteer');
/********* internal functions *********/


function output(fileName, resume) {
  console.log(`Saving ${fileName}.html`);
  fs.promises.writeFile(fileName + '.html', resume).then(() => {
    (async () => {
      console.log(`Saving ${fileName}.pdf`);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`file://${process.cwd()}/${fileName}.html`, {
        waitUntil: 'networkidle0'
      });
      await page.pdf({
        path: fileName + '.pdf',
        format: 'letter',
        margin: {
          top: '.4in',
          right: '.4in',
          bottom: '.4in',
          left: '.4in'
        },
        printBackground: true
      });
      await browser.close();
    })();
  }).then(() => console.log("Save complete"));
}

function generateHTML() {
  return ReactDOMServer.renderToString( /*#__PURE__*/React.createElement("html", {
    xmlns: "http://www.w3.org/1999/xhtml",
    lang: "en"
  }, /*#__PURE__*/React.createElement("head", null, /*#__PURE__*/React.createElement("title", null, "Resume"), /*#__PURE__*/React.createElement("link", {
    rel: "stylesheet",
    type: "text/css",
    href: exports.css()
  })), /*#__PURE__*/React.createElement("body", null, exports.heading(), exports.sections().map((section, index) => /*#__PURE__*/React.createElement(SectionComponent, {
    title: section.title,
    entries: section.entries,
    key: index
  })))));
}
/********** react components **********/


function SectionComponent(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, props.title), props.entries.map((entry, index) => /*#__PURE__*/React.createElement(Entry, {
    date: entry.date,
    title: entry.title,
    subtitle: entry.subtitle,
    bullets: entry.bullets,
    key: index
  })));
}

function Entry(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "date"
  }, props.date), /*#__PURE__*/React.createElement("h3", null, props.title), /*#__PURE__*/React.createElement("address", null, props.subtitle), /*#__PURE__*/React.createElement("ul", null, props.bullets.map((bullet, index) => /*#__PURE__*/React.createElement(Bullet, {
    title: bullet.title,
    bulleted: bullet.bulleted,
    list: bullet.list,
    text: bullet.text,
    key: index
    /*bullet.title || bullet.text || bullet.list[0]*/

  }))));
} //TODO: Find a way to rewrite this function to have less repeated html


function Bullet(props) {
  if (props.bulleted) {
    return /*#__PURE__*/React.createElement("li", null, props.title && /*#__PURE__*/React.createElement("b", null, /*#__PURE__*/React.createElement("u", null, props.title, " ")), /*#__PURE__*/React.createElement("ul", {
      className: "float-cols"
    }, props.list.map((item, index) => /*#__PURE__*/React.createElement(ListItem, {
      value: item,
      key: index,
      bulleted: true
    }))));
  } else {
    if (props.text) {
      return /*#__PURE__*/React.createElement("li", null, props.title && /*#__PURE__*/React.createElement("b", null, props.title, " "), /*#__PURE__*/React.createElement("span", {
        dangerouslySetInnerHTML: {
          __html: props.text
        }
      }));
    } else {
      var content = /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(ListItem, {
        value: props.list[0],
        key: 0,
        bulleted: false
      }), props.list.slice(1).map(item => "<b>&nbsp;|&nbsp;</b>" + item).map((item, index) => /*#__PURE__*/React.createElement(ListItem, {
        value: item,
        key: index + 1,
        bulleted: false
      })));
      return /*#__PURE__*/React.createElement("li", null, props.title && /*#__PURE__*/React.createElement("b", null, props.title, " "), content);
    }
  }
}

function ListItem(props) {
  if (props.bulleted) {
    return /*#__PURE__*/React.createElement("li", {
      dangerouslySetInnerHTML: {
        __html: props.value
      }
    });
  } else {
    return /*#__PURE__*/React.createElement("span", {
      className: "block",
      dangerouslySetInnerHTML: {
        __html: props.value
      }
    });
  }
}
/************** exports ***************
 * Imagine exports is a synonym for resume
 */
//Getter-setter for the css file


exports.css = function (fileName) {
  exports.css.cssFile = exports.css.cssFile || __dirname + "/../../static/style.css";
  if (!fileName) return exports.css.cssFile;else {
    exports.css.cssFile = fileName;
    return exports;
  }
}; //Getter-setter for the heading at the top of the file
//Takes either a htmlstring literal or an object with name/phone/email properties


exports.heading = function (heading) {
  exports.heading.heading = exports.heading.heading || /*#__PURE__*/React.createElement("div", null);
  if (!heading) return exports.heading.heading;else {
    if (typeof heading == 'string') {
      exports.heading.heading = /*#__PURE__*/React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: heading
        }
      });
    } else {
      exports.heading.heading = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, heading.name), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Email:"), " ", heading.email, " ", /*#__PURE__*/React.createElement("b", null, "\xA0|\xA0"), "\xA0", /*#__PURE__*/React.createElement("b", null, "Phone:"), " ", heading.phone));
    }

    return exports;
  }
}; //Function to create a new section


exports.section = function (sectionObj) {
  exports.section.sections = exports.section.sections || [];

  for (var i = 0; i < sectionObj.entries.length; i++) {
    sectionObj.entries[i].bullets = sectionObj.entries[i].bullets || [];
  }

  exports.section.sections.push(sectionObj);
  return exports;
}; //Getter function for the list of sections


exports.sections = function () {
  return exports.section.sections || [];
}; //Function to add an entry to the most recent section


exports.entry = function (entryObj) {
  entryObj.bullets = entryObj.bullets || [];
  exports.section.sections[exports.section.sections.length - 1].entries.push(entryObj);
  return exports;
}; //Outputs the resume as both html and pdf


exports.render = function (fileName = "resume") {
  html = generateHTML();
  output(fileName, html);
};