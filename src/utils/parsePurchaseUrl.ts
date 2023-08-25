/**
 * extracts purchase information from deep link url i-e https://ecency.com/purchase?type=boost&username=ecency.waves
 *
 */

export enum PURCHASE_TYPES {
  POINTS = 'points',
  BOOST = 'boost',
}

export default (urlString: string) => {
  const url = new URL(urlString);
  console.log(JSON.stringify(url, null, '\t'));
  if (url.pathname === '/purchase') {
    const type = url.searchParams.get('type');
    const username = url.searchParams.get('username');
    const email = url.searchParams.get('email');
    const referredUser = url.searchParams.get('referral');
    const productId = url.searchParams.get('product_id');
    return {
      type,
      username,
      productId,
      email,
      referredUser,
    };
  }

  return null;
};
