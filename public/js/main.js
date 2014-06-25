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
	 * count book size
	 */
	function countBookSize(pages){
		if(pages <= 350){
			return 1;
		}else{
			return Math.ceil((pages - 350) / 200.0) + 1;
		}
	}

	/*
	 * replace list
	 */
	function replaceList(list){
		$.each(list, function(){
			var $box = $('<div>').addClass('box');
			var count = 0;
			var totalPages = 0;
			$.each(this, function(){
				var $book = $('<div>').addClass('book').attr('id', 'isbn-' + this.isbn);
				var $delete = $('<a>').addClass('delete-book').attr('href', '#').text('×');
				var $title = $('<span>').text(this.title);
				var $link = $('<a>').attr('href', this.url).append($title);
				var $pages = $('<span>').addClass('pages').text(this.pages);
				$book.append($delete).append($link).append($pages);
				$box.append($book);
				count += countBookSize(this.pages);
				totalPages += this.pages;
			});
			var $total = $('<div>').addClass('total-pages').text('' + count + '冊 / ' + totalPages + 'ページ');
			$box.append($total);

			var $boxBorder = $('<div>').addClass('box-border').append($box);
			if(count < 8){
				$box.addClass('box-green');
			}else if(count < 10){
				$box.addClass('box-yellow');
			}else{
				$box.addClass('box-red');
			}
			$('#boxes').append($boxBorder);
		});
	};

	/*
	 * show message
	 */
	function message(str){
		$('#message').text(str).show();
		setTimeout(function(){
			$('#message').hide();
		}, 5000);
	}

	/*
	 * retrying show list
	 */
	function retryShowList(retryCount){
		if(retryCount >= 100){
			return false;
		}

		message('書籍データを取得中...');
		setTimeout(function(){
			$.ajax({
				url: '/' + $('body').attr('id') + '/list',
				type: 'GET',
				dataType: 'json',
				cache: false
			}).done(function(json){
				replaceList(json);
				$('#newbook').focus();
			}).fail(function(XMLHttpRequest, textStatus, errorThrown){
				retryShowList(retryCount + 1);
			});
		}, 1000);
		return true;
	}

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
	 * add list to recent list
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

	/*
	 * init list
	 */
	if($('#newbook').length > 0){
		$.getJSON('/' + $('body').attr('id') + '/list').done(function(json){
			replaceList(json);
			$('#newbook').focus();
		}).fail(function(XMLHttpRequest, textStatus, errorThrown){
			if(XMLHttpRequest.status == 408){
				retryShowList(0);
			}
		});
	}

	/*
	 * init recent list
	 */
	$.each(loadRecentList(), function(){
		$('#recent-list').append(
			$('<li>').append(
				$('<a>').attr('href', '/' + this).text(this)
			)
		);
	});

	/*
	 * maintain recent list
	 */
	addRecentList($('body').attr('id'));

	/*
	 * add new book
	 */
	$('#add-isbn').on('submit', function(){
		var isbn = $('#newbook').val();
		$('#newbook-submit').attr('disabled', true);
		$.ajax({
			type: 'PUT',
			url: '/' + $('body').attr('id'),
			data: {isbn: isbn},
			dataType: 'json'
		}).done(function(json){
			$('#boxes').text('');
			replaceList(json);
			$('#newbook').val('');
			$('#newbook-submit').attr('disabled', false);
		}).fail(function(XMLHttpRequest, textStatus, errorThrown){
			$('#newbook-submit').attr('disabled', false);
			if(XMLHttpRequest.status == 404){
				message("ISBNが正しくない可能性があります")
			}
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

