/* jslint esversion: 6 */
window.apst = {

  statuts: {
    radie: "Radié",
    adherent: "Adhérent",
    groupe: "Groupe",
    prospect: "Prospect"
  },

  historique_type: function(d){
    var op;
    if ( (typeof(d.operation) !== 'undefined') &&
      (op = bbn.fn.get_row(apst.historiques, "value", d.operation)) ){
      return '<span style="color:' + op.color + '">' + op.text + '</span>';
    }
    return "";
  },

  historiques: [{
    text: "Insertion",
    value: "INSERT",
    color: "green"
  },{
    text: "Modification",
    value: "UPDATE",
    color: "blue"
  },{
    text: "Suppression",
    value: "DELETE",
    color: "red"
  },{
    text: "Restauration",
    value: "RESTORE",
    color: "orange"
  }],

  fnom: function(inf){
    var r = '';
    if ( inf.civilite && inf.civilite !== 'I' ){
      r += inf.civilite + ' ';
    }
    r += inf.nom;
    if ( inf.prenom ){
      r += ' ' + inf.prenom;
    }
    return r;
  },

  frcs: function(rcs){
    rcs = rcs.toString();
    if ( rcs.length === 9 ){
      return rcs.substr(0, 3) + ' ' + rcs.substr(3, 3) + ' ' + rcs.substr(6);
    }
    return rcs;
  },

  fimmat: function(im){
    if ( !im ){
      return "En cours";
    }
    im = im.toString();
    if ( im.length === 11 ){
      return im.substr(0, 2) + ' ' + im.substr(2, 3) + ' ' + im.substr(5, 2) + ' ' + im.substr(7);
    }
    return im;
  },

  // Adresse complète multilignes
  fadresse: function(inf){
    var r = '';
    if ( inf.adresse ){
      r += inf.adresse.replace("\n", "<br>") + '<br>';
    }
    if ( inf.cp ){
      r += inf.cp + ' ';
    }
    if ( inf.ville ){
      r += inf.ville;
    }
    return r;
  },

  // Adresse pour dropdowns
  ladresse: function(inf){
    var r = '';
    r += inf.adresse.length > 20 ? inf.adresse.substr(0, 20) + '...' : inf.adresse;
    if ( inf.cp && inf.ville ){
      r += ' ' + inf.cp + ' ' + inf.ville;
    }
    return r;
  },

  templates: {},

  get_template: function(name){
    if ( !this.templates[name] ){
      this.templates[name] = kendo.template($("#tpl-" + name).html());
    }
    return this.templates[name];
  },

  js_pattern: new RegExp('^/(.+)/$'),

  calcul_cgar: function(d){
    var s = [], r = {};
    $.each(apst.filtre_cgar(d), function(i, a){
      if ( !r[a.type] ){
        r[a.type] = parseInt(a.montant);
      }
      else{
        r[a.type] += parseInt(a.montant);
      }
    });
    for ( var i in r ){
      s.push({type:i, montant: r[i]});
    }
    return s;
  },

  filtre_cgar: function(d){
    var s = [];
    $.each(d, function(i, a){
      var dt = new Date();
      if ( !a.fin || dt.parseSQL(a.fin).isAfter() ){
        s.push(a);
      }
    });
    return s;
  },

  link_email: function(em){
    return em ? '<a href="mailto:'+em+'">'+em+'</a>' : '<em>non défini</em>';
  },

  getAdhObj: function(ele){
    return ele ? ele.closest("div.fiche_adherent").data("adherent") : $("div.fiche_adherent:visible").data("adherent");
  },

  get_adhID: function(ele){
    var div = ele ? ele.closest("div.fiche_adherent") : $("div.fiche_adherent:visible");
    return div.length ? div.data("adherent").id : false;
  },

  utilisateur: function(id){
    return bbn.fn.get_field(appui.apst.users, "value", id, "text") || "Inconnu!";
  },

  champ_recherche: function($ele){
    $ele.kendoComboBox({
      minLength: 1,
      placeholder: "Recherche",
      dataValueField: "id",
      dataTextField: "nom",
      delay: 500,
      filter: "contains",
      autoBind: false,
      change : function (e) {
        if (this.value() && this.selectedIndex == -1) {
          var dt = this.dataSource._data[1];
          this.value("");
        }
        return 1;
      },
      template: function(d){
        return '<div  class="' + d.statut + '"><h4>' + d.nom + ' <em>' + d.immatriculation + '</em></h4><p>' + d.match + '</p></div>';
      },
      dataSource: new kendo.data.DataSource({
        serverFiltering: true,
        serverGrouping: true,
        transport: {
          read: function(e){
            bbn.fn.log(e);
            var v = false;
            try {
              v = e.data.filter.filters[0].value;
            }
            catch (e){
              v = $ele.val();
            }
            if ( (typeof(v) === 'string') && ( v.isInteger() || (v.length > 2)) ){
              bbn.fn.post("adherents", {value: v}, function(d){
                if ( d && d.data ){
                  e.success(d.data);
                }
                else{
                  e.success([]);
                }
              });
            }
            else{
              e.success([]);
            }
          }
        }
      })
    });
  },

  is_actif: function(statut, prospect){
    if ( (statut === 'prospect') && prospect ){
      let idx = bbn.fn.search(appui.options.prospect, {value: prospect});
      if ( (idx > -1) && ($.inArray(appui.options.prospect[idx].code, ['accepte', 'reserve', 'en_cours']) === -1) ){
        return false;
      }
    }
    if ( statut === 'radie' ){
      return false;
    }
    return true;
  },

  get_couleur: function(statut, prospect){
    switch ( statut ){
      case "adherent":
        return "#00BD00";
      case "groupe":
        return "#06A6A8";
      case "radie":
        return "#AC0606";
      case "prospect":
        if ( prospect && !apst.is_actif(statut, prospect) ){
          return "#CC6633";
        }
        return "#A78C2B";
    }
  },

  get_adherent_class: function(statut, prospect){
    switch ( statut ){
      case "adherent":
        return "adherent";
      case "groupe":
        return "groupe";
      case "radie":
        return "radie";
      case "prospect":
        if ( prospect && !apst.is_actif(statut, prospect) ){
          return "prospectold";
        }
        return "prospect";
    }
  },

  chartChange: function(e){
    var type = $("#As9275dK2D45gm2C0JSS033sd").data("kendoDropDownList");
    bbn.fn.post("home_chart", {type: type.value()}, function(d){
      if ( d.data ){
        //chart.dataSource.data(d.data);
        appui.home.set("stats", d);
      }
    });
  },

  userName: function(id){
    return bbn.fn.get_field(appui.users, "value", id, "text");
  },

  userGroup: function(id){
    return bbn.fn.get_field(appui.users, "value", id, "id_group");
  },

  userAvatar: function(id){
    var av = bbn.fn.get_field(appui.apst.users, "value", id, "avatar");
    return av ? av : bbn.var.defaultAvatar;
  },

  userAvatarImg: function(id){
    var av = apst.userAvatar(id),
        name = apst.userName(id);
    return '<span class="appui-avatar"><img src="' + av + '" alt="' + name + '" title="' + name + '"></span>';
  },

  userFull: function(id){
    var user = bbn.fn.get_row(appui.apst.users, "value", id);
    return '<span class="appui-avatar"><img src="' + user.avatar + '" alt="' + user.text + '"> ' + user.text + '</span>';
  }
};

