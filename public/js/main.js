/*
 * main.js
 *
 * Copyright (C) 2014 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */

$(function(){
	/*
	 * setup against CSRF
	 */
	jQuery.ajaxSetup({
		beforeSend: function(xhr) {
			var token = jQuery('meta[name="_csrf"]').attr('content');
			xhr.setRequestHeader('X_CSRF_TOKEN', token);
		}
	});

	/*
	 * replace list
	 */
	function replaceList(list){
		$.each(list, function(){
			var $box = $('<div>').addClass('box');
			$.each(this, function(){
				var $book = $('<div>').addClass('book');
				var $title = $('<span>').text(this.title);
				var $link = $('<a>').attr('href', this.url).append($title);
				var $pages = $('<span>').text('[' + this.pages + ']');
				$book.append($link).append($pages);
				$box.append($book);
			});
			$('#boxes').append($box);
		});
	};

	/*
	 * init list
	 */
	$.getJSON('/' + $('body').attr('id') + '/list', function(json){
		replaceList(json);
	});

	/*
	 * add new book
	 */
	$('#add-isbn').on('submit', function(){
		var isbn = $('#newbook').val();
		$.ajax({
			type: 'PUT',
			url: '/' + $('body').attr('id'),
			data: {isbn: isbn},
			dataType: 'json'
		}).done(function(json){
			$('#boxes').text('');
			replaceList(json);
			$('#newbook').val('');
		});
		return false;
	});
});

