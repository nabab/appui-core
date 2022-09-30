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

// Language ?
// Separate user data and common data
// Separate plugins


$menu = new \bbn\Appui\Menu();
$mgr = new \bbn\User\Manager($model->inc->user);
$is_dev = $model->inc->user->isDev();
$theme = $model->inc->user->getSession('theme') ?: (defined('BBN_THEME') ? BBN_THEME : 'default');

$vfile = $model->dataPath() . 'version.txt';
if (!is_file($vfile)) {
  file_put_contents($vfile, '1');
  $version = 1;
}
else {
  $version = intval(file_get_contents($vfile));
}

$chat = false;
if ($model->hasPlugin('appui-chat')) {
  $cchat = new \bbn\Appui\Chat($model->db, $model->inc->user);
  $chat = $cchat->getUserStatus();
}

$data = [
  'logo_big' => 'https://ressources.app-ui.com/logo_big.png',
  'version' => $version,
  'current_menu' => $menu->getDefault(),
  'menus' => count(($m = $menu->getMenus())) > 1 ? $m : [],
  //'shortcuts' => $model->getModel($model->pluginUrl('appui-menu').'/shortcuts/list'),
  'options' => $model->inc->options->jsCategories(),
  'theme' => $theme,
  'cdn_lib' => 'animate-css,bbn-css|latest|' . $theme . ',bbn-vue,font-mfizz,webmin-font,jsPDF,html2canvas',
  'app' => [
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
  ]
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

/*
if (($custom_data = $model->getPluginModel('index', $data)) && is_array($custom_data)) {
  $data = X::mergeArrays($data, $custom_data);
}
*/

$data['script_src'] = BBN_SHARED_PATH . '?' . http_build_query([
  'lang' => $data['lang'] ?? BBN_LANG,
  'lib' => $data['cdn_lib'],
  'test' => !BBN_IS_PROD,
  'dirs' => $data['cdn_dirs'] ?? '',
  'v' => $data['version']
]);

$data['shortcuts'] = $model->getModel($model->pluginUrl('appui-menu').'/shortcuts/list');
$routes = $model->getRoutes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}

$data['plugins'] = $plugins;

// From APST