bbn.fn.init({
  env: {
    lang: "fr",
    logging: document.location.href.indexOf("localhost") ? 1 : false,
    connection_failures: 0,
    connection_max_failures: 10
  },
  fn: {
    ajaxErrorFunction: function (jqXHR, textStatus, errorThrown) {
      /** @todo */
      //var id = appui.notification.error({title: textStatus, content: errorThrown}, 4);
      return false;
    },

    defaultHistoryFunction: function (state) {
      var r = [];
      /** @todo */
      /*
      if ((i = appui.tabnav.ele.tabNav("search", state.data.url)) > -1) {
        appui.tabnav.ele.tabNav("activate", state.data.url);
        var t = [];
        return false;
      }
      */
      return 1;
    },

    defaultPreLinkFunction: function (url, force, ele) {
      if (url === 'logout') {
        bbn.fn.post('logout');
        return false;
      }
      if ( appui.$refs.tabnav ){
        appui.$refs.tabnav.activate(url, force);
      }
      return false;
    },

    defaultResizeFunction: function () {
      /** @todo */
      bbn.fn.redraw(document.body, true)
    },

    defaultAlertFunction: function(ele) {
      /** @todo */
      //ele.find("form").kendoValidator().parent().addClass('k-edit-form-container');

    },

    defaultStartLoadingFunction: function(url, id){
      if ( window.appui && appui.$refs.loading ){
        appui.$refs.loading.start(url, id);
        return id;
      }
    },

    defaultEndLoadingFunction: function(url, id, data, res){
      if ( window.appui && appui.$refs.loading ){
        appui.$refs.loading.end(url, id, data, res);
      }
    },

    money: function (m) {
      return kendo.toString(parseInt(m), "n0");
    },

    fdate: function (d, wrong_result) {
      var r;
      if ((typeof(d) === 'string') && (d.length > 5) && (d.substring(d.length - 5, d.length - 4) === '.')) {
        d = Math.floor(d);
      }
      if ((typeof(d) === 'number') && (d > 0)) {
        if (d < 10000000000) {
          d = d * 1000;
        }
        r = new Date(d);
      }
      else {
        try {
          r = kendo.parseDate(d);
        }
        catch (err) {
          r = d;
        }
      }
      if (!r) {
        return wrong_result ? wrong_result : '';
      }
      if (r.isSame && r.isSame(new Date())) {
        r = kendo.toString(r, 'H:mm');
        if (r === '0:00') {
          r = "Aujourd'hui";
        }
        return r;
      }
      else {
        return kendo.toString(r, 'd');
      }
    },

    correctGridPost: function (d) {
      if (d.filters) {
        for (var i = 0; i < d.filters.length; i++) {
          d.filters[i] = bbn.fn.correctGridPost(d.filters[i]);
        }
      }
      else if (d.value && (typeof(d.value) === 'object') && $.isFunction(d.value.isBefore)) {
        d.value = d.value.getSQL(1);
      }
      return d;
    },

    gridParse: function (data, grid) {
      var cfg, type, objects = [];
      if (grid) {
        cfg = grid.options.dataSource.schema.model.fields;
        for (var n in cfg) {
          if (cfg[n].type && data[n] && cfg[n].type === 'date') {
            data[n] = kendo.parseDate(data[n]);
            data[n] = kendo.toString(data[n], 'yyyy-MM-dd HH:mm:ss');
          }
          else if (cfg[n].type === 'boolean') {
            data[n] = data[n] ? 1 : 0;
          }
        }
      }
      else {
        for (var n in data) {
          type = $.type(data[n]);
          if (type === 'date') {
            data[n] = kendo.parseDate(data[n]);
            data[n] = kendo.toString(data[n], 'yyyy-MM-dd HH:mm:ss');
          }
          else if (type === 'boolean') {
            data[n] = data[n] ? 1 : 0;
          }
        }
      }
      return data;
    },

    text2value: function (arr) {
      var tmp = [];
      $.each(arr, function (i, v) {
        tmp.push({text: v.text, value: v.text});
      });
      return tmp;
    },

    bool2checkbox: function (obj, prop) {
      if (obj && obj.data && (obj.data[prop] !== undefined)) {
        obj.data[prop] = obj.data[prop] ? 1 : false;
        if (!obj.data[prop]) {
          delete obj.data[prop];
        }
      }
    },

    hideUneditable: function (e) {
      if (e.sender && e.sender.columns && e.model && e.model.fields) {
        if ( e.model.fields && $.isArray(e.model.fields) ){

        }
        var f, ok;
        for (var i = 0; i < e.sender.columns.length; i++) {
          f = e.sender.columns[i].field;
          ok = 1;
          if ( $.isArray(e.model.fields) ){
            var idx = bbn.fn.search(e.model.fields, "field", f);
            if ( (idx > -1) &&
              (e.model.fields[idx].editable !== undefined) &&
              !e.model.fields[idx].editable
            ){
              ok = false;
            }
          }
          else if (e.model.fields[f] && (e.model.fields[f].editable === false)) {
            ok = false;
          }
          if ( !ok ){
            e.container.find("div.k-edit-field").eq(i).hide().prev().hide();
          }
        }
      }
    },

    formValidator: function (ele) {
      ele.kendoValidator({
        messages: {
          required: function (input) {
            var $par,
                $label,
                name = input.attr("name"),
                title = input.attr("title");
            if (!title) {
              $par = input.parents(".bbn-form-field").first();
              if ($par.length) {
                $label = $par.prev(".bbn-form-label");
                if ($label.length) {
                  title = $label.text();
                }
              }
            }
            if (title) {
              return "Le champ " + title + " est obligatoire!";
            }
            return "Le champ est obligatoire!";
          }
        }
      });
    },

  },
  lng: {
    select_unselect_all: "Tout (dé)sélectionner",
    search: "Rechercher",
    close: "Fermer",
    closeAll: "Tout fermer",
    closeOthers: "Fermer les autres",
    pin: "Épingler",
    unpin: "Décrocher",
  },
  opt: data.options
});

