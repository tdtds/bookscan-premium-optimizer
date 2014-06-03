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
			var totalPages = 0;
			$.each(this, function(){
				var $book = $('<div>').addClass('book').attr('id', 'isbn-' + this.isbn);
				var $delete = $('<a>').addClass('delete-book').attr('href', '#').text('×');
				var $title = $('<span>').text(this.title);
				var $link = $('<a>').attr('href', this.url).append($title);
				var $pages = $('<span>').text('[' + this.pages + ']');
				$book.append($delete).append($link).append($pages);
				$box.append($book);
				totalPages += this.pages;
			});
			var $total = $('<div>').addClass('total-pages').text('total ' + totalPages + ' pages');
			$('#boxes').append($box.append($total));
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

	/*
	 * delete a book
	 */
	$(document).on('mouseenter', '.book', function(){
		$('.delete-book', this).css('visibility', 'visible');
	});
	$(document).on('mouseleave', '.book', function(){
		$('.delete-book', this).css('visibility', 'hidden');
	});
	$(document).on('click', '.delete-book', function(){
		var isbn = $(this).parent().attr('id').substr(5);
		$.ajax({
			type: 'DELETE',
			url: '/' + $('body').attr('id') + '/' + isbn,
			dataType: 'json'
		}).done(function(json){
			$('#boxes').text('');
			replaceList(json);
		});
		return false;
	});
});

