/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import wpcom from 'lib/wp';
import {
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';
import middleware, {
	connectChat,
	requestTranscript,
} from '../middleware';

describe( 'middleware', () => {
	describe( 'HAPPYCHAT_CONNECTING action', () => {
		// TODO: Add tests for cases outside the happy path
		const action = { type: HAPPYCHAT_CONNECTING };

		it( 'should do nothing if Happychat is already connected', () => {
			const getState = stub().returns( { happychat: { connectionStatus: 'connected' } } );
			const next = stub();
			const dispatch = stub();
			middleware( stub() )( { getState, dispatch } )( next )( action );
			expect( dispatch ).not.to.have.beenCalled;
			expect( next ).not.to.have.beenCalled;
		} );

		describe( 'after successful connection', () => {
			let connection;
			let dispatch, getState;
			const state = deepFreeze( {
				currentUser: { id: 1 },
				happychat: { connectionStatus: 'disconnected' },
				users: { items: { 1: {} } }
			} );

			useSandbox( sandbox => {
				connection = {
					on: sandbox.stub(),
					open: sandbox.stub().returns( Promise.resolve() )
				};
				// Need to add return value after re-assignment, otherwise it will return
				// a reference to the previous (undefined) connection variable.
				connection.on.returns( connection );

				dispatch = sandbox.stub();
				getState = sandbox.stub().returns( state );
				sandbox.stub( wpcom, 'request', ( args, callback ) => callback( null, {} ) );
			} );

			it( 'should send notice of the connection state', () => {
				return connectChat( connection, { dispatch, getState } )
					.then( () => expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_CONNECTED } ) );
			} );

			it( 'should fetch transcripts', () => {
				return connectChat( connection, { dispatch, getState } )
					.then( () => expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } ) );
			} );

			it( 'should set up listeners for various connection events', () => {
				connection.on.withArgs( 'accept' );
				connection.on.withArgs( 'message' );
				connection.on.withArgs( 'status' );

				return connectChat( connection, { dispatch, getState } )
					.then( () => {
						expect( connection.on.callCount ).to.equal( 3 );

						// Ensure 'accept' listener was connected by executing a fake message event
						connection.on.withArgs( 'accept' ).firstCall.args[ 1 ]( true );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable: true } );

						// Ensure 'message' listener was connected by executing a fake message event
						connection.on.withArgs( 'message' ).firstCall.args[ 1 ]( 'some event' );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_RECEIVE_EVENT, event: 'some event' } );

						// Ensure 'message' listener was connected by executing a fake message event
						connection.on.withArgs( 'status' ).firstCall.args[ 1 ]( 'ready' );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_SET_CHAT_STATUS, status: 'ready' } );
					} );
			} );
		} );
	} );

	describe( 'HAPPYCHAT_TRANSCRIPT_REQUEST action', () => {
		it( 'should fetch transcript from connection and dispatch receive action', () => {
			const state = deepFreeze( {
				happychat: {
					timeline: []
				}
			} );
			const response = {
				messages: [
					{ text: 'hello' }
				],
				timestamp: 100000,
			};

			const connection = { transcript: stub().returns( Promise.resolve( response ) ) };
			const dispatch = stub();
			const getState = stub().returns( state );

			return requestTranscript( connection, { getState, dispatch } )
				.then( () => {
					expect( connection.transcript ).to.have.been.called;

					expect( dispatch ).to.have.been.calledWith( {
						type: HAPPYCHAT_TRANSCRIPT_RECEIVE,
						...response,
					} );
				} );
		} );
	} );
} );
