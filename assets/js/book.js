/*
 * react components for list page
 */
import React from 'react';
import ReactDOM from 'react-dom';

var Book = React.createClass({
	propTypes: {
		book: React.PropTypes.shape({
			isbn:  React.PropTypes.string.isRequied,
			url:   React.PropTypes.string.isRequied,
			title: React.PropTypes.string.isRequied,
			pages: React.PropTypes.number.isRequied
		}),
		onDelete:   React.PropTypes.func.isRequired
	},
	getInitialState() {
		return({deleteStyle: 'hidden'});
	},
	onMouseOver(e) {
		this.setState({deleteStyle: 'visible'});
	},
	onMouseOut(e) {
		this.setState({deleteStyle: 'hidden'});
	},
	_onDelete(e) {
		e.preventDefault();
		this.props.onDelete(this.props.book.isbn);
	},
	render() {
		var book = this.props.book;
		return(
			<div className="book" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
				<a className="delete-book" style={{visibility: this.state.deleteStyle}} href="#" onClick={this._onDelete}>{"\u00D7"}</a>
				<a href={book.url} target="_blank"><span>{book.title}</span></a>
				<span className="pages">{book.pages}</span>
			</div>
		);
	}
});

export default Book;
