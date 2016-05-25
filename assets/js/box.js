import React from 'react';
import ReactDOM from 'react-dom';
import Book from './book';

var Box = React.createClass({
	propTypes: {
		onDelete:   React.PropTypes.func.isRequired
	},
	getInitialState() {
		return {
			count: 0,
			pages: 0
		};
	},
	componentDidMount() {
		this.updateCount(this.props);
	},
	componentWillReceiveProps(nextProps) {
		this.updateCount(nextProps);
	},
	countBookSize(pages) {
		if(pages <= 350){
			return 1;
		}else{
			return Math.ceil((pages - 350) / 200.0) + 1;
		}
	},
	updateCount(props) {
		var count = 0, pages = 0;
		props.books.map((book) => {
			count += this.countBookSize(book.pages);
			pages += book.pages;
		});
		this.setState({count: count, pages: pages});
	},
	_onDelete(isbn) {
		this.props.onDelete(isbn);
	},
	render() {
		var colorClass = 'box-red';
		if(this.state.count < 8) {
			colorClass = 'box-green';
		} else if(this.state.count < 10){
			colorClass = 'box-yellow';
		};
		var books = this.props.books.map((book) => {
			return <Book book={book} key={"isbn-" + book.isbn} onDelete={this._onDelete} />
		});
		return(
			<div className="box-border"><div className={"box " + colorClass}>
				{books}
				<div className="total-pages">{this.state.count}冊 / {this.state.pages}ページ</div>
			</div></div>
		);
	}
});

export default Box;
