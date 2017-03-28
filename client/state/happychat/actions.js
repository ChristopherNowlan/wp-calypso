/** IMPORTANT NOTE BEFORE EDITING THIS FILE **
 *
 * We're in the process of moving the side-effecting logic (anything to do with connection)
 * into Redux middleware. If you're implementing something new or changing something,
 * please consider moving any related side-effects into middleware.js.
 */

/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';

// This import will be deleted when the refactor is complete:
import { connection } from './common';

const debug = require( 'debug' )( 'calypso:happychat:actions' );

export const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS, status
} );
export const requestChatTranscript = () => ( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } );
export const receiveChatTranscript = ( messages, timestamp ) => ( {
	type: HAPPYCHAT_TRANSCRIPT_RECEIVE, messages, timestamp
} );

export const setChatConnected = () => ( { type: HAPPYCHAT_CONNECTED } );
const setChatMessage = message => {
	if ( isEmpty( message ) ) {
		connection.notTyping();
	}
	return { type: HAPPYCHAT_SET_MESSAGE, message };
};
export const setHappychatAvailable = isAvailable => ( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable } );

const clearChatMessage = () => setChatMessage( '' );

export const receiveChatEvent = event => ( { type: HAPPYCHAT_RECEIVE_EVENT, event } );
const sendTyping = throttle( message => {
	connection.typing( message );
}, 1000, { leading: true, trailing: false } );

export const sendBrowserInfo = ( siteurl ) => dispatch => {
	const siteHelp = `Site I need help with: ${ siteurl }\n`;
	const screenRes = `Screen Resolution: ${ screen.width }x${ screen.height }\n`;
	const browserSize = `Browser Size: ${ window.innerWidth }x${ window.innerHeight }\n`;
	const userAgent = `User Agent: ${ navigator.userAgent }`;
	const msg = {
		text: `Info\n ${ siteHelp } ${ screenRes } ${ browserSize } ${ userAgent }`,
	};

	debug( 'sending info message', msg );
	dispatch( clearChatMessage() );
	connection.info( msg );
};

export const connectChat = () => ( { type: HAPPYCHAT_CONNECTING } );

export const updateChatMessage = message => dispatch => {
	dispatch( setChatMessage( message ) );
	if ( ! isEmpty( message ) ) {
		sendTyping( message );
	}
};

export const sendChatMessage = message => dispatch => {
	debug( 'sending message', message );
	dispatch( clearChatMessage() );
	connection.send( message );
};
