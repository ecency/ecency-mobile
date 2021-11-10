
/**
 * extracts authentication information from deep link url
 */

export default (urlString:string) => {
    const url = new URL(urlString);
    console.log(JSON.stringify(url, null, '\t'));
    if(url.pathname === '/signup'){
        const referredUser = url.searchParams.get('referral')
        return {
            mode:'SIGNUP',
            referredUser
        }
    }

    //TODO: add support for login deep link if required
    return null;
}