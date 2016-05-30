/* 日本語
 *
 * list.js - book list app
 *
 * Copyright (C) 2016 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */
import 'babel-polyfill';
import 'whatwg-fetch';
import * as React from 'react';
import {render} from 'react-dom';
import App from './container/app';
import {addRecentList, getURL, loop} from './util';

require('../css/main.css');

let initialState = {
	boxes: [],
	input: {
		submittable: true,
		message: '',
		blink: false
	}
};

const app = new App({
	renderer: el => {
		render(el, document.querySelector('#contents'));
	},
	initialState: initialState
});

addRecentList(document.getElementsByTagName('body')[0].id);

initialState.input = {
	submittable: true,
	message: '書籍データを取得中...',
	blink: true
};
app.update(_initialState => (initialState));
const url = '/' + document.getElementsByTagName('body')[0].id + '/list';
loop(Promise.resolve(url), getURL, 1000, 100).
then(json => {
	initialState.boxes = json;
	initialState.input.message = '';
	initialState.input.blink = false;
	app.update(_initialState => (initialState));
}).
catch(err => console.info('Error: ', err));
