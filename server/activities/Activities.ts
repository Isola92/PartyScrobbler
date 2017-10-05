import {Action, ActionType} from "../constants/Action";

/**
 * When a class has a request that requires some state 
 * it will instantiate a notification which goes to the reducer.
 * Provide a string or number to be able to identify the specific action defined in the reduce method.
 */
export class ServerActivity
{
    public action: Action;
    public data: any;
    public actionType: ActionType;

    constructor(action: Action, actionType: ActionType, data?: any)
    {
        this.action = action;
        this.data = data;
        this.actionType = actionType;
    }
}

export class APIActivity extends ServerActivity
{
    constructor(action: Action, data?: any)
    {
        super(action, ActionType.API, data);
    }
}

export class UserActivity extends ServerActivity
{
    constructor(action: Action, data?: any)
    {
        super(action, ActionType.USER, data);
    }
}

export class SocketActivity extends ServerActivity
{
    constructor(action: Action, data?: any)
    {
        super(action, ActionType.SOCKET, data, );
    }
}