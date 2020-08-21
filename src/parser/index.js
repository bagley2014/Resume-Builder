const Ajv = require('ajv');
const fs = require('fs')
const path = require('path')
const utils = require('../utils')

/****** Schema validation setup ******/
var ajv = new Ajv({
	allErrors: true
});
var validate = ajv.compile(utils.schema);

function validateJSON(json) {
	var valid = validate(json);
	if (!valid) console.log(validate.errors);
	return valid;
}

/******** Internal fields *******/
_tags = ['generic']
_all = false

/******* Internal functions *******/
var intersection = (a, b) => a.filter(e => b.includes(e));

function isVisible(object) {
	// Visiblility must equal the lack of an exception
	return object.visible == !(intersection(object.exceptions, _tags).length) || _all
}

function datumAdjuster(datum) {
	var result;
	if (isVisible(datum)) {
		//Set result to default option
		datum.options.some(option => {
			if (option.default) {
				result = option.text;
				return option;
			}
		});
		//Grab the first option that has a corresponding tag
		datum.options.some(option => {
			if (!intersection(_tags, option.tags).length) {
				result = option.text;
				return option;
			}
		});
	}
	return result;
}

function bulletAdjuster(bullet) {
	var result;
	if (isVisible(bullet)) {
		result = {
			title: bullet.title,
			text: bullet.text,
			list: bullet.list && bullet.list.filter(isVisible).map((el) => el.text),
			bulleted: bullet.bulleted && bullet.bulleted.default == !intersection(bullet.bulleted.exceptions, _tags).length
		}
	}
	return result;
}

/****** Exports ******/

class Parser {
	constructor(tags, all = false) {
		_tags = tags;
		_all = all;
	}

	parseFile(path) {
		var object = JSON.parse(fs.readFileSync(path))

		var result;
	
		if (validateJSON(object) && isVisible(object)) {
			result = {};
			result.title = datumAdjuster(object.data.title);
			result.subtitle = datumAdjuster(object.data.subtitle);
			result.date = datumAdjuster(object.data.date);
	
			result.bullets = object.data.bullets.map(bulletAdjuster).filter((el) => el)
				.filter((el) => (el.list && el.list.length) || el.text) //Filters out bullets devoid of content
		}
	
		return result;
	}

	parseFolder(folderPath) {
		var result = {};
		var files = fs.readdirSync(folderPath).reverse().filter((file) => path.extname(file) == '.json');

		result.title = folderPath.split("/").pop();
		result.entries = files.map(file => this.parseFile(folderPath + "\\" + file)).filter((el) => el)
		return result;
	}

}

module.exports = Parser;