/*
 * index.js
 *
 * Copyright (C) 2016 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */
import 'babel-polyfill';
import 'whatwg-fetch';
import * as React from 'react';
import {render} from 'react-dom';
import RecentList from './container/recent_list';
import {loadRecentList} from './util';

require('../css/main.css');

const app = new RecentList({
	renderer: el => {
		render(el, document.querySelector('#recent-list'));
	},
	initialState: {lists: []}
});

app.update(_initialState => ({lists: loadRecentList()}));
