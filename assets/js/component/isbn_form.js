/*
 * isbn_form.js - form component to input ISBN
 */
import * as React from 'react';
import {Component} from 'flumpt';
import {MuiThemeProvider, TextField, FloatingActionButton} from 'material-ui';
import {ContentAdd} from 'material-ui/svg-icons';

export const SUBMIT_ISBN = "submit-isbn";

export default class ISBNForm extends Component {
	constructor(...args) {
		super(...args);
		this.state = {isbn: ''};
	}

	componentDidMount() {
		this.refs.inputISBN.focus();
	}

	submit(e) {
		e.preventDefault();
		if(this.state.isbn.length > 0) {
			this.dispatch(SUBMIT_ISBN, this.state.isbn);
			this.setState({isbn: ""});
		};
	}

	render() {
		const input = this.props.input;

		return(
			<form className="isbn-form">
				<MuiThemeProvider>
					<TextField ref="inputISBN" hintText="ISBN" value={this.state.isbn} onChange={(e) => this.setState({isbn: e.target.value})} />
				</MuiThemeProvider>
				<MuiThemeProvider>
					<FloatingActionButton type='submit' mini={true} disabled={!input.submittable} onClick={(e) => this.submit(e)}>
						<ContentAdd />
					</FloatingActionButton>
				</MuiThemeProvider>
				<span className={input.blink ? 'message blink' : 'message'}>{input.message}</span>
			</form>
		);
	}
}