/*
bbn.opt._cat = data.options_categories;

appui.apst.suiveurs = $.grep(appui.apst.users, function(v){
  return (v.id_group === 7) || (v.id_group === 8);
});
*/
bbn.var.defaultAvatar = "data.defaultAvatar";
/*
if ( bbn.tasks === undefined ){
  bbn.tasks = {
    priority_colors: ['#F00', '#F40', '#F90', '#FC0', '#9B3', '#7A4', '#5A5', '#396', '#284', '#063'],
    categories: data.task_categories,
    states: data.task_states,
    roles: data.task_roles,
    options: data.task_options,
  };
}*/


bbn.vue.setDefaultComponentRule('components/', 'apst');
bbn.vue.addComponent('widget/adh');
bbn.vue.addComponent('widget/link');
bbn.vue.addComponent('widget/lieu');
bbn.vue.addComponent('widget/tier');
bbn.vue.addComponent('widget/bug');
bbn.vue.addComponent('widget/cgar');
bbn.vue.addComponent('widget/doc');
bbn.vue.addComponent('widget/dossiers');
bbn.vue.addComponent('widget/modifs');
bbn.vue.addComponent('widget/msg');
bbn.vue.addComponent('widget/note');
bbn.vue.addComponent('widget/pdt');
bbn.vue.addComponent('widget/stats');
bbn.vue.addComponent('widget/svn');
bbn.vue.addComponent('widget/user');
bbn.vue.addComponent('widget/cotis-valid');
bbn.vue.addComponent('map');



