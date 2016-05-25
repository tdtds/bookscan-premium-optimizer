import React from 'react';
import ReactDOM from 'react-dom';

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

export default ISBNForm;
