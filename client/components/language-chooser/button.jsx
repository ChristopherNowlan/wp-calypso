/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import config from 'config';
import userSettings from 'lib/user-settings';
import LanguageChooserModal from './language-chooser-modal';

class LanguageButton extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			open: false,
			languageSlug: this.getLanguageFromSettings(),
		};
	}

	toggleOpen = () => {
		this.setState( { open: ! this.state.open } );
	}

	handleClose = () => {
		this.setState( { open: false } );
	}

	selectLanguage = ( languageSlug ) => {
		const originalLanguage = this.state.languageSlug;
		if ( languageSlug === originalLanguage ) {
			return;
		}

		userSettings.saveSettings(
			( error ) => {
				// TODO: display notices
				if ( error ) {
					return;
				}
				window.location = window.location.pathname + '?updated=success';
			},
			{ language: languageSlug }
		);
	}

	// TODO: Replace the event observer by making userSettings available in the
	// global Redux state
	componentDidMount() {
		userSettings.on( 'change', this.updateLanguageFromSettings );
	}

	componentWillUnmount() {
		userSettings.off( 'change', this.updateLanguageFromSettings );
	}

	getLanguageFromSettings() {
		// Look at the original setting - there might be an unsaved /me/account
		// form displayed on the page, and we don't want to display the unsaved
		// change - only the committed one.
		// TODO: render a 'placeholder' state while settings are loading
		return userSettings.getOriginalSetting( 'language' ) || 'uu-kw';
	}

	updateLanguageFromSettings = () => {
		const languageSlug = this.getLanguageFromSettings();
		this.setState( { languageSlug } );
	}

	render() {
		const { translate } = this.props;
		const { languageSlug } = this.state;
		const [ langCode, langSubcode ] = languageSlug.split( '-' );

		return (
			// TODO: Reorganize the styles and get rid of the eslint errors
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<Button
				className="sidebar__footer-lang"
				borderless
				title={ translate( 'Interface Language' ) }
				onClick={ this.toggleOpen }
			>
				<div className="sidebar__footer-lang-icon">
					<div>
						{ langCode }
						{ langSubcode && <br /> }
						{ langSubcode }
					</div>
				</div>
				<LanguageChooserModal
					isVisible={ this.state.open }
					languages={ config( 'languages' ) }
					onClose={ this.handleClose }
					onSelected={ this.selectLanguage }
					selected={ languageSlug }
				/>
			</Button>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	}
}

export default localize( LanguageButton );