if ( $model->inc->user->check() ){

  $br_obj = new \apst\bureau($model->db);
  $lettre = new \bbn\Appui\Masks($model->db);
  $pm = new \bbn\Appui\Task($model->db);

  if ( !($pdf_cfg = $model->inc->user->getCfg('pdf_cfg')) ){
    $pdf_cfg = [
      'infos' => true,
      'actionnariat' => true,
      'succursales' => true,
      'marques' => true,
      'cgar' => true,
      'pad' => true,
      'finances' => true,
    ];
    $model->inc->user->setCfg(['pdf_cfg' => $pdf_cfg])->saveCfg();
  }

  $id_justificatifs = \bbn\Appui\Masks::getOptionId('LTJUS');
  $justificatifs = $lettre->getTextValue($id_justificatifs, true);
  if ( $justificatif_defaut = $lettre->getDefault($id_justificatifs) ){
    $justificatif_defaut = $justificatif_defaut['id_note'];
  }
  else{
    $justificatifs = [];
    $justificatif_defaut = '';
  }

  $champs_dva = $model->inc->outils->champs_dva();
  $champs = [
    29 => $model->inc->outils->form_document(29),
    35 => $model->inc->outils->form_document(35),
    37 => $model->inc->outils->form_document(37)
  ];
  $bureaux = array_map(
    function($a){
      return [
        'text' => $a['name'],
        'value' => $a['id']
      ];
    },
    $br_obj->getAll()
  );

  $d = [
    'root' => '',
    'wp_url' => BBN_WP_URL,
    'cdn_dirs' => 'APST-UI/css',
    'logo' => $model->data['static_path'] . 'img/logo.png',
    'logo_big' => $model->data['static_path'] . 'img/logo_big.png',
    'money' => [
      'kilo' => false,
      'currency' => '€',
      'novalue' => '-',
      'decimal' => ',',
      'thousands' => ' ',
      'precision' => 0
    ],
    'options' => [
      'bbn_tasks' => \bbn\Appui\Task::getOptions(),
      'tasks' => [
        'roles' => \bbn\Appui\Task::getAppuiOptionsIds('roles'),
        'states' => \bbn\Appui\Task::getAppuiOptionsIds('states'),
        'options' => [
          'states' => \bbn\Appui\Task::getAppuiOptionsTextValue('states'),
          'roles' => \bbn\Appui\Task::getAppuiOptionsTextValue('roles'),
          'cats' => \bbn\Appui\Task::catCorrespondances()
        ],
        'categories' => $model->inc->options->map(function($a){
          $a['is_parent'] = !empty($a['items']);
          if ( $a['is_parent'] ){
            $a['expanded'] = true;
          }
          return $a;
        }, $pm->categories(), 1),
        'priority_colors' => [
          '#F00',
          '#F40',
          '#F90',
          '#FC0',
          '#9B3',
          '#7A4',
          '#5A5',
          '#396',
          '#284',
          '#063'
        ]
      ]
    ],
    'app' => [
      'cotis_graph' => null,
      'statuts' => [[
        'text' => 'Prospect',
        'value' => 'prospect',
        'color' => '#A78C2B'
      ], [
        'text' => 'Adhérent',
        'value' => 'adherent',
        'color' => '#00BD00'
      ], [
        'text' => 'Groupe',
        'value' => 'groupe',
        'color' => '#06A6A8'
      ], [
        'text' => 'Radié',
        'value' => 'radie',
        'color' => '#AC0606'
      ]],
      'mois' => [[
        'value' => 1,
        'text' => 'janvier'
      ], [
        'value' => 2,
        'text' => 'février'
      ], [
        'value' => 3,
        'text' => 'mars'
      ], [
        'value' => 4,
        'text' => 'avril'
      ], [
        'value' => 5,
        'text' => 'mai'
      ], [
        'value' => 6,
        'text' => 'juin'
      ], [
        'value' => 7,
        'text' => 'juillet'
      ], [
        'value' => 8,
        'text' => 'août'
      ], [
        'value' => 9,
        'text' => 'septembre'
      ], [
        'value' => 10,
        'text' => 'octobre'
      ], [
        'value' => 11,
        'text' => 'novembre'
      ], [
        'value' => 12,
        'text' => 'décembre'
      ]],
      'historiques' => [[
        'text' => 'Insertion',
        'value' => 'INSERT',
        'color' => 'green'
      ], [
        'text' => 'Modification',
        'value' => 'UPDATE',
        'color' => 'blue'
      ], [
        'text' => 'Suppression',
        'value' => 'DELETE',
        'color' => 'red'
      ], [
        'text' => 'Restauration',
        'value' => 'RESTORE',
        'color' => 'orange'
      ]],
      'defaultCountry' => $model->inc->options->fromCode('FR', 'countries'),
      'modeles_courriers' => $lettre->getTextValue(\bbn\Appui\Masks::getOptionId('LTCOU')),
      'justificatifs' => $justificatifs,
      'justificatif_defaut' => $justificatif_defaut,
      'bureaux' => $bureaux,
      'tables' => array_filter($model->db->getTables(), function($a){
        return strpos($a, 'apst_') === 0;
      }),
      'civs' => [[
        'value' => 'M',
        'text' => 'Monsieur'
      ], [
        'value' => 'MME',
        'text' => 'Madame'
      ], [
        'value' => 'MLLE',
        'text' => 'Mademoiselle'
      ], [
        'value' => 'MME/M',
        'text' => 'Madame/Monsieur'
      ], [
        'value' => 'ME',
        'text' => 'Maître'
      ], [
        'value' => 'MMES',
        'text' => 'Mesdames'
      ], [
        'value' => 'MM',
        'text' => 'Messieurs'
      ], [
        'value' => 'I',
        'text' => 'Indéterminé'
      ]],
      'pdf_cfg' => $pdf_cfg,
      'docs' => $model->inc->options->options('documents'),
      'docsFull' => $model->inc->options->fullOptions('documents'),
      'regions' => $model->inc->options->fullTree('regions'),
      'champs_dva' => $model->inc->outils->champs_dva(),
      'champs' => [
        29 => $model->inc->outils->form_document(29),
        35 => $model->inc->outils->form_document(35),
        37 => $model->inc->outils->form_document(37),
        'dva_prev' => $model->inc->outils->form_document('dva_prev')
      ],
      'cotis_dates' => $model->inc->outils->get_active_cotis_dates(),
      'has_cotis_valid_perm' => $model->inc->perm->has('cotisations/validations')
    ],
    'lng' => [
      "Today" => _("Aujourd'hui"),
      "Tomorrow" => _("Demain"),
      "Yesterday" => _("Hier"),
      "Today at" => _("Aujourd'hui à"),
      "Tomorrow at" => _("Demain à"),
      "Yesterday at" => _("Hier à"),
      'at' => _("à"),
      'last' => _('dernier')
    ]
  ];
  //die(\bbn\X::hdump(\bbn\X::convertUids($d)));

  return X::mergeArrays($data, $d);
}

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