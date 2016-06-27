/*
 * book.js - a book component
 */
import * as React from 'react';
import {Component} from 'flumpt';
import {MuiThemeProvider, TextField, FloatingActionButton} from 'material-ui';

export const DELETE_BOOK = "delete-book";

export default class Book extends Component {
	/*
	propTypes {
		book: React.PropTypes.shape({
			isbn:  React.PropTypes.string.isRequied,
			url:   React.PropTypes.string.isRequied,
			title: React.PropTypes.string.isRequied,
			pages: React.PropTypes.number.isRequied
		})
	}
	*/

	constructor(...args) {
		super(...args);
		this.state = {deleteStyle: 'hidden'};
	}

	onDelete(e) {
		e.preventDefault();
		this.dispatch(DELETE_BOOK, this.props.book.isbn);
	}

	render() {
		var book = this.props.book;
		return(
			<div className="book"
					onMouseOver={(e) => this.setState({deleteStyle: 'visible'})}
					onMouseOut={(e) => this.setState({deleteStyle: 'hidden'})}>
				<a className="delete-book" href="#"
						style={{visibility: this.state.deleteStyle}}
						onClick={(e) => this.onDelete(e)}>
					{"\u00D7"}
				</a>
				<a className="book-title" href={book.url} target="_blank">{book.title}</a>
				<span className="pages">{book.pages}</span>
			</div>
		);
	}
}

