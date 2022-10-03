<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/08/2022
 * Time: 06:24
 *
 * @var $model \bbn\Mvc\Model
 */
use bbn\X;
use bbn\Appui\Menu;
use bbn\User\Manager;


// Language ?
// Separate user data and common data
// Separate plugins

$res = ['success' => false];

if ($model->hasInc('user') &&  $model->inc->user->check()) {
  if ($model->hasPlugin('appui-menu')) {
    $menu = new Menu();
  }

  $mgr = new Manager($model->inc->user);
  $appui = new bbn\Appui();
  $data = $appui->getPublicVars();


  $chat = false;
  if ($model->hasPlugin('appui-chat')) {
    $cchat = new \bbn\Appui\Chat($model->db, $model->inc->user);
    $chat = $cchat->getUserStatus();
  }

  if (isset($menu)) {
    $data['current_menu'] = $menu->getDefault() ;
    $data['menus'] = count(($m = $menu->getMenus())) > 1 ? $m : [];
  }

  $data['options'] = $model->inc->options->jsCategories();
  $data['app'] = [
    'users' => $mgr->fullList(),
    'groups' => $mgr->groups(),
    'user' => [
      'id' => $model->inc->user->getId(),
      'isAdmin' => $model->inc->user->isAdmin(),
      'isDev' => $model->inc->user->isDev(),
      'name' => $mgr->getName($model->inc->user->getId()),
      'email' => $mgr->getEmail($model->inc->user->getId()),
      'chat' => $chat
    ],
    'group' => $mgr->getGroup($model->inc->user->getGroup()),
    'userId' => $model->inc->user->getId(), // Deprecated
    'groupId' => $model->inc->user->getGroup() // Deprecated
  ];

  $data['options']['media_types'] = $model->inc->options->codeOptions(\bbn\Appui\Note::getAppuiOptionId('media'));
  $data['options']['categories'] = $model->inc->options->fullOptions();

  if ($model->hasPlugin('appui-hr')) {
    $hr = new \bbn\Appui\Hr($model->db);
    $data['options']['hr']['absences'] = $model->inc->options->fullOptions(\bbn\Appui\Hr::getAppuiOptionId('absences'));
    $data['app'] = X::mergeArrays($data['app'], [
      'staff' => $hr->getStaff(),
      'staffActive' => $hr->getActiveStaff()
    ]);
  }

  if ($model->hasPlugin('appui-menu')) {
    $data['shortcuts'] = $model->getModel($model->pluginUrl('appui-menu').'/shortcuts/list');
  }
  $routes = $model->getRoutes();
  $plugins = [];
  foreach ( $routes as $r ){
    $plugins[$r['name']] = $r['url'];
  }

  $data['plugins'] = $plugins;
  $res = [
    'success' => true,
    'data' => $data
  ];
}

return $res;

/*
    appuiMixin: {
      data(){
        return {
          header: true,
          nav: true,
          clipboard: true,
          status: true,
          list: [
            {
              url: data.plugins['appui-dashboard'] + '/home',
              title: bbn._("Dashboard"),
              load: true,
              static: true,
              icon: 'nf nf-fa-tachometer_alt'
            }
          ],
          searchBar: {
            delay: 500,
            sourceText: 'nom',
            sourceValue: 'id',
            value: '',
            clearButton: false,
            suggest: true,
            source: 'adherents',
            placeholder: bbn._("Rechercher par ID, nom, marque, adresse, contact, email, code postal, ville, etc..."),
            icon: 'nf nf-fa-search',
            minLength: 1,
            height: bbn.env.height - 100,
            component: "apst-search-item",
            template: (d) => {
              return `
            <div class="bbn-hpadded bbn-nl ${appui.app.get_adherent_class(d.statut, d.statut_prospect ? d.statut_prospect : '')}">
              <div class="bbn-block-left">
                <h3>${d.nom} <em>${(d.immatriculation ? d.immatriculation : d.statut)} ID: ${d.id}</em></h3>
              </div>
              <div class="bbn-block-right bbn-h-100 bbn-r" style="display: table">
                <span style="display: table-cell; vertical-align: middle">${d.match}</span>
              </div>
            </div>`;
            },
            select(event, it){
              let id = it.id;
              bbn.fn.log("SELECT", id, event);
              if ( id ){
                setTimeout(() => {
                  document.activeElement.blur();
                }, 15);
                bbn.fn.link("adherent/fiche/" + id + "/infos");
              }
            }
          },
          app: {
            methods: {
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
                if ( !rcs ){
                  return '-';
                }
                rcs = rcs.toString();
                if ( rcs.length === 9 ){
                  return rcs.substr(0, 3) + ' ' + rcs.substr(3, 3) + ' ' + rcs.substr(6);
                }
                return rcs;
              },

              fimmat: function(im){
                if ( !im ){
                  return bbn._("En cours");
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
                //if the country is different from the default one 
                if ( inf.id_country !== appui.app.defaultCountry ){
                  r += '<br>' + bbn.fn.getField(bbn.opt.countries, 'value', inf.id_country, 'text');
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

              calcul_cgar: function(d){
                var s = [], r = {};
                bbn.fn.each(this.filtre_cgar(d), function(a,i){
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
                bbn.fn.each(d, function(a, i){
                  var dt = new Date();
                  if ( !a.fin || dt.parseSQL(a.fin).isAfter() ){
                    s.push(a);
                  }
                });
                return s;
              },

              utilisateur: function(id){
                return bbn.fn.getField(this.users, "value", id, "text") || "Inconnu!";
              },


            is_actif: function(statut, prospect){
              if ( (statut === 'prospect') && prospect ){
                let idx = bbn.fn.search(appui.options.prospect, {value: prospect});
               // @jquery if ( (idx > -1) && ($.inArray(appui.options.prospect[idx].code, ['accepte', 'reserve', 'en_cours']) === -1) ){
                if ( (idx > -1) && (['accepte', 'reserve', 'en_cours'].indexOf(appui.options.prospect[idx].code) === -1) ){
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
              var type = document.getElementById('As9275dK2D45gm2C0JSS033sd').value;
              this.post("home_chart", {type: type}, (d) => {
                if ( d.data ){
                  //chart.dataSource.data(d.data);
                  //appui.home.set("stats", d);
                }
              });
            },

            userFull: function(id){
              var user = bbn.fn.getRow(this.users, "value", id);
              return '<span class="appui-avatar"><img src="' + user.avatar + '" alt="' + user.text + '"> ' + user.text + '</span>';
            }
          }
        }
      }
    },
  }
  */