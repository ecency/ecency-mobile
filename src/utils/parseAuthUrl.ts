
/**
 * extracts authentication information from deep link url
 */


 export enum AUTH_MODES {
    LOGIN ='LOGIN',
    SIGNUP ='SIGNUP'
}

interface ReturnType {
    mode:AUTH_MODES;
    queryParams:{
        username?:string,
        password?:string,
        referredUser?:string,
    }
   
}

export default (urlString:string):ReturnType => {

    const url = new URL(urlString);
    console.log(JSON.stringify(url, null, '\t'));
    if(url.pathname === '/signup'){
        const referredUser = url.searchParams.get('referral')
        return {
            mode:AUTH_MODES.SIGNUP,
            queryParams:{ 
                referredUser
            }
        }
    }
    else if(url.pathname === '/login'){
        const username = url.searchParams.get('username');
        const password = url.searchParams.get('password'); //TODO: process encryption when in place

        return {
            mode:AUTH_MODES.LOGIN,
            queryParams:{
                username,
                password
            }
        }
    }

    //TODO: add support for login deep link if required
    return null;
}

