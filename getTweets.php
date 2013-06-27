<?

require_once('AlephTwitterKeysAndTokens.php');
require_once('TwitterAPIExchange.php');


if ( isset($_GET["count"]) && is_numeric($_GET["count"]) && $_GET["count"] < 100 ) {
	$count = $_GET["count"];
} else {
	$count = 99;
}

if ( isset($_GET["nextResults"]) && is_numeric($_GET["nextResults"]) ) {
	$nextResults = $_GET["nextResults"];
} else {
	$nextResults = 0;
}


$settings = array(
    'oauth_access_token' => $aleph_oauth_access_token,
    'oauth_access_token_secret' => $aleph_oauth_access_token_secret,
    'consumer_key' => $aleph_consumer_key,
    'consumer_secret' => $aleph_consumer_secret
);

$url = 'https://api.twitter.com/1.1/search/tweets.json';
$getfield = '?count=' . $count . '&q=%22I%20saw%20a%22+exclude:retweets';
if ( $nextResults !== 0 ) {
	$getfield = $getfield . "&max_id=" . $nextResults;
}
$requestMethod = 'GET';

$twitter = new TwitterAPIExchange($settings);
echo $twitter->setGetfield($getfield)
             ->buildOauth($url, $requestMethod)
             ->performRequest();


?>
