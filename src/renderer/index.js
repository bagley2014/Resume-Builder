const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');
const puppeteer = require('puppeteer');

/********* internal functions *********/
function output(fileName, resume) {
    console.log(`Saving ${fileName}.html`)
    fs.promises.writeFile(fileName + '.html', resume)
        .then(() => {
            console.log(`Saving ${fileName}.pdf`)
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.goto(`file://${process.cwd()}/${fileName}.html`, { waitUntil: 'networkidle0' });

                await page.pdf({
                    path: fileName + '.pdf',
                    format: 'letter',
                    margin: {
                        top: '.4in',
                        right: '.4in',
                        bottom: '.4in',
                        left: '.4in',
                    },
                    printBackground: true
                });

                await browser.close();
            })();
        })
        .then(() => console.log("Save complete"))
}

function generateHTML() {
    return ReactDOMServer.renderToString(
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
            <head>
                <title>Resume</title>
                <link rel="stylesheet" type="text/css" href={exports.css()}></link>
            </head>
            <body>
                {exports.heading()}
                {exports.sections().map((section, index) =>
                    <SectionComponent title={section.title} entries={section.entries} key={index} />
                )}
            </body>
        </html>
    );
}

/********** react components **********/
function SectionComponent(props) {
    return <div>
        <h2>{props.title}</h2>
        {props.entries.map((entry, index) =>
            <Entry date={entry.date} title={entry.title} subtitle={entry.subtitle} bullets={entry.bullets} key={index} />
        )}
    </div>;
}

function Entry(props) {
    return <div>
        <span className="date">{props.date}</span>
        <h3>{props.title}</h3>
        <address>{props.subtitle}</address>
        <ul>{props.bullets.map((bullet, index) =>
            <Bullet title={bullet.title} bulleted={bullet.bulleted} list={bullet.list} text={bullet.text} key={index/*bullet.title || bullet.text || bullet.list[0]*/} />
        )}</ul>
    </div>
}


//TODO: Find a way to rewrite this function to have less repeated html
function Bullet(props) {
    if (props.bulleted) {
        return <li>
            {props.title && <b><u>{props.title} </u></b>}
            <ul className='float-cols'>
                {props.list.map((item, index) =>
                    <ListItem value={item} key={index} bulleted={true} />
                )}
            </ul>
        </li>
    }
    else {
        if (props.text) {
            return <li>
                {props.title && <b>{props.title} </b>}
                <span dangerouslySetInnerHTML={{ __html: props.text }} />
            </li >
        }
        else {
            var content = <span>
                <ListItem value={props.list[0]} key={0} bulleted={false} />
                {props.list.slice(1).map((item) => "<b>&nbsp;|&nbsp;</b>" + item).map((item, index) =>
                    <ListItem value={item} key={index + 1} bulleted={false} />
                )}
            </span>

            return <li>
                {props.title && <b>{props.title} </b>}
                {content}
            </li >
        }
    }
}

function ListItem(props) {
    if (props.bulleted) {
        return <li dangerouslySetInnerHTML={{ __html: props.value }} />
    }
    else {
        return <span className='block' dangerouslySetInnerHTML={{ __html: props.value }} />
    }
}

/************** exports ***************
 * Imagine exports is a synonym for resume
 */

//Getter-setter for the css file
exports.css = function (fileName) {
    exports.css.cssFile = exports.css.cssFile || __dirname + "/../../static/style.css";
    if (!fileName) return exports.css.cssFile;
    else {
        exports.css.cssFile = fileName;
        return exports;
    }
}

//Getter-setter for the heading at the top of the file
//Takes either a htmlstring literal or an object with name/phone/email properties
exports.heading = function (heading) {
    exports.heading.heading = exports.heading.heading || <div></div>
    if (!heading) return exports.heading.heading;
    else {
        if (typeof heading == 'string') {
            exports.heading.heading = <div dangerouslySetInnerHTML={{ __html: heading }} />;
        }
        else {
            exports.heading.heading = <div><h1>{heading.name}</h1>
                <span>
                    <b>Email:</b> {heading.email} <b>&nbsp;|&nbsp;</b>&nbsp;
                <b>Phone:</b> {heading.phone}
                </span>
            </div>
        }
        return exports;
    }
}

//Function to create a new section
exports.section = function (sectionObj) {
    exports.section.sections = exports.section.sections || [];
    for (var i = 0; i < sectionObj.entries.length; i++) {
        sectionObj.entries[i].bullets = sectionObj.entries[i].bullets || [];
    }
    exports.section.sections.push(sectionObj);
    return exports;
}

//Getter function for the list of sections
exports.sections = function () {
    return exports.section.sections || [];
}

//Function to add an entry to the most recent section
exports.entry = function (entryObj) {
    entryObj.bullets = entryObj.bullets || [];
    exports.section.sections[exports.section.sections.length - 1].entries.push(entryObj);
    return exports;
}

//Outputs the resume as both html and pdf
exports.render = function (fileName = "resume") {
    html = generateHTML();
    output(fileName, html);
}