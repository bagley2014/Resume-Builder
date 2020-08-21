const React = require('react');

const ReactDOMServer = require('react-dom/server');

const fs = require('fs');

const puppeteer = require('puppeteer');
/******** internal information ********/


var _cssFile = "./static/style.css";

var _heading = /*#__PURE__*/React.createElement("div", null);

var _sections = [];
/********* internal functions *********/

function output(fileName, resume) {
  console.log(`Saving ${fileName}.html`);
  fs.promises.writeFile(fileName + '.html', resume).then(() => {
    (async () => {
      console.log(`Saving ${fileName}.pdf`);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`file://${__dirname}/../../${fileName}.html`, {
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
  })), /*#__PURE__*/React.createElement("body", null, exports.heading(), exports.sections().map(section => /*#__PURE__*/React.createElement(SectionComponent, {
    title: section.title,
    entries: section.entries,
    key: section.title
  })))));
}
/********** react components **********/


function SectionComponent(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, props.title), props.entries.map(entry => /*#__PURE__*/React.createElement(Entry, {
    date: entry.date,
    title: entry.title,
    subtitle: entry.subtitle,
    bullets: entry.bullets,
    key: entry.title
  })));
}

function Entry(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "date"
  }, props.date), /*#__PURE__*/React.createElement("h3", null, props.title), /*#__PURE__*/React.createElement("address", null, props.subtitle), /*#__PURE__*/React.createElement("ul", null, props.bullets.map(bullet => /*#__PURE__*/React.createElement(Bullet, {
    title: bullet.title,
    bulleted: bullet.bulleted,
    list: bullet.list,
    text: bullet.text,
    key: bullet.title || bullet.text || bullet.list[0]
  }))));
}

function Bullet(props) {
  if (props.bulleted) {
    return /*#__PURE__*/React.createElement("li", null, props.title && /*#__PURE__*/React.createElement("b", null, /*#__PURE__*/React.createElement("u", null, props.title, ": ")), /*#__PURE__*/React.createElement("ul", {
      className: "float-cols"
    }, props.list.map(item => /*#__PURE__*/React.createElement(ListItem, {
      value: item,
      key: item,
      bulleted: true
    }))));
  }

  return /*#__PURE__*/React.createElement("li", null, props.title && /*#__PURE__*/React.createElement("b", null, props.title, ": "), props.list ? [/*#__PURE__*/React.createElement(ListItem, {
    value: props.list[0],
    key: props.list[0],
    bulleted: false
  })] + props.list.slice(1).map(item => "<b>|</b> " + item).map(item => /*#__PURE__*/React.createElement(ListItem, {
    value: item,
    key: item,
    bulleted: false
  })) : props.text);
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
  if (!fileName) return _cssFile;else {
    _cssFile = fileName;
    return exports;
  }
}; //Getter-setter for the heading at the top of the file
//Takes either a htmlstring literal or an object with name/phone/email properties


exports.heading = function (heading) {
  if (!heading) return _heading;else {
    if (typeof heading == 'string') {
      _heading = /*#__PURE__*/React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: heading
        }
      });
    } else {
      _heading = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, heading.name), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Email:"), " ", heading.email, " ", /*#__PURE__*/React.createElement("b", null, "\xA0|\xA0"), "\xA0", /*#__PURE__*/React.createElement("b", null, "Phone:"), " ", heading.phone));
    }

    return exports;
  }
}; //Function to create a new section


exports.section = function (sectionObj) {
  for (var i = 0; i < sectionObj.entries.length; i++) {
    sectionObj.entries[i].bullets = sectionObj.entries[i].bullets || [];
  }

  _sections.push(sectionObj);

  return exports;
}; //Getter function for the list of sections


exports.sections = function () {
  return _sections;
}; //Function to add an entry to the most recent section


exports.entry = function (entryObj) {
  entryObj.bullets = entryObj.bullets || [];

  _sections[_sections.length - 1].entries.push(entryObj);

  return exports;
}; //Outputs the resume as both html and pdf


exports.render = function (fileName = "resume") {
  html = generateHTML();
  output(fileName, html);
};