$.extend(bbn.lng, data.lng);

$.extend(bbn.env, {
  pages: [],
  logging: data.is_dev || data.is_test ? true : false,
  isDev: data.is_dev ? true : false,
  lang: "fr",
  siteTitle: data.site_title,
  wp_url: data.wp_url,
  userId: data.user_id,
  groupId: data.group_id,
  userName: data.username
});

/*
bbn.fn.log("DATA", data);
const store = new Vuex.Store({
  state: {a
    lang: "fr",
    opt: data.options,
    notifications: [],
    loading: []
  },
  mutations: {
    addNotification(state, msg, type){
      state.notifications.push({
        msg: msg,
        type: type ? type : 'info'
      });
    },
    addLoading(msg, id){
      state.loading.push({
        file: msg,
        id: id
      });
    },

  }
});
*/

bbn.users = data.users;
bbn.groups = data.groups;

Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` is a Vue-specific error info, e.g. which lifecycle hook
  // the error was found in. Only available in 2.2.0+
  bbn.fn.log("ERROR", err, vm, info);
};

window.adherentAPSTMixin = {
  methods: {
    getTab(){
      return bbn.vue.closest(this, 'bbn-tab');
    },
    popup(){
      return this.getTab().popup.apply(this, arguments);
    }
  }
};

if ( data.shortcuts ){
  data.shortcuts.unshift({
    url: 'pm/panel',
    text: bbn._("Tâches"),
    icon: 'fa fa-bug'
  });
  data.shortcuts.unshift({
	  url: 'usergroup/main',
  	text: bbn._("Mon profil"),
  	icon: 'fa fa-user'
  });
  data.shortcuts.unshift({
    url: 'dashboard',
    text: bbn._("Tableau de bord"),
    icon: 'fa fa-dashboard'
  });
	data.shortcuts.unshift({
    command(){
      appui.popup().load('help');
    },
    text: bbn._("Help"),
    icon: 'zmdi zmdi-help'
  });
  data.shortcuts.push({
    command(){
      bbn.fn.toggle_full_screen();
    },
    text: bbn._("Plein écran"),
    icon: 'fa fa-arrows-alt'
  });
  data.shortcuts.push({
    url: 'logout',
    text: bbn._("Sortir"),
    icon: 'fa fa-sign-out'
  });
}

window.appui = new Vue({
  mixins: [bbn.vue.resizerComponent],
  el: '#appui',
  data: {
    width: 0,
    height: 0,
    popups: [],
    vlist: [],
    url: bbn.env.path,
    users: data.users,
    options: $.extend(data.options, {tasks: data.tasks}),
    widgets: {},
    notifications: [],
    menuOpened: false,
    // configuration de l'éditeur kendo
    editorCfg: {
      encoded: false,
      tools: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "justifyLeft",
        "justifyCenter",
        "justifyRight",
        "justifyFull",
        "insertUnorderedList",
        "insertOrderedList",
        "indent",
        "outdent",
        "createLink",
        "unlink",
        "insertImage",
        "subscript",
        "superscript",
        "createTable",
        "addRowAbove",
        "addRowBelow",
        "addColumnLeft",
        "addColumnRight",
        "deleteRow",
        "deleteColumn",
        "viewHtml",
        "formatting",
        "fontName",
        "fontSize",
        "foreColor",
        "backColor"
      ]
    },
    apst: {
      mois: [
        {value:1, text: "janvier"},
        {value:2, text: "février"},
        {value:3, text: "mars"},
        {value:4, text: "avril"},
        {value:5, text: "mai"},
        {value:6, text: "juin"},
        {value:7, text: "juillet"},
        {value:8, text: "août"},
        {value:9, text: "septembre"},
        {value:10, text: "octobre"},
        {value:11, text: "novembre"},
        {value:12, text: "décembre"},
      ],
      modeles_courriers: data.modeles_courriers,
      justificatifs: data.justificatifs,
      justificatif_defaut: data.justificatif_defaut,
      bureaux: data.bureaux,
      statuts: data.statuts,
      tables: data.tables,
      civs: data.civs,
      pdf_cfg: data.pdf_cfg,
      roles: data.roles,
      docs: data.docs,
      groups: data.groups,
      expertises: data.expertises,
      userid: data.userid,
      username: data.username,
      departements: data.departements,
      regions: data.regions,
      champs_dva: data.champs_dva
    },
    search: "",
    searchPlaceholder: "Rechercher par ID, nom, marque, adresse, contact, email, etc...",
    menus: data.menus,
    currentMenu: data.current_menu,
    list: [
      {
        url: "dashboard",
        title: "Tableau de bord",
        load: true,
        static: true
      }
    ],
    shortcuts: data.shortcuts,
    isMounted: false,
    debug: false,
    isOverDebug: false,
    fisheyeMounted: false,
    menuMounted: false
  },
  methods: {
    popup(obj){
      if ( !obj ){
        return this.$refs.popup;
      }
      return this.$refs.popup.open.apply(this, arguments);
    },

    loadPopup(obj){
      return this.$refs.popup.load.apply(this, arguments);
    },

    userName(d){
      return bbn.fn.get_field(this.users, "value", ($.type(d) === 'object') && d.id ? d.id : d, "text");
    },

    userGroup(d){
      return bbn.fn.get_field(this.users, "value", ($.type(d) === 'object') && d.id ? d.id : d, "id_group");
    },

    notify(obj, type, timeout){
      return this.$refs.notification.show(obj, type, timeout);
    },

    error(obj, timeout){
      return this.$refs.notification.error(obj, timeout);
    },

    warning(obj, timeout){
      return this.$refs.notification.warning(obj, timeout);
    },

    success(obj, timeout){
      return this.$refs.notification.success(obj, timeout);
    },

    info(obj, timeout){
      return this.$refs.notification.info(obj, timeout);
    },

    confirm(){
      return bbn.fn.confirm.apply(bbn, arguments);
    },

    alert(){
      return bbn.fn.alert.apply(bbn, arguments);
    },

    focusSearch(){
      let $ele = $(this.$refs.search.$refs.element),
          $parent = $(this.$refs.search.$el).closest("div.bbn-block"),
          w = $parent.width() + $parent.next().width() - 40;
      $ele
        .attr("placeholder", this.searchPlaceholder)
        .animate({
          width: w
        });
    },

    blurSearch(e){
      let $ele = $(this.$refs.search.$refs.element);
      if ( parseInt($ele.css("maxWidth")) !== 30 ){
        $ele.animate({
          width: 30
        }, function (){
          $ele.val("").attr("placeholder", "?");
        })
      }
    },

    tplSearch(d){
      let maxW = $(this.$refs.search.$el).width();
      return '<div class="bbn-hpadded bbn-nl ' +
        apst.get_adherent_class(d.statut, d.statut_prospect ? d.statut_prospect : '') +
        '"><div class="bbn-block-left"><h3>' + d.nom + ' <em>' +
        ( d.immatriculation ? d.immatriculation : d.statut ) +
        ' ID: ' + d.id + '</em></h3></div><div class="bbn-block-right bbn-h-100 bbn-r" style="display: table"><span style="display: table-cell; vertical-align: middle">' +
        d.match + '</span></div></div>';
    },

    selectSearch(id, event){
      bbn.fn.log("selectSearch", data);
      let $ele = $(this.$refs.search.$el);
      if ( id ){
        this.$refs.search.widget.close();
        $(this.$refs.search.$el).val("").attr("placeholder", "?").focus();
        bbn.fn.link("adherent/fiche/" + id + "/infos");
        appui.search = "";
        $ele.trigger("blur");
      }
    },

    measure(){
      let w = $(this.$el).width(),
          h = $(this.$el).height();
      if ( w && h && ((w !== this.width) || (h !== this.height)) ){
        this.width = w;
        this.height = h;
        this.$emit("resize", {width: this.width, height: this.height});
      }
    }
  },
  mounted(){
    let doResize;
    $(window)
      .resize(() => {
        clearTimeout(doResize);
        doResize = setTimeout(() => {
          this.measure();
        }, 250);
      });
    setTimeout(() => {
      this.measure();
      this.isMounted = true;
      this.$emit('resize');
      $(this.$el).animate({opacity: 1})
    }, 1000)
  }
});


/*
appui.rest({
  environment: {
    settings: {
      position: "bl"
    }
  },
  notification: {},
  loading: {},
  message: {},
  splitter: {
    settings: {
      logo: '<img src="' + data.static_path + 'img/logo.png" border="0" style="height: 100%">'
    }
  },
  search: {
    target: function(){
      return appui.splitter.ele.find(".bbn-search-container");
    },
    settings: {
      url: "adherents",
      placeholder: "Rechercher par ID, nom, marque, adresse, contact, email, etc...",
      select: function(e){
        var id = this.dataItem(e.item.index()).id;
        e.preventDefault();
        appui.search.wid.close();
        appui.search.wid.element.val("").attr("placeholder", "?").focus();
        bbn.fn.link("adherent/fiche/" + id + "/infos");
      },
      template: function(d){
        return '<div class="bbn-nl" style="background-color: ' +
          apst.get_couleur(d.statut, d.statut_prospect ? d.statut_prospect : '') +
          '"><div class="bbn-block"><h3>' + d.nom + ' <em>' +
          ( d.immatriculation ? d.immatriculation : d.statut ) +
          ' ID: ' + d.id + '</em></h3></div><div class="bbn-block bbn-r">' +
          d.match + '</div></div>';
      }
    }
  },
  tabnav: {
    target: function(){
      return appui.splitter.ele.children("div.bbn-splitter-main");
    },
    settings: {
      list: [{
        url: "dashboard",
        title: "Tableau de bord",
        load: true,
        static: true
      }]
    }
  },
  menu: {
    target: function(){
      return appui.splitter.ele.find(".bbn-menu-button-container");
    },
    settings: {
      data: data.menu,
      top: 52
    }
  },
  shortcuts: {
    target: function(){
      return appui.splitter.ele.find(".bbn-splitter-top-center");
    },
    settings: {
      data: [
        [{
          url: "dashboard",
          text: "Tableau de bord",
          icon: "fa fa-dashboard"
        }, {
          url: "usergroup/profile",
          text: "Mon profil",
          icon: "fa fa-user"
        }, {
          url: "pm/panel",
          text: "Tâches",
          icon: "fa fa-bug"
        }, {
          click: bbn.fn.toggle_full_screen,
          text: "Plein écran",
          icon: "fa fa-arrows-alt"
        }],
        data.shortcuts,
        [{
          url: "logout",
          text: "Déconnexion",
          icon: "fa fa-sign-out"
        }]
      ]
    }
  }
}).then(function(){
  setInterval(function(){
    if ( !bbn.env.is_checking ){
      bbn.env.is_checking = 1;
      bbn.fn.ajax("check_connection", "json", {
        tabstrip: $.map(appui.tabnav.ele.tabNav("getList"), function(a){
          return {
            url: a.url,
            title: a.title,
          };
        })
      }, false, function(r){
        bbn.env.is_checking = false;
        if (r && (r.connected === false)){
          document.location.reload();
        }
        else if (!r || !r.connected){
          bbn.env.connection_failures++;
        }
        else if (bbn.env.connection_failures >= bbn.env.connection_max_failures){
          document.location.reload();
        }
        else {
          bbn.env.connection_failures = 0;
        }
        if (r.data){
          appui.appui.tabnav.ele.tabNav("addData", r.data, 0);
        }
        if (r.notifications){
          $.each(r.notifications, function(i, v){
            var cfg = {
              title: v.title,
              html: v.html,
              data: {id: v.id},
              onClose: function(data){
                //bbn.fn.log(data);
                bbn.fn.post("actions/notifications/delete", data)
              }
            };
            if (v.type){
              appui.message.apply(v.type ? v.type : "info", cfg);
            }
            else {
              appui.message.info(cfg);
            }
          });
        }
      }, function(jqXHR, textStatus, errorThrown){
        bbn.env.is_checking = false;
        bbn.env.connection_failures++;
        if (bbn.env.connection_failures >= bbn.env.connection_max_failures){
          document.location.reload();
        }
        appui.notification.error({title: textStatus, content: errorThrown}, "error");
      });
    }
  }, 10000);
});
*/