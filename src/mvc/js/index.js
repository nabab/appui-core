/* jslint esversion: 6 */
bbn.fn.init({
  env: {
    lang: "fr",
    logging: document.location.href.indexOf("localhost") ? 1 : false,
    connection_failures: 0,
    connection_max_failures: 10
  },
  fn: {
    money(val, kilo){
      let decimal = ',',
          currency = '€',
          thousands = ' ';
      if ( (isNaN(val) || !val) ){
        return '-';
      }
      if ( isNaN(val) || !val ){
        return 0;
      }
      if ( kilo && val ){
        val = val / 1000;
        if ( currency ){
          currency = 'K' + currency;
        }
      }
      return parseFloat(val).toFixed(0).replace(/./g, function(c, i, a) {
        if ( c === '.' ){
          return decimal;
        }
        return i && ((a.length - i) % 3 === 0) ? thousands + c : c;
      }) + ( currency ? ' ' + currency : '');
    },
    defaultAjaxErrorFunction: function (jqXHR, textStatus, errorThrown) {
      /** @todo */
      appui.error({title: textStatus, content: errorThrown}, 4);
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
      appui.alert.apply(appui, arguments);
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
bbn.fn.log(data);
$.extend(bbn.lng, data.lng);
$.extend(bbn.env, {
  logging: data.is_dev || data.is_test ? true : false,
  isDev: data.is_dev ? true : false,
  lang: "fr",
  siteTitle: data.site_title,
  wp_url: data.wp_url,
  token: data.token
});

Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` is a Vue-specific error info, e.g. which lifecycle hook
  // the error was found in. Only available in 2.2.0+
  bbn.fn.log("ERROR", err, vm, info);
};

bbn.vue.addPrefix('apst', (tag, resolve, reject) => {
  bbn.vue.queueComponent(tag, 'components/' + bbn.fn.replaceAll('-', '/', tag).substr('apst-'.length), {
    methods: {
      getTab(){
        return bbn.vue.closest(this, 'bbns-tab');
      },
      popup(){
        return this.getTab().popup.apply(this, arguments);
      }
    }
  }, resolve, reject);
});

bbn.fn.each(data.plugins, (path, name) => {
  bbn.vue.addPrefix(name, (tag, resolve, reject) => {
    bbn.vue.queueComponent(tag, path + '/components/' + bbn.fn.replaceAll('-', '/', tag).substr(name.length + 1), null, resolve, reject);
  });
})

new Vue({
  el: 'div.appui',
  data: {
    root: data.root,
    options: $.extend(data.options, {tasks: data.tasks}),
    menus: data.menus,
    plugins: data.plugins,
    currentMenu: data.current_menu,
    shortcuts: data.shortcuts,
    logo: data.logo,
    leftShortcuts: [
      {
        url: 'dashboard',
        text: bbn._("Tableau de bord"),
        icon: 'fas fa-tachometer-alt'
      }, {
        command(){
          appui.popup().load('help', '90%');
        },
        text: bbn._("Help"),
        icon: 'zmdi zmdi-help-outline'
      }, {
        url: 'usergroup/main',
        text: bbn._("Mon profil"),
        icon: 'fas fa-user'
      }, {
        url: 'pm/page',
        text: bbn._("Tâches"),
        icon: 'fas fa-bug'
      }
    ],
    rightShortcuts: [
      {
        command(){
          bbn.fn.toggle_full_screen();
        },
        text: bbn._("Plein écran"),
        icon: 'fas fa-arrows-alt'
      }, {
        url: 'logout',
        text: bbn._("Sortir"),
        icon: 'fas fa-sign-out-alt'
      }
    ],
    list: [
      {
        url: "dashboard",
        title: "Tableau de bord",
        load: true,
        static: true,
        icon: 'fas fa-tachometer-alt'
      }
    ],
    app: {
      data(){
        return {
          statuts: {
            radie: "Radié",
            adherent: "Adhérent",
            groupe: "Groupe",
            prospect: "Prospect"
          },
          mois: [
            {value: 1, text: "janvier"},
            {value: 2, text: "février"},
            {value: 3, text: "mars"},
            {value: 4, text: "avril"},
            {value: 5, text: "mai"},
            {value: 6, text: "juin"},
            {value: 7, text: "juillet"},
            {value: 8, text: "août"},
            {value: 9, text: "septembre"},
            {value: 10, text: "octobre"},
            {value: 11, text: "novembre"},
            {value: 12, text: "décembre"},
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
          docsFull: data.docs_full,
          users: data.users,
          groups: data.groups,
          expertises: data.expertises,
          userId: data.user_id,
          departements: data.departements,
          regions: data.regions,
          champs_dva: data.champs_dva,
          champs: data.champs,
          historiques: [
            {
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
            }
          ],
          has_cotis_valid_perm: data.has_cotis_valid_perm
        }
      },
      computed: {
        userName(){
          return bbn.fn.get_field(this.users, {value: this.userId}, 'text') || bbn._('Unnown')
        }
      },
      methods: {
        historique_type: function(d){
          var op;
          if ( (typeof(d.operation) !== 'undefined') &&
            (op = bbn.fn.get_row(this.historiques, "value", d.operation)) ){
            return '<span style="color:' + op.color + '">' + op.text + '</span>';
          }
          return "";
        },

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
          $.each(this.filtre_cgar(d), function(i, a){
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
          return bbn.fn.get_field(this.users, "value", id, "text") || "Inconnu!";
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
              if ( prospect && !this.is_actif(statut, prospect) ){
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
              if ( prospect && !this.is_actif(statut, prospect) ){
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
              //appui.home.set("stats", d);
            }
          });
        },

        getUserName: function(id){
          return bbn.fn.get_field(this.users, "value", id, "text");
        },

        getUserGroup: function(id){
          return bbn.fn.get_field(this.users, "value", id, "id_group");
        },

        userFull: function(id){
          var user = bbn.fn.get_row(this.users, "value", id);
          return '<span class="appui-avatar"><img src="' + user.avatar + '" alt="' + user.text + '"> ' + user.text + '</span>';
        }
      }
    }
  },
  methods: {
    setImessage(e){
      if ( (e.hidden !== undefined) && e.id ){
        bbn.fn.post(this.root + 'actions/imessage', e, (r) => {
          if ( r.success ){
            appui.success(bbn._('Saved'));
          }
          else {
            appui.error(bbn._('Error'));
          }
        });
      }
    }
  }
});