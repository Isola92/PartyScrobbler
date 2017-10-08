import { State } from "./../State";
import { ServerActivity } from "./../activities/Activities";

export interface IReducer
{
	/**
	 * Modifies state based on the type of activity.
	 * Each reducer has to have a function like this. It contains a switch statement
	 * with different functionality for each type of activity.
	 * 
	 */
	reduce(state: State, activity: ServerActivity): State
}