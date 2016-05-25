/*
 * main.js
 *
 * Copyright (C) 2015 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';

require('../css/main.css');

jQuery.ajaxSetup({
	beforeSend(xhr) {
		var token = jQuery('meta[name="_csrf"]').attr('content');
		xhr.setRequestHeader('X_CSRF_TOKEN', token);
	}
});


/*
 * top page
 */
import RecentList from './recent_list';

var recentList = document.getElementById('recent-list');
if (recentList) {
	ReactDOM.render(<RecentList />, recentList);
}

/*
 * user page
 */
import Boxes from './boxes';
import ISBNForm from './isbn_form';
import {loadRecentList, addRecentList} from './util';

addRecentList(document.getElementsByTagName('body')[0].id);

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
