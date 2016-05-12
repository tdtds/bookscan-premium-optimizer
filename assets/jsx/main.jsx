/*
 * main.jsx
 *
 * Copyright (C) 2015 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */

jQuery.ajaxSetup({
	beforeSend(xhr) {
		var token = jQuery('meta[name="_csrf"]').attr('content');
		xhr.setRequestHeader('X_CSRF_TOKEN', token);
	}
});

/*
 * load recent list
 */
function loadRecentList(){
	var json = localStorage['recentList'];
	var recents = [];
	if(json){
		recents = JSON.parse(json)
	}
	return recents;
}

/*
 * add the list to recent lists
 */
function addRecentList(newList){
	var recents = loadRecentList();
	if(!newList){
		return recents;
	}

	var dup = recents.indexOf(newList);
	if(dup != -1){
		recents.splice(dup, 1);
	}
	if(recents.length >= 5){
		recents.splice(4, recents.length - 4);
	}
	recents.splice(0, 0, newList);
	localStorage['recentList'] = JSON.stringify(recents);
	return recents;
}
addRecentList(document.getElementsByTagName('body')[0].id);

/*
 * react components for top page
 */
var RecentList = React.createClass({
	render() {
		var lists = loadRecentList().map((list) => {
			return <li key={list}><a href={'/' + list}>{list}</a></li>
		});
		return <ul>{lists}</ul>
	}
});

var recentList = document.getElementById('recent-list');
if (recentList) {
	ReactDOM.render(<RecentList />, recentList);
}

/*
 * react components for list page
 */
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

var ISBNForm = React.createClass({
	propTypes: {
		onSubmit:   React.PropTypes.func.isRequired,
		submitable: React.PropTypes.bool,
		message:    React.PropTypes.string
	},
	getInitialState() {
		return {isbn: ""};
	},
	getDefaultProps() {
		return {
			submitable: true,
			message: ""
		};
	},
	componentDidMount() {
		this.refs.inputISBN.focus();
	},
	onChange(e) {
		this.setState({isbn: e.target.value});
	},
	onClick(e) {
		e.preventDefault();
		if(this.state.isbn.length > 0) {
			this.props.onSubmit(this.state.isbn);
			this.setState({isbn: ""});
		};
	},
	render() {
		return(
			<form>
				<input ref="inputISBN" placeholder="ISBN" value={this.state.isbn} onChange={this.onChange} />
				<input type="submit" disabled={!this.props.submitable} value="+" onClick={this.onClick}/>
				<span className="message">{this.props.message}</span>
			</form>
		);
	}
});

var Main = React.createClass({
	getInitialState() {
		return {
			boxes: [],
			submitable: true,
			message: ''
		};
	},
	componentDidMount() {
		this.getRecentData(0);
	},
	getRecentData(retryCount) {
		if(retryCount >= 100) {
			return false;
		}
		this.showMessage('書籍データを取得中...', true);
		var component = this;
		setTimeout(function() {
			jQuery.ajax({
				url: '/' + document.getElementsByTagName('body')[0].id + '/list',
				type: 'GET',
				dataType: 'json',
				cache: false
			}).done((json) => {
				component.setState({boxes: json});
			}).fail((XMLHttpRequest, textStatus, errorThrown) => {
				component.getRecentData(++retryCount);
			});
		}, 1000);
		return true;
	},
	showMessage(message, autoHide) {
		var component = this;
		component.setState({message: message});
		if(autoHide) {
			setTimeout(function(){component.setState({message: ""})}, 500);
		}
	},
	onSubmit(isbn) {
		var component = this;
		component.showMessage("", false);
		component.setState({submitable: false});
		jQuery.ajax({
			type: 'PUT',
			url: '/' + document.getElementsByTagName('body')[0].id,
			data: {isbn: isbn},
			dataType: 'json'
		}).done(function(json){
			component.setState({boxes: json});
			component.setState({submitable: true});
		}).fail(function(XMLHttpRequest, textStatus, errorThrown){
			component.setState({submitable: true});
			if(XMLHttpRequest.status == 404){
				component.showMessage("ISBNが正しくない可能性があります", false);
			}
		});
	},
	onDelete(isbn) {
		var component = this;
		jQuery.ajax({
			type: 'DELETE',
			url: '/' + document.getElementsByTagName('body')[0].id + '/' + isbn,
			dataType: 'json'
		}).done(function(json){
			component.setState({boxes: json});
		});
	},
	render() {
		return(
			<div className="main">
				<Boxes boxes={this.state.boxes} onDelete={this.onDelete} />
				<ISBNForm onSubmit={this.onSubmit} submitable={this.state.submitable} message={this.state.message} />
			</div>
		);
	}
});

var contents = document.getElementById('contents');
if (contents) {
	ReactDOM.render(<Main />, contents);
}
