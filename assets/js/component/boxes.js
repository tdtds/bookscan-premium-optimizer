/*
 * boxes.js - boxs component contains some boxes
 */
import * as React from 'react';
import {Component} from 'flumpt';
import Box from './box';

export default class Boxes extends Component {
	render() {
		var count = 0;
		var boxes = this.props.boxes.map((books) => {
			return <Box books={books} key={"key-" + ++count} />
		});
		return <div className="boxes">{boxes}</div>;
	}
}

