const Ajv = require('ajv');

const fs = require('fs');

const path = require('path');

const utils = require('../utils');
/****** Schema validation setup ******/


var ajv = new Ajv({
  allErrors: true
});
var validate = ajv.compile(utils.schema);

function validateJSON(json) {
  var valid = validate(json);
  if (!valid) console.log(validate.errors);
  return valid;
} //TODO: Set the schema up to not allow any properties I did not expressly allow

/******** Internal fields *******/


_tags = ['generic'];
_all = false;
/******* Internal functions *******/

var intersection = (a, b) => a.filter(e => b.includes(e)); //function isVisible(object, tags) {
//	// Visiblility must equal the lack of an exception
//	return object && (object.visible == !(intersection(object.exceptions, tags).length) || _all)
//}


function isVisible(tags) {
  return object => {
    // Visiblility must equal the lack of an exception
    return object && (object.visible == !intersection(object.exceptions, tags).length || _all);
  };
}

function datumAdjuster(datum, tags) {
  var result;

  if (isVisible(tags)(datum)) {
    //Set result to default option
    datum.options.some(option => {
      if (option.default) {
        result = option.text;
        return option;
      }
    }); //Grab the first option that has a corresponding tag

    datum.options.some(option => {
      if (!intersection(tags, option.tags).length) {
        result = option.text;
        return option;
      }
    });
  }

  return result;
}

function bulletAdjuster(bulletCache, tags) {
  return bullet => {
    if (bullet.title) bulletCache[bullet.title] = bullet.list && bullet.list.filter(isVisible(tags)).map(el => el.text);
    var result;

    if (isVisible(tags)(bullet)) {
      result = {
        title: bullet.title || (bullet.list && bullet.list.length > 1 ? bullet.title_plural : bullet.title_singular),
        text: bullet.text,
        list: bullet.list && bullet.list.filter(isVisible(tags)).map(el => el.text),
        bulleted: bullet.bulleted && bullet.bulleted.default == !intersection(bullet.bulleted.exceptions, tags).length
      };

      if (bullet.refs) {
        //console.log(bullet.refs)
        //console.log(bulletCache)
        result.list = result.list || [];
        bullet.refs.forEach(ref => {
          //console.log(bulletCache[ref])
          if (bulletCache[ref]) result.list = result.list.concat(bulletCache[ref]);
        });
        result.list = result.list.length ? result.list : undefined; //console.log(result.list)
      }
    }

    return result;
  };
}
/****** Exports ******/


class Parser {
  constructor(tags, all = false) {
    this.tags = tags;
    this.all = all;
  }

  parseFile(path) {
    var object = JSON.parse(fs.readFileSync(path));
    var result;

    if (validateJSON(object) && isVisible(this.tags)(object)) {
      result = {};
      result.title = datumAdjuster(object.data.title, this.tags);
      result.subtitle = datumAdjuster(object.data.subtitle, this.tags);
      result.date = datumAdjuster(object.data.date, this.tags);
      var bulletCache = {};
      result.bullets = object.data.bullets.map(bulletAdjuster(bulletCache, tags)).filter(el => el).filter(el => el.list && el.list.length || el.text); //Filters out bullets devoid of content
    }

    return result;
  }

  parseFolder(folderPath) {
    var result = {};
    var files = fs.readdirSync(folderPath).reverse().filter(file => path.extname(file) == '.json');
    result.title = folderPath.split("/").pop();
    result.entries = files.map(file => this.parseFile(folderPath + "/" + file)).filter(el => el);
    return result;
  }

}

module.exports = Parser;