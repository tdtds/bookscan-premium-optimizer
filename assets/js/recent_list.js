/*
 * react components for top page
 */
import React from 'react';
import ReactDOM from 'react-dom';

var RecentList = React.createClass({
	render() {
		var lists = loadRecentList().map((list) => {
			return <li key={list}><a href={'/' + list}>{list}</a></li>
		});
		return <ul>{lists}</ul>
	}
});

