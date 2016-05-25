import React from 'react';
import ReactDOM from 'react-dom';
import Box from './box';

var Boxes = React.createClass({
	propTypes: {
		onDelete: React.PropTypes.func.isRequired
	},
	getDefaultProps() {
		return {
			boxes: []
		};
	},
	_onDelete(isbn) {
		this.props.onDelete(isbn);
	},
	render() {
		var count = 0;
		var boxes = this.props.boxes.map((books) => {
			return <Box books={books} key={"key-" + ++count} onDelete={this._onDelete} />
		});
		return <div className="boxes">{boxes}</div>;
	}
});

export default Boxes;
