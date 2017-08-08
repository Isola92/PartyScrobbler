import { Host } from "../models/Host";
import { Track } from "../models/Track";

export type HostContainer = { [hostname: string]: Host }

/**
 *  Token is a string which is generated when the user approves that this application can use their account. VALID FOR 60 MINUTES.
 *  A sessiontoken is required for some sensitive API-requests such as Scrobbling. It is received by making a specific
 *  last.fm API request. They are account bound with an infinite lifetime. These tokens should not be re-generated. 
 */
export type RequestParameters = {callback: (response?: any) => void, method: string, username?: string, track?: Track, host?:string, token?: string, sessionToken?: string }