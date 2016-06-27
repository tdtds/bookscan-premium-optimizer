/*
 * app.js - all book list and submit form
 *
 * Copyright (C) 2016 by TADA Tadash <t@tdtds.jp>
 * You can modify and/or distribute this under GPL.
 */
import * as React from 'react';
import {Flux} from 'flumpt';
import Boxes from '../component/boxes';
import ISBNForm, {SUBMIT_ISBN} from '../component/isbn_form';
import {DELETE_BOOK} from '../component/book';
import {MuiThemeProvider, AppBar} from 'material-ui';

export default class App extends Flux {
	subscribe() {
		this.on(SUBMIT_ISBN, (isbn) => {
			this.update(({boxes, input}) => {
				return new Promise((resolve, reject) => {
					input = {
						submitable: false,
						message: '',
						blink: false
					};

					let form = new FormData(); form.append('isbn', isbn);
					fetch('/' + document.getElementsByTagName('body')[0].id, {
						method: 'PUT',
						body: form
					}).
					then(res => {
						if (res.status == 404) {
							input.message = "ISBNが正しくない可能性があります";
							return resolve({boxes, input});
						}
						return res.json();
					}).
					then(json => {
						boxes = json;
						input.submittable = true;
						return resolve({boxes, input});
					}).
					catch(err => {
						input.submittable = true;
						console.info(err);
						return reject({boxes, input});
					});
				});
			});
		});
		this.on(DELETE_BOOK, (isbn) => {
			this.update(({boxes, input}) => {
				return new Promise((resolve, reject) => {
					input.message = '';
					input.blink = false;
					fetch('/' + document.getElementsByTagName('body')[0].id + '/' + isbn, {
						method: 'DELETE'
					}).
					then(res => res.json()).
					then(json => {
						boxes = json;
						return resolve({boxes, input});
					}).
					catch(err => {
						console.error(err);
						return reject(err);
					});
				});
			});
		});
	}

	render(state) {
		return(
			<div>
				<MuiThemeProvider>
					<AppBar className='top' title='BOOKSCAN Premium Optimizer' iconStyleLeft={{display: 'none'}} />
				</MuiThemeProvider>
				<Boxes boxes={state.boxes} />
				<ISBNForm input={state.input} />
				<p className='desc'>
					上のISBNの欄にスキャンしたい本のISBN番号を入力し、[+]を押します。
					少し待つと上にその本のタイトルとページ数が表示されます。
					続いて他の本を追加しましょう。ひとつの枠に収まっている限りは、
					プレミアム・ライトの10冊相当以内です。
					あふれたら新しい枠が作られて、あふれた分の本が入ります。
					リストから外したい本があれば、題名の左にある[×]を押して下さい。
				</p>
				<p className='desc'>
					このページをブックマークしておくと、あとで再利用できます。
				</p>
			</div>
		);
	}
}
