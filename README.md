# jQuery cardGrid
cardGrid is a simple grid display system for displaying ajax data within Masonry.js, and is loosely based on jQuery Bootgrid. However, it contains 100% original source code.

# Requirements
cardGrid only requires jQuery, Masonry.js, and Bootstrap 3+

# Installation
Place the cardgrid.js file on your web server, and include it on your web page after the requirements.

    <script type="text/javascript" src="/js/cardgrid/cardgrid.js"></script>

# Basic Usage
Once you have the script on your page, you can call `cardGrid(options)` on any element.

    $(() => {
    	$('#testGrid').cardGrid(
				{
					url: '/myRemoteScript',
					formatters: {
					heading: (c,r) => { return `My item! ${r.id}` },
					body: (c,r) => { return `Look at my sexy body. ${r.name}` },
					footer: (c,r) => { return `<a class="btn btn-primary">Nice button!</a>` }
				}
    	});
    });

## Sever request example (basic)
As mentioned in the intro, cardGrid is loosely based on Bootgrid, and the expected data is organized the same way:

    {
    	current: 1, 		// Our current page
    	rowCount: 10, 		// The results per page
    	sort[id]: "desc" 	// Sort by "id", descending.
    }
	

## Server response example
As mentioned in the intro, cardGrid is loosely based on Bootgrid, and the expected data is organized the same way:

    {
    	current: 1, 		// Our current page
    	rowCount: 10, 		// Results per page
    	total: 20, 		// The total number of rows, before paging.
    	rows: [] 		// An array of objects representing each card
    }


# Options 
## `options.url`
 (default: `null`)
 URL is, obviously the server resource, in which cardGrid will post to for its cards.
 
## `options.animation`
(default: `true`)
Use this to disable the layout animation from masonry.js. This basically skips the reloadItems call on the grid masonry. To disable the animations universally, set `options.animatePage` to `false` as well.

## `options.animatePage`
(default: `true`)
This will enable/disable animations when a user clicks a pagination button. It will ignore the setting above.

## `options.loader`
(default: `true`)
Whether or not to show the "loading" text from `options.templates.loader`. You'll want to disable this if you're refreshing your grids on an interval, to prevent blinking card items.

## `options.templates`
An object defining custom templates. These are raw html used to generate the grid. 

 - `basicCard`  - The card template, wrapping all of the other contents.
 - `heading` - The element wrapping the card headers.
 - `body` - The element wrapping the card bodies.
 - `footer` - The element wrapping the card footer. 
 - `loader` - The element shown while ajax items are loading.
 - `pageWrapper` - The element wrapping the pagination buttons.
 - `pageButton` - The element pagination buttons  are generated from.
 - `actionBar` - The bar that wraps other actions like 'refresh'. 
 - `actionButton` - The element action buttons are  generated from.

## `options.classes`
An object defining classes that are appended to the template elements. (Note: these are **appended** and do not replace the classes defined within templates.)

 - `card`
 - `heading`
 - `body`
 - `footer`
 - `actionButton`
 - `pageButton`

## `options.text`
An object defining the text displayed by cardGrid.	

 - `items` - A general name for items on the grid. Default: `"items"`
 - `noRows` - The message displayed hen there are no cards to generate. Use`{@items}` as a placeholder for the items data. Default: `"No{@items} to show"`
 - `summary` - The summary of the grid. Default: `"{@first} to {@last} of {@total} {@items}."`

## `options.formatters`
This object defines the functions that control card contents. These functions are synchronous and must `return` the html value.

 - `heading`
 - `body`
 - `footer` - The footer includes the ability to use a built in button generator, by returning an array of objects defining the buttons.
Example: `return [{html: 'My Button', href: '/my/link', classes: 'btn-warning', click: (e,row) => {  console.log("click!"); }}]`

The click event for each button passed to the button generator receives it's respective row data as the second argument, much like in `options.formatters`, which simplifies your button building.

## `options.nav`
This object defines the navigation parameters.

 - `rowCount` - (default: `10`) The number of results per page.
 - `current` - (default: `1`) The current page.
 - `sort` - (default: `null`) The column to sort by. Used to assemble the server request.
 - `sortDir` - (default: `null`) The sorting direction. `asc` or `desc`, normally.

## `options.responseHandler`
This is a function used to modify the response data.

    options.responseHandler = function (res) {
			/*add time grid was updated to the results object*/
    	res.updated = parseInt(Date.now() / 1000,10);
    	return res;
    };

## `options.requestHandler`
This is a function used to modify the request data.

    options.responseHandler = function (req) {
	    /*add extra form data to the request*/
	    req.filter = "value";
	    return res;
    };

# Methods

## "reload"
This simply reloads the grid data from the server, and regenerates the grid.

    $('#testDiv').cardGrid("reload");

## "destroy"
This will destroy the grid, and any child elements, returning it to its original state.

    $('#testDiv').cardGrid("destroy");

# Events
Currently, cardGrid has one single event, triggered when the grid has completed loading all child elements, and is emitted from the parent element.

## .on('cg.loaded')

    $("#testDiv").on("cg.loaded", function (e,rows) {
    	// do something
    });
