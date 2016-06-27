/*
 * show recent list component on the top page
 */
import * as React from 'react';
import {Flux} from 'flumpt';
import {MuiThemeProvider, AppBar, FloatingActionButton, List, Subheader, ListItem} from 'material-ui';
import {ContentAdd} from 'material-ui/svg-icons';

export default class RecentList extends Flux {
	render(state) {
		var lists = state.lists.map((list) => {
			return <ListItem primaryText={list} key={list} href={'/' + list} />
		});
		return(
			<div>
				<MuiThemeProvider>
					<AppBar className='top' title='BOOKSCAN Premium Optimizer' iconStyleLeft={{display: 'none'}} />
				</MuiThemeProvider>
				<p className='desc'>
					BOOKSCANのプレミアムサービスの制限に合わせて、一箱に収まる
					ちょうど良い冊数を計算してくれるWebサービスです。
					BOOKSCANに送りたい本のISBNを入力していくと、Amazonにある
					ページ数の情報を元にして一箱に入るかどうか計算します。
				</p>
				<p className='desc'>
					一箱を超えると二箱目に振り分けますが、そのときはもっとも
					お得になるように遺伝的アルゴリズムを使って分配します。
				</p>
				<p className='desc'>
					現在サポートしているのはBOOKSCANのプレミアム・ライト(1回10冊相当)です。
					スタンダードプランの50冊には対応していません。
				</p>
				<form id='new-list' method='post' action='/'>
					<MuiThemeProvider>
						<FloatingActionButton type='submit'>
							<ContentAdd />
						</FloatingActionButton>
					</MuiThemeProvider>
				</form>
				<MuiThemeProvider>
					<List style={{textAlign: 'center', marginTop: '2em'}}>
						<Subheader>最近利用したリスト</Subheader>
						{lists}
					</List>
				</MuiThemeProvider>
			</div>
		);
	}
};

export default RecentList;
