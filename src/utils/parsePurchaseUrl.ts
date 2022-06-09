
/**
 * extracts purchase information from deep link url
 */

export default (urlString:string) => {
    const url = new URL(urlString);
    console.log(JSON.stringify(url, null, '\t'));
    if(url.pathname === '/purchase'){
        const type = url.searchParams.get('type');
        const username = url.searchParams.get('username');
        return {
            type,
            username
        }
    }
    
    return null;
}