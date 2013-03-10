
$(document).ready(function() {

	// http://papermashup.com/read-url-get-variables-withjavascript/
	function getUrlVars() {
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    return vars;
	}


//
// Setup and "global" variables
//

	var kUseGutenberg		= 1,
		kUseTwitter			= 2,
		kUseBoth			= 3,

		outputSetting		= kUseGutenberg,

		fetching 			= false, 
		fetchingGutenberg	= false,
		fetchingTweets		= false,
		tweetsPage			= 1,
		kTweetFetchLimit	= 99,
		kTweetFetchMin		= 30,

		footerPosition		= "above",

		savedArray			= [],
		textArray			= [];

		if ( getUrlVars()["state"] == "twitter" ) {
			outputSetting = kUseTwitter;
			$("#twitterButton").addClass("selectedButton");
		} else if ( getUrlVars()["state"] == "both" ) {
			outputSetting = kUseBoth;
			$("#bothButton").addClass("selectedButton");
		} else if ( {
			$("#gutenbergButton").addClass("selectedButton");
		}

//
// Initial state
//

	$("#about").hide();



//
// Handle button events and header animation
//

	$("#iconStart img").hover(function() {
		$(this).css("background-color","#eca742");
	}, function() {
		$(this).css("background-color","#336699");
	});
	$("#iconStart img").click(function() {
		$(document).scrollTop(100);
	});

	$(".prefsButton").hover(function() {
		$(this).addClass("buttonHover");
	}, function() {
		$(this).removeClass("buttonHover");
	});
	$(".prefsButton").click( function(e) {
			$(".prefsButton").removeClass("selectedButton");
			$(e.target).addClass("selectedButton");

			if ( e.target.text == "Twitter" ) {
				outputSetting = kUseTwitter;
			} else if ( e.target.text == "Gutenberg" ) {
				outputSetting = kUseGutenberg;
			} else {
				outputSetting = kUseBoth;
			}

			$("#quotes").html("...");
			textArray = [];
			fetcher();
	});

	$("#aboutButton").hover(function() {
		$(this).css("background-color","#eca742");
	}, function() {
		$(this).css("background-color","#000");
	});
	$("#aboutButton").click( function(e) {
		$("#about").lightbox_me({ centered: true });
		e.preventDefault();
	});

	$("#icon").hover(function() {
		$(this).css("background-color","#eca742");
	}, function() {
		$(this).css("background-color","#336699");
	});
	$("#icon").click( function() {
		$("#footer").animate({top: 0}, 500, 'swing');
		$("#icon").animate({top: -80}, 500);
	});

	$("#closeButton").click( function() {
		$("#footer").animate({top: -100}, 500, 'swing');
		$("#icon").animate({top: 4}, 500);
	});


//
// Fetch Text
//

	fetcher = function() {

		textArray = [];

		if ( outputSetting == kUseBoth || outputSetting == kUseGutenberg ) {

			fetchingGutenberg = fetching = true;

			$.getJSON(
				'getPGQuotes.php?cachebust=' + Math.random(),
				function(data) {
					fetchingGutenberg = false;
					$.each(data, function(i, quote) {
						textArray.push(quote + " ");
					});
					displayText(textArray);
				}
			);
		}

		if ( outputSetting == kUseBoth || outputSetting == kUseTwitter ) {

			fetchingTweets = fetching = true;

			var numOfTweets = ( outputSetting == kUseBoth ) ? kTweetFetchMin : kTweetFetchLimit;

			$.getJSON(

				'http://search.twitter.com/search.json?callback=?&rpp='+numOfTweets+'&page='+tweetsPage+'&q=%22I%20saw%20a%22+exclude:retweets',
				function(data) {
					
					fetchingTweets = false;

				 	$.each(data.results, function(i, tweet) {

					if(tweet.text !== undefined) {
						var match = tweet.text.match(/^I saw/i);
						var shortTweet = "";
						if ( match ) {
							shortTweet = tweet.text.substr(match.index);
							
							shortTweet = shortTweet.replace(/^i/,"I");						// uppercase the I in "I see"
							shortTweet = shortTweet.replace(/http:\/\/.*/g,"");				// remove (basic) URLS
							shortTweet = shortTweet.replace(/[^\x00-\x7f-\x80-\xad]/g,"");	// remove emoticons

							if (/[a-zA-Z0-9]$/.test(shortTweet)) {
								shortTweet += ".";
							}
							shortTweet += " ";
						  	textArray.push(shortTweet);
						}
					}
				  });
				  tweetsPage++;
				  displayText(textArray);
				}
			  );
			
		}
	};


//
// Display text
//

	displayText = function(data) {

		if ( outputSetting == kUseBoth ) {
			if ( fetchingTweets === true || fetchingGutenberg === true ) {
				return;
			}
		}

		fetching = false;

		// remove duplicates from incoming feed
		// http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
		var uniqueItems = [];
		$.each(data, function(i, el){
		    if($.inArray(el, uniqueItems) === -1) uniqueItems.push(el);
		});

		// remove duplicates if they exist upstream
		var len = savedArray.length;
		for (var i=0;i<len;i++) {
			var j = savedArray[i];
			uniqueItems = _.without(uniqueItems,j);
		}

		//+ Jonas Raoni Soares Silva http://jsfromhell.com/array/shuffle [v1.0]
		for(var j, x, i = uniqueItems.length; i; j = parseInt(Math.random() * i), x = uniqueItems[--i], uniqueItems[i] = uniqueItems[j], uniqueItems[j] = x);

		var concatedLines = uniqueItems.join('');

		$("#quotes").append(concatedLines);

		console.log("uniqueItems.length: " + uniqueItems.length);
		savedArray = savedArray.concat(uniqueItems);
		if ( savedArray.length > 2000 ) {
			savedArray = [];
		}
	};


//
// Handle infinite scrolling
//

	// based on: http://www.jquery4u.com/snippets/jquery-capture-vertical-scroll-percentage/
	$(window).scroll(function(){

		watchForHeader();

		var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
		var  scrolltrigger = 0.90;
		if  ((wintop/(docheight-winheight)) > scrolltrigger) {
		   if ( !fetching ) {
			fetcher();
		   }
		}
	});

	watchForHeader = function() {
		if ( $(window).scrollTop() > ( $("#iconStart").position().top + $("#iconStart").height() )) {
			if ( footerPosition == "above" ) {
				footerPosition = "below";
				$("#footer").animate({top: 0}, 500, 'swing');
			}
		}
		if ($(window).scrollTop() < 60 && footerPosition == "below") {
			footerPosition = "above";
			$("#footer").animate({top: -80}, 500, 'swing');
			$("#icon").animate({top: -80}, 500);
		}
	}

//
// Begin!
//

	fetcher();

});

