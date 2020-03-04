/*
CardGrid v0.0.1
Copyright 2020 Joseph Cloutier

----------------------------------
cardGrid is released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

jQuery.fn.extend({
  cardGrid: function (opts) {
    if (typeof opts == "string") {
      var action =`${opts}`;
      opts={};
    }
    var dopts= {
      navigation: true,
      animation: true,
      loader: true,
      formatters: {
        heading: null,
        body: null,
        footer: null
      },
      templates: {
        grid: `<div class="grid"></div>`,
        gridItem: `<div class="grid-item"></div>`,
        basicCard: `<div class="card"><div class="card-heading"></div><div class="card-body"></div><div class="card-footer"></div></div>`,
        pageWrapper: `<div class="gridPager btn-group mb-lg"></div>`,
        pageButton: `<a class="btn"></a>`,
        loader: `<div class="text-center loading">Loading ..</div>`,
        actionBar: `<div class="btn-group gridAction pull-right"></div>`,
        search: ``,
        actionButton: `<a class="btn"></a>`
      },
      text: {
        items: 'items',
        noRows: '<div class="text-center mt-lg mb-lg">No {@items} to show.</div>',
        summary: '{@first} to {@last} of {@total} {@items}.'
      },
      nav: {
        current: 1,
        rowCount: 10,
        sort: 'id',
        sortDir: 'asc',
        total: 0
      },
      classes: {
        card: '',
        heading: '',
        actionBut: 'btn-lg btn-default',
        pageButton: 'btn-lg btn-default'
        /*body: '',
        footer: ''*/
      },
      requestHandler: function(request) {
        return request;
      },
      responseHandler: function(response) {
        if (response.status == 'no_sess') {  }
        return response;
      },
    }, settings;
    opts.nav = Object.assign(dopts.nav,opts.nav);
    opts.classes = Object.assign(dopts.classes,opts.classes);
    opts.templates = Object.assign(dopts.templates,opts.templates);
    opts.text = Object.assign(dopts.text,opts.text);
    opts.formatters = Object.assign(dopts.formatters,opts.formatters);
    opts = Object.assign(dopts,opts);
    var gridParent = $(this);
    if (!gridParent.data('gridLoaded')) {
      if (action) { console.log("Grid not loaded, but action already called. Load grid first.",action); return; }
      gridParent.data('gridLoaded',true);
      gridParent.data('gridOptions',opts);
      //generate card grid html and append it to the parent object.
      var grid = $(opts.templates.grid);
      var pager = $(opts.templates.pageWrapper);
      var actionBar = $(opts.templates.actionBar);
      grid.appendTo(this);
      actionBar.prependTo(this);
      pager.prependTo(this);
      var bottomPager = pager.clone().css('width','100%');
      bottomPager.appendTo(gridParent);
      action="reload";
    }
    settings=gridParent.data('gridOptions');
    //switch action for different operations
    switch (action) {
      case 'reload':
        // -- reload -- just refresh the grid contents
        var data = {current: settings.nav.current, rowCount: settings.nav.rowCount};
        data[`sort[${settings.nav.sort}]`] = settings.nav.sortDir;
        if (settings.requestHandler) data=settings.requestHandler.call({},{...data});
        // -- find grid and page wrapper, and clear them.
        grid = $(gridParent).find('.grid').first();
        pager = $(gridParent).find('.gridPager');
        //gridParent.find('.reloadButton > i').first().addClass('fa-spin');
        if (settings.loader) grid.html(settings.templates.loader);
        // -- post to the url, and get the results.
        $.post(settings.url,data,function (body) {
        	//gridParent.find('.reloadButton > i').first().removeClass('fa-spin');
          body = JSON.parse(body);
          pager.html('');
          if (!settings.loader) grid.children().remove();
          // create the masonry.
          var masonry=grid.masonry({
            isAnimated: settings.animation,
            itemSelector: '.grid-item',
            percentPosition: true,
            animationOptions: {
              duration: 750,
              easing: 'linear',
              queue: true
            },
            columnWidth: '.grid-sizer'
          });
          //adjust our current nav settings to reflect server data.
          settings.nav.current=body.current;
          settings.nav.total=body.total;
          if (settings.responseHandler) body=settings.responseHandler.call({},{...body});
          grid.html('<div class="grid-sizer"></div>');
          var elems = [];
          
          // -- create new grid items and buttons for pager.
          var onRow = 0;
          body.rows.forEach(function (row,i) {
            var parts = {
              heading: settings.formatters.heading ? settings.formatters.heading(i,row) : '',
              body: settings.formatters.body ? settings.formatters.body(i,row) : '',
              footer: settings.formatters.footer ? settings.formatters.footer(i,row) : ''
            };
            // -- if there is an array passed in, generate buttons from it.
            if (typeof parts.footer == "object") {
              var newFooter = $('<div class="card-footer btn-group"></div>');
              parts.footer.forEach(function (btnSettings) {
                var button = $(settings.templates.actionButton)
                  .html(btnSettings.html)
                  .addClass(btnSettings.classes)
                  .prop('href',btnSettings.href)
                  .click(function (e) {
                    if (btnSettings.click) {
                    	btnSettings.click.call(gridParent,e,row);
                    }
                  });
                button.appendTo(newFooter);
              });
            }
            // -- generate the card template.
            var newCard = $(settings.templates.basicCard).addClass(settings.classes.card);
            newCard.find('.card-heading').first().addClass(settings.classes.heading).html(parts.heading);
            newCard.find('.card-body').first().addClass(settings.classes.body).html(parts.body);
            if (newFooter) {
              newCard.find('.card-footer').first().replaceWith(newFooter);
            }
            else newCard.find('.card-footer').first().addClass(settings.classes.footer).html(parts.footer);
            var newGI = $(settings.templates.gridItem).append(newCard);
            grid.append(newGI); // -- append it to the masonry.
            onRow++;
            if (onRow >= body.rows.length) {
		          // -- this will animate the cards into position.
			          if (settings.animation) grid.masonry('reloadItems');
			          grid.masonry('layout');
            }
          });
          var reloadButton = $(settings.templates.actionButton).addClass(settings.classes.actionBut+" reloadButton").click(function () {
            $(gridParent).cardGrid("reload");
          });
          reloadButton.html('<i class="fas fa-redo"></i>');
          reloadButton.appendTo(actionBar);
          if (body.rows.length == 0) { grid.append(`<span>${settings.text.noRows.replace('{@items}',settings.text.items)}</span>`); }
          else {
            // -- make up the pager buttons, and assign events to them. then append them above the grid.
            // ---- make basic buttons first (prev,next,first,last)
            var buttons = 0, totalPages = Math.ceil(body.total / settings.nav.rowCount);
            if (totalPages < 1) totalPages = 1;
            var prev = $(settings.templates.pageButton).addClass(settings.classes.pageButton).html('<i class="fas fa-caret-left"></i>').click(function () {
              // code for prev
              settings.nav.current--;
              if (settings.nav.current < 1) settings.nav.current=1;
              $(gridParent).cardGrid("reload");
            });
            var next = $(settings.templates.pageButton).addClass(settings.classes.pageButton).html('<i class="fas fa-caret-right"></i>').click(function () {
              // code for next
              settings.nav.current++;
              if (settings.nav.current > totalPages) settings.nav.current=totalPages;
              $(gridParent).cardGrid("reload");
            });
            prev.appendTo(pager);
            //we setup this loop, as such, only 5 buttons will be created.
            for (var pi=settings.nav.current - 2; pi <= totalPages && buttons < 5; pi++) {
              if (pi <= 0) continue;
              var newButton = $(settings.templates.pageButton).addClass(settings.classes.pageButton);
              newButton.html(pi);
              if (pi == settings.nav.current) { newButton.addClass('text-bold'); } // make current page bold.
              newButton.click(function () {
                settings.nav.current=parseInt($(this).html(),10);
                $(gridParent).cardGrid("reload");
              });
              newButton.appendTo(pager);
              buttons++;
            }
            next.appendTo(pager);
            // fire off an event to be used for assigning jquery after cards are loaded.
            $(gridParent).trigger("cg.loaded",[body.rows]);
          }
        });
        break;
        
      case 'clear':
        // -- clear -- clear the entire grid
        $(gridParent).children('.grid-item').remove();
        break;
        
      case 'destroy':
        // -- destroy -- destroy the grid and its events.
        $(gridParent).children().remove();
        gridParent.data('gridOptions',null);
        gridParent.data('gridLoaded',null);
        break;
    }
    return $(this);
  }
});
