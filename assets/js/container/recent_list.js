/*
 * show recent list component on the top page
 */
import * as React from 'react';
import {Flux} from 'flumpt';

export default class RecentList extends Flux {
	render(state) {
		var lists = state.lists.map((list) => {
			return <li key={list}><a href={'/' + list}>{list}</a></li>
		});
		return <ul>{lists}</ul>
	}
};

export default RecentList;
