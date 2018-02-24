// Javascript Document
(() => {
  return function(ele, data){
    var $rc = $("input.recherche_icons", bbn.fn.get_popup()),
        $li = $("li", ele);
    $rc.keyup(function(){
      var v = $rc.val().toLowerCase();
      $li.show();
      if ( v.length ){
        $li.filter(function(){
          return $(this).find("i").attr("class").indexOf(v) === -1;
        }).hide();
      }
    });
    if ( !data.picker ){
      $li.find("button.k-button", ele).each(function(idx, i){
        $(i).click(function(){
          bbn.fn.popup($("#icon_copy_tpl").html(), "Copy icon", 250, 100, function(ele){
            var input = $("input.icon_name", ele),
                ctrl = false;
            input.val($(i).attr("class"));
            input.select();
            ele.on("keydown",function(k){
              if ( k.keyCode === 17 ){
                ctrl = true;
              }
              if ( (k.keyCode === 67) && ctrl ){
                bbn.fn.closePopup();
              }
            });
            ele.on("keyup", function(k){
              if ( k.keyCode === 17 ){
                ctrl = false;
              }
            });
          });
        });
      });
    }
  }
})();