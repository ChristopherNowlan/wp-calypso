/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { identity } from 'lodash';
import { connect, noop } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import { openChat } from 'state/ui/happychat/actions';
import Button from 'components/button';

class HappychatButton extends Component {
	static propTypes = {
		openChat: PropTypes.func,
		translate: PropTypes.func,
		onClick: PropTypes.func,
		borderless: PropTypes.bool,
	};

	static defaultProps = {
		openChat: noop,
		translate: identity,
		onClick: noop,
		borderless: true,
	};

	onClick = ( event ) => {
		if ( viewport.isMobile() ) {
			// For mobile clients, happychat will always use the
			// page compoent instead of the sidebar
			page( '/me/chat' );
		} else {
			this.props.openChat();
		}

		this.props.onClick( event );
	}

	render() {
		const { translate, children, className, borderless } = this.props;
		const classes = classnames( 'happychat__button', className, {
			'is-borderless': borderless,
		} );

		return (
			<Button
				className={ classes }
				onClick={ this.onClick }
				title={ translate( 'Support Chat' ) }>
				{ children || <Gridicon icon="chat" /> }
			</Button>
		);
	}
}

export default connect( null, { openChat } )( localize( HappychatButton ) );
