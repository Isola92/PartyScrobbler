/**
 * Start using these for socket identifiers as well. 
 * Can be shared between client and server.
 * 
 * Currently string enums for logging purposes.
 */
export enum Action
{
    // General actions
    ADD_HOST = "ADD_HOST",
    ADD_LISTENER = "ADD_LISTENER",
    DELETE_USER = "DELETE_USER",
    GET_RECENT_TRACKS = "GET_RECENT_TRACKS",
    ADD_TOKEN = "ADD_TOKEN",

    // Last.fm API actions
    API_GET_SESSION = "GET_SESSION",
    API_GET_RECENT_TRACK = "API_GET_RECENT_TRACK",
    API_RECEIVED_RECENT_TRACK = "API_RECEIVED_RECENT_TRACK",
    API_SCROBBLE_TRACK = "API_SCROBBLE_TRACK",
    API_RECEIVED_SESSION_TOKEN = "API_RECEIVED_SESSION_TOKEN",

    // Socket actions
    EMIT_PARTY = "EMIT_PARTY",
    START_SOCKETS = "START_SOCKETS",
    ADD_SOCKET_CLIENT = "ADD_SOCKET_CLIENT",
    PROVIDE_PARTY = "PROVIDE_PARTY",
    PROVIDE_LATEST_TRACK = "PROVIDE_LATEST_TRACK",
    PROVIDE_USERDATA = "PROVIDE_USERDATA",
    ADD_HOST_RESPONSE = "ADD_HOST_RESPONSE"
}

export enum ActionType
{
    API,
    SOCKET,
    USER
}