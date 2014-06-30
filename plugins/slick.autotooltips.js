(function ($) {
  // Register namespace
  $.extend(true, window, {
    "Slick": {
      "AutoTooltips": AutoTooltips
    }
  });

  /**
   * AutoTooltips plugin to show/hide tooltips when columns are too narrow to fit content.
   * @constructor
   * @param {boolean} [options.enableForCells=true]        - Enable tooltip for grid cells
   * @param {boolean} [options.enableForHeaderCells=false] - Enable tooltip for header cells
   * @param {number}  [options.maxToolTipLength=null]      - The maximum length for a tooltip
   */
  function AutoTooltips(options) {
    var _grid;
    var _self = this;
    var _doubleTooltipListener;
    var _defaults = {
      enableForCells: true,
      enableForHeaderCells: false,
      maxToolTipLength: null,
      $scope: null,
      $compile: null
    };
    
    /**
     * Initialize plugin.
     */
    function init(grid) {
      options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      if (options.enableForCells) _grid.onMouseEnter.subscribe(handleMouseEnter);
      if (options.enableForHeaderCells) _grid.onHeaderMouseEnter.subscribe(handleHeaderMouseEnter);

        //Is required so that it can not happen that there are two tool tips at the same time
        //Sometimes that happened if the html elements from the grid were suddenly removed.
      if (options.$scope) {
          _doubleTooltipListener = options.$scope.$watch(function () {return $('body > div[tooltip-html-unsafe-popup]').length},
            function ()  {
              var elements = $('body > div[tooltip-html-unsafe-popup]');
              if (elements.length > 1) {
                  elements[0].remove();
              }
          });
      }
    }
    
    /**
     * Destroy plugin.
     */
    function destroy() {
      if (options.enableForCells) _grid.onMouseEnter.unsubscribe(handleMouseEnter);
      if (options.enableForHeaderCells) _grid.onHeaderMouseEnter.unsubscribe(handleHeaderMouseEnter);
      if (_doubleTooltipListener) _doubleTooltipListener();
    }
    
    /**
     * Handle mouse entering grid cell to add/remove tooltip.
     * @param {jQuery.Event} e - The event
     */
    function handleMouseEnter(e) {
      var cell = _grid.getCellFromEvent(e);
      if (cell) {
        var $node = $(_grid.getCellNode(cell.row, cell.cell));
        var text;
        if ($node.innerWidth() < $node[0].scrollWidth) {
          text = $.trim($node.text());
          if (options.maxToolTipLength && text.length > options.maxToolTipLength) {
            text = text.substr(0, options.maxToolTipLength - 3) + "...";
          }
        } else {
          text = "";
        }
        $node.attr("title", text);
      }
    }
    
    /**
     * Handle mouse entering header cell to add/remove tooltip.
     * @param {jQuery.Event} e     - The event
     * @param {object} args.column - The column definition
     */
    function handleHeaderMouseEnter(e, args) {
      var column = args.column,
          $node = $(e.target).closest(".slick-header-column");
      if (column && $node.attr('tooltip-html-unsafe') === undefined) {
        var tooltipName = column.longName ? _.unescape(column.longName) : column.name;

        if (options.$compile && options.$scope) {
            $node.attr("tooltip-html-unsafe", tooltipName);
            $node.attr("tooltip-append-to-body", true);
            options.$compile($node)(options.$scope);

            setTimeout(function (){
                $node.trigger('mouseenter');
            }, 0);

        } else {
            $node.attr("title", tooltipName);
        }
      }
    }
    
    // Public API
    $.extend(this, {
      "init": init,
      "destroy": destroy
    });
  }
})(jQuery);
