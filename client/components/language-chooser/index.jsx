/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import LanguageChooserModal from './language-chooser-modal';

class LanguageChooser extends PureComponent {

	static propTypes = {
		languages: PropTypes.array.isRequired,
		valueLink: PropTypes.shape( {
			value: PropTypes.any,
			requestChange: PropTypes.func.isRequired
		} ),
	}

	constructor( props ) {
		super( props );

		this.state = {
			selectedLanguageSlug: props.valueLink.value
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.valueLink.value !== this.props.valueLink.value ) {
			this.setState( {
				selectedLanguageSlug: nextProps.valueLink.value
			} );
		}
	}

	getSelectedLanguage() {
		return find( this.props.languages, lang => (
			lang.langSlug === this.state.selectedLanguageSlug
		) );
	}

	selectLanguage = ( languageSlug ) => {
		this.props.valueLink.requestChange( languageSlug );
		this.setState( {
			selectedLanguageSlug: languageSlug,
		} );
	}

	toggleOpen = () => {
		this.setState( { open: ! this.state.open } );
	}

	handleClose = () => {
		this.setState( { open: false } );
	}

	render() {
		let language = this.getSelectedLanguage();

		if ( ! language ) {
			// TODO: render a placeholder instead of this
			language = {
				name: 'uu - Unknownish',
				langSlug: 'un-kw'
			};
		}

		const [ langCode, langSubcode ] = language.langSlug.split( '-' );
		const langName = language.name.split( ' - ' )[ 1 ];
		const { translate } = this.props;

		return (
			<div className="language-chooser">
				<div className="language-chooser__icon">
					<div className="language-chooser__icon-inner">
						{ langCode }
						{ langSubcode && <br /> }
						{ langSubcode }
					</div>
				</div>
				<div className="language-chooser__name">
					<div className="language-chooser__name-inner">
						{ langName }
						<br />
						<a onClick={ this.toggleOpen }>{ translate( 'Change' ) }</a>
					</div>
				</div>
				<LanguageChooserModal
					isVisible={ this.state.open }
					languages={ this.props.languages }
					onClose={ this.handleClose }
					onSelected={ this.selectLanguage }
					selected={ this.state.selectedLanguageSlug }
				/>
			</div>
		);
	}
}

export default localize( LanguageChooser );
