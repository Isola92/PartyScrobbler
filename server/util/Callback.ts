import { CentralDispatcher, ServerActivity, Action } from './../State';
import { Host } from "./../models/Host";
/**
 * CALLBACKS EXPECTS ARGUMENTS IN THE FORM OF:
 * DATA,
 * FUNCTION TO CALL WITH PREVIOUSLY MENTIONED DATA,
 * RESPONSE OBJECT FROM A REQUEST
 */
export function callback()  
{
    let body = '';

    //Convert arguments to an actual array.
    //let args = [...arguments];
    let args = Array.prototype.slice.call(arguments);
    //The last argument is always the "response" object from any request (currently Http).
    let response = args.pop();

    //The last argument after that is the function that actually wants the data.
    let passData = args.pop();

    //The data from our requests might be returned in chunks. We add these together.
    response.on('data', (chunk) =>{
        body += chunk;
    });

    //In the end we pass the received data and any additional parameters to the function.
    response.on('end', () =>
    {
        passData.apply(this,[body, ...args]);
    });
}

export function basicLogCallback(response) 
{
    let body = '';

    response.on('data', (chunk) =>
    {
        body += chunk;
    });

    response.on('end', () =>
    {
         console.log("Received data: " + (response));
    });
}

export function ActivityCallback(dispatcher: CentralDispatcher, action: Action, data: any)
{
    let args = Array.prototype.slice.call(arguments);
    
    //The last argument is always the "response" object from any request (currently Http).
    const response = args.pop();

    let body = '';
    response.on('data', (chunk) =>
    {
        body += chunk;
    })

    response.on('end', () =>
    {
        dispatcher.notify(new ServerActivity(action, {response: body, data: data }));
    })


}
