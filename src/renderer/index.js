const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');
const puppeteer = require('puppeteer');

/******** internal information ********/
var _cssFile = "./static/style.css";
var _heading = <div></div>
var _sections = [];


/********* internal functions *********/
function output(fileName, resume) {
    console.log(`Saving ${fileName}.html`)
    fs.promises.writeFile(fileName + '.html', resume)
        .then(() => {
            (async () => {
                console.log(`Saving ${fileName}.pdf`)
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.goto(`file://${__dirname}/../../${fileName}.html`, { waitUntil: 'networkidle0' });

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
                {exports.sections().map((section) => 
                    <SectionComponent title={section.title} entries={section.entries} key={section.title} />
                )}
            </body>
        </html>
    );
}

/********** react components **********/
function SectionComponent(props) {
    return <div>
        <h2>{props.title}</h2>
        {props.entries.map((entry) => 
            <Entry date={entry.date} title={entry.title} subtitle={entry.subtitle} bullets={entry.bullets} key={entry.title} />
        )}
    </div>;
}

function Entry(props) {
    return <div>
        <span className="date">{props.date}</span>
        <h3>{props.title}</h3>
        <address>{props.subtitle}</address>
        <ul>{props.bullets.map((bullet) => 
            <Bullet title={bullet.title} bulleted={bullet.bulleted} list={bullet.list} text={bullet.text} key={bullet.title || bullet.text || bullet.list[0]} />
        )}</ul>
    </div>
}

function Bullet(props) {
    if (props.bulleted) {
        return <li>
            {props.title && <b><u>{props.title}: </u></b>}
            <ul className='float-cols'>
                {props.list.map((item) => 
                    <ListItem value={item} key={item} bulleted={true} />
                )}
            </ul>
        </li>
    }
    return <li>
        {props.title && <b>{props.title}: </b>}
        {props.list ?
            [<ListItem value={props.list[0]} key={props.list[0]} bulleted={false} />] +
            props.list.slice(1).map((item) => "<b>|</b> " + item).map((item) => 
                <ListItem value={item} key={item} bulleted={false} />
            )
            : props.text}
    </li >
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
    if (!fileName) return _cssFile;
    else {
        _cssFile = fileName;
        return exports;
    }
}

//Getter-setter for the heading at the top of the file
//Takes either a htmlstring literal or an object with name/phone/email properties
exports.heading = function (heading) {
    if (!heading) return _heading;
    else {
        if (typeof heading == 'string') {
            _heading = <div dangerouslySetInnerHTML={{ __html: heading }} />;
        }
        else {
            _heading = <div><h1>{heading.name}</h1>
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
    for(var i = 0; i < sectionObj.entries.length; i++){
        sectionObj.entries[i].bullets = sectionObj.entries[i].bullets || [];
    }
    _sections.push(sectionObj);
    return exports;
}

//Getter function for the list of sections
exports.sections = function () {
    return _sections;
}

//Function to add an entry to the most recent section
exports.entry = function (entryObj) {
    entryObj.bullets = entryObj.bullets || [];
    _sections[_sections.length - 1].entries.push(entryObj);
    return exports;
}

//Outputs the resume as both html and pdf
exports.render = function (fileName = "resume") {
    html = generateHTML();
    output(fileName, html);
}