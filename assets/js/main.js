/*
 * main.jsx
 *
 * Copyright (C) 2015 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */

jQuery.ajaxSetup({
	beforeSend:function(xhr) {
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
var RecentList = React.createClass({displayName: "RecentList",
	render:function() {
		var lists = loadRecentList().map(function(list)  {
			return React.createElement("li", {key: list}, React.createElement("a", {href: '/' + list}, list))
		});
		return React.createElement("ul", null, lists)
	}
});

var recentList = document.getElementById('recent-list');
if (recentList) {
	ReactDOM.render(React.createElement(RecentList, null), recentList);
}

/*
 * react components for list page
 */
var Book = React.createClass({displayName: "Book",
	propTypes: {
		book: React.PropTypes.shape({
			isbn:  React.PropTypes.string.isRequied,
			url:   React.PropTypes.string.isRequied,
			title: React.PropTypes.string.isRequied,
			pages: React.PropTypes.number.isRequied
		}),
		onDelete:   React.PropTypes.func.isRequired
	},
	getInitialState:function() {
		return({deleteStyle: 'hidden'});
	},
	onMouseOver:function(e) {
		this.setState({deleteStyle: 'visible'});
	},
	onMouseOut:function(e) {
		this.setState({deleteStyle: 'hidden'});
	},
	_onDelete:function(e) {
		e.preventDefault();
		this.props.onDelete(this.props.book.isbn);
	},
	render:function() {
		var book = this.props.book;
		return(
			React.createElement("div", {className: "book", onMouseOver: this.onMouseOver, onMouseOut: this.onMouseOut}, 
				React.createElement("a", {className: "delete-book", style: {visibility: this.state.deleteStyle}, href: "#", onClick: this._onDelete}, "\u00D7"), 
				React.createElement("a", {href: book.url, target: "_blank"}, React.createElement("span", null, book.title)), 
				React.createElement("span", {className: "pages"}, book.pages)
			)
		);
	}
});

var Box = React.createClass({displayName: "Box",
	propTypes: {
		onDelete:   React.PropTypes.func.isRequired
	},
	getInitialState:function() {
		return {
			count: 0,
			pages: 0
		};
	},
	componentDidMount:function() {
		this.updateCount(this.props);
	},
	componentWillReceiveProps:function(nextProps) {
		this.updateCount(nextProps);
	},
	countBookSize:function(pages) {
		if(pages <= 350){
			return 1;
		}else{
			return Math.ceil((pages - 350) / 200.0) + 1;
		}
	},
	updateCount:function(props) {
		var count = 0, pages = 0;
		props.books.map(function(book)  {
			count += this.countBookSize(book.pages);
			pages += book.pages;
		}.bind(this));
		this.setState({count: count, pages: pages});
	},
	_onDelete:function(isbn) {
		this.props.onDelete(isbn);
	},
	render:function() {
		var colorClass = 'box-red';
		if(this.state.count < 8) {
			colorClass = 'box-green';
		} else if(this.state.count < 10){
			colorClass = 'box-yellow';
		};
		var books = this.props.books.map(function(book)  {
			return React.createElement(Book, {book: book, key: "isbn-" + book.isbn, onDelete: this._onDelete})
		}.bind(this));
		return(
			React.createElement("div", {className: "box-border"}, React.createElement("div", {className: "box " + colorClass}, 
				books, 
				React.createElement("div", {className: "total-pages"}, this.state.count, "冊 / ", this.state.pages, "ページ")
			))
		);
	}
});

var Boxes = React.createClass({displayName: "Boxes",
	propTypes: {
		onDelete: React.PropTypes.func.isRequired
	},
	getDefaultProps:function() {
		return {
			boxes: []
		};
	},
	_onDelete:function(isbn) {
		this.props.onDelete(isbn);
	},
	render:function() {
		var count = 0;
		var boxes = this.props.boxes.map(function(books)  {
			return React.createElement(Box, {books: books, key: "key-" + ++count, onDelete: this._onDelete})
		}.bind(this));
		return React.createElement("div", {className: "boxes"}, boxes);
	}
});

var ISBNForm = React.createClass({displayName: "ISBNForm",
	propTypes: {
		onSubmit:   React.PropTypes.func.isRequired,
		submitable: React.PropTypes.bool,
		message:    React.PropTypes.string
	},
	getInitialState:function() {
		return {isbn: ""};
	},
	getDefaultProps:function() {
		return {
			submitable: true,
			message: ""
		};
	},
	componentDidMount:function() {
		this.refs.inputISBN.focus();
	},
	onChange:function(e) {
		this.setState({isbn: e.target.value});
	},
	onClick:function(e) {
		e.preventDefault();
		if(this.state.isbn.length > 0) {
			this.props.onSubmit(this.state.isbn);
			this.setState({isbn: ""});
		};
	},
	render:function() {
		return(
			React.createElement("form", null, 
				React.createElement("input", {ref: "inputISBN", placeholder: "ISBN", value: this.state.isbn, onChange: this.onChange}), 
				React.createElement("input", {type: "submit", disabled: !this.props.submitable, value: "+", onClick: this.onClick}), 
				React.createElement("span", {className: "message"}, this.props.message)
			)
		);
	}
});

var Main = React.createClass({displayName: "Main",
	getInitialState:function() {
		return {
			boxes: [],
			submitable: true,
			message: ''
		};
	},
	componentDidMount:function() {
		this.getRecentData(0);
	},
	getRecentData:function(retryCount) {
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
			}).done(function(json)  {
				component.setState({boxes: json});
			}).fail(function(XMLHttpRequest, textStatus, errorThrown)  {
				component.getRecentData(++retryCount);
			});
		}, 1000);
		return true;
	},
	showMessage:function(message, autoHide) {
		var component = this;
		component.setState({message: message});
		if(autoHide) {
			setTimeout(function(){component.setState({message: ""})}, 500);
		}
	},
	onSubmit:function(isbn) {
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
	onDelete:function(isbn) {
		var component = this;
		jQuery.ajax({
			type: 'DELETE',
			url: '/' + document.getElementsByTagName('body')[0].id + '/' + isbn,
			dataType: 'json'
		}).done(function(json){
			component.setState({boxes: json});
		});
	},
	render:function() {
		return(
			React.createElement("div", {className: "main"}, 
				React.createElement(Boxes, {boxes: this.state.boxes, onDelete: this.onDelete}), 
				React.createElement(ISBNForm, {onSubmit: this.onSubmit, submitable: this.state.submitable, message: this.state.message})
			)
		);
	}
});

var contents = document.getElementById('contents');
if (contents) {
	ReactDOM.render(React.createElement(Main, null), contents);
}
