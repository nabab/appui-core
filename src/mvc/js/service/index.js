/**
 * Service worker
 * 
 * - Intercept requests and manage cache
 * - Polls the server for new information and dispatch it to the clients
 * - Reacts to messages from the client Windows
 * 
 * Data example (should it be reduced?)
 * 
 * let data = {
 *   "version":492,
 *   "site_url":"https:\/\/apstapp.thomas.lan\/",
 *   "site_title":"Intranet APST",
 *   "app_name":"apst-app",
 *   "app_prefix":"apst",
 *   "is_dev":true,
 *   "is_prod":false,
 *   "is_test":false,
 *   "shared_path":"https:\/\/cdn2.thomas.lan\/",
 *   "static_path":"https:\/\/cdn2.thomas.lan\/APST-UI\/",
 *   "test":1,
 *   "year":"2020",
 *   "lang":"fr",
 *   "root":"",
 *   "current_menu":"02567969543711e9ab15005056014c9f",
 *   "menus":[
 *     {"text":"Main menu","value":"02567969543711e9ab15005056014c9f","public":1,"id_user":null,"id_group":null,"hasItems":true},
 *     {"text":"Plugins","value":"02daac5e543711e9ab15005056014c9f","public":0,"id_user":null,"id_group":"750d298ef5ca11e89b35005056014c9f","hasItems":true}
 *   ],
 *   "options":{
 *     "categories":null,
 *     "prospect":[
 *       {"text":"Accept\u00e9","value":"086fad64025011e8beb3005056014c9f","code":"accepte"},
 *       {"text":"Accept\u00e9 sous r\u00e9serve","value":"0a47a9b5025011e8beb3005056014c9f","code":"reserve"},
 *       {"text":"Ajourn\u00e9","value":"04b3fab5025011e8beb3005056014c9f","code":"ajourne"},
 *       {"text":"Cessation d'engagement conditionnel","value":"0c806b6d025011e8beb3005056014c9f","code":"cessation"},
 *       {"text":"Class\u00e9 sans suite","value":"085f6bbe025011e8beb3005056014c9f","code":"sans_suite"}
 *     ],
 *     "formes_alt":[
 *       {"text":"(Autre) personne physique","value":"096724f0025011e8beb3005056014c9f"},
 *       {"text":"Administration de l'\u00e9tat","value":"0730049d025011e8beb3005056014c9f"}
 *     ],
 *     "bbn_tasks":[
 *       {"id":"06e1e1e4025011e8beb3005056014c9f","id_parent":"054c6114025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Actions","code":"actions","value":null,"num_children":29},
 *       {"id":"0722409d025011e8beb3005056014c9f","id_parent":"054c6114025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Roles","code":"roles","value":null,"num_children":4},
 *       {"id":"08281f43025011e8beb3005056014c9f","id_parent":"054c6114025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"States","code":"states","value":null,"num_children":7},
 *       {"id":"064fd537025011e8beb3005056014c9f","id_parent":"054c6114025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Types de t\u00e2che","code":"cats","value":null,"num_children":4}
 *     ],
 *     "tasks":{
 *       "roles":{
 *         "deciders":"bb509bc77bb811e89b35005056014c9f",
 *         "managers":"071f2d24025011e8beb3005056014c9f",
 *         "viewers":"0782c660025011e8beb3005056014c9f",
 *         "workers":"054a883e025011e8beb3005056014c9f"
 *       },
 *       "states":{
 *         "approved":"1f0d42607bb911e89b35005056014c9f",
 *         "closed":"0cf784a5025011e8beb3005056014c9f",
 *         "holding":"09ad5f06025011e8beb3005056014c9f",
 *         "ongoing":"06e92d4b025011e8beb3005056014c9f",
 *         "opened":"0ac29bd5025011e8beb3005056014c9f",
 *         "postponed":"082bcb6b025011e8beb3005056014c9f",
 *         "unapproved":"9baf6c2c7bb911e89b35005056014c9f"
 *       },
 *       "options":{
 *         "states":[
 *           {"text":"Approved","value":"1f0d42607bb911e89b35005056014c9f","code":"approved"},
 *           {"text":"Closed","value":"0cf784a5025011e8beb3005056014c9f","code":"closed"},
 *           {"text":"On hold","value":"09ad5f06025011e8beb3005056014c9f","code":"holding"},
 *           {"text":"Ongoing","value":"06e92d4b025011e8beb3005056014c9f","code":"ongoing"},
 *           {"text":"Opened","value":"0ac29bd5025011e8beb3005056014c9f","code":"opened"},
 *           {"text":"Postponed","value":"082bcb6b025011e8beb3005056014c9f","code":"postponed"},
 *           {"text":"Unapproved","value":"9baf6c2c7bb911e89b35005056014c9f","code":"unapproved"}
 *         ],
 *         "roles":[
 *           {"text":"Deciders","value":"bb509bc77bb811e89b35005056014c9f","code":"deciders"},
 *           {"text":"Managers","value":"071f2d24025011e8beb3005056014c9f","code":"managers"},
 *           {"text":"Viewers","value":"0782c660025011e8beb3005056014c9f","code":"viewers"},
 *           {"text":"Workers","value":"054a883e025011e8beb3005056014c9f","code":"workers"}
 *         ],
 *         "cats":[
 *           {"value":"087bbe65025011e8beb3005056014c9f","text":"Adh\u00e9rents"},
 *           {"value":"0abeeeaa025011e8beb3005056014c9f","text":"Am\u00e9lioration d'une fonctionnalit\u00e9 existante"},
 *           {"value":"0d1181e7025011e8beb3005056014c9f","text":"Cotisations"},
 *           {"value":"09706670025011e8beb3005056014c9f","text":"Nouvelle fonctionnalit\u00e9"},
 *           {"value":"07efabdc025011e8beb3005056014c9f","text":"Perso"},
 *           {"value":"0733af38025011e8beb3005056014c9f","text":"Service technique"},
 *           {"value":"0a6d0709025011e8beb3005056014c9f","text":"Signaler un bug"}
 *         ]
 *       },
 *       "categories":[
 *         {"id":"087bbe65025011e8beb3005056014c9f","id_parent":"064fd537025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Adh\u00e9rents","code":"adherents","value":null,"num_children":0,"is_parent":false},
 *         {"id":"0d1181e7025011e8beb3005056014c9f","id_parent":"064fd537025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Cotisations","code":"cotisations","value":null,"num_children":0,"is_parent":false},
 *         {"id":"07efabdc025011e8beb3005056014c9f","id_parent":"064fd537025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Perso","code":"perso","value":null,"num_children":0,"is_parent":false},
 *         {
 *           "id":"0733af38025011e8beb3005056014c9f",
 *           "id_parent":"064fd537025011e8beb3005056014c9f",
 *           "id_alias":null,
 *           "num":null,
 *           "text":"Service technique",
 *           "code":"support",
 *           "value":null,
 *           "num_children":3,
 *           "items":[
 *             {"id":"0abeeeaa025011e8beb3005056014c9f","id_parent":"0733af38025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Am\u00e9lioration d'une fonctionnalit\u00e9 existante","code":"enhancement","value":null,"num_children":0,"is_parent":false},
 *             {"id":"09706670025011e8beb3005056014c9f","id_parent":"0733af38025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Nouvelle fonctionnalit\u00e9","code":"new","value":null,"num_children":0,"is_parent":false},
 *             {"id":"0a6d0709025011e8beb3005056014c9f","id_parent":"0733af38025011e8beb3005056014c9f","id_alias":null,"num":null,"text":"Signaler un bug","code":"bug","value":null,"num_children":0,"is_parent":false}
 *           ],
 *           "is_parent":true,
 *           "expanded":true
 *         }
 *       ],
 *       "priority_colors":["#F00","#F40","#F90","#FC0","#9B3","#7A4","#5A5","#396","#284","#063"]
 *     }
 *   },
 *   "theme":"dark",
 *   "cdn_lib":"nerd-fonts,bbn-css|latest|dark,bbn-vue,font-mfizz,devicon,webmin-font,jsPDF",
 *   "app":{
 *     "users":[
 *       {"value":"17d0db250b8611eaab15005056014c9f","text":"Assetou KEITA","id_group":"750f1eb1f5ca11e89b35005056014c9f","active":true},
 *       {"value":"18ed03f75c6c11ea88bc005056014c9f","text":"loredana","id_group":"750ee798f5ca11e89b35005056014c9f","active":true},
 *       {"value":"3a74f9f5f6f911e89b35005056014c9f","text":"BBN Support","id_group":"750ee798f5ca11e89b35005056014c9f","active":true},
 *     ],
 *     "groups":[
 *       {"id":"750d298ef5ca11e89b35005056014c9f","nom":"Administrateurs","type":"real","code":null,"num":5},
 *       {"id":"750e0525f5ca11e89b35005056014c9f","nom":"Managers","type":"real","code":null,"num":8},
 *       {"id":"750fa266f5ca11e89b35005056014c9f","nom":"Service Financier","type":"real","code":null,"num":7}
 *     ],
 *     "user":{
 *       "id":"752a9b0ef5ca11e89b35005056014c9f",
 *       "isAdmin":true,
 *       "isDev":true,
 *       "name":"B.B.N",
 *       "email":"thomas.nabet@gmail.com"
 *     },
 *     "group":{
 *       "id":"750d298ef5ca11e89b35005056014c9f",
 *       "id_parent":null,
 *       "type":"real",
 *       "nom":"Administrateurs",
 *       "code":null,
 *       "cfg":{"admin":1}
 *     },
 *     "userId":"752a9b0ef5ca11e89b35005056014c9f",
 *     "groupId":"750d298ef5ca11e89b35005056014c9f",
 *     "statuts":[
 *       {"text":"Prospect","value":"prospect","color":"#A78C2B"},
 *       {"text":"Adh\u00e9rent","value":"adherent","color":"#00BD00"},
 *       {"text":"Groupe","value":"groupe","color":"#06A6A8"},
 *       {"text":"Radi\u00e9","value":"radie","color":"#AC0606"}
 *     ],
 *     "mois":[{"value":1,"text":"janvier"},{"value":2,"text":"f\u00e9vrier"}],
 *     "defaultCountry":"356a3ae9e8c811e89b35005056014c9f",
 *     "modeles_courriers":[
 *       {"text":"Exemple 1","value":"ab5c5623f5ca11e89b35005056014c9f"},
 *       {"text":"Courrier Poste","value":"ab64dd66f5ca11e89b35005056014c9f"}
 *     ],
 *     "tables":["apst_adherents","apst_adherents_emails","apst_adherents_full","apst_adherents_notes","apst_adherents_tasks","apst_altares","apst_attestations","apst_baremes_annuels","apst_changes","apst_changes_files","apst_clotures","apst_consultations","apst_cotisations","apst_cotisations_annuelles","apst_cp","apst_demandes","apst_demandes_documents","apst_documents","apst_infolegale","apst_infolegale_events","apst_infolegale_info","apst_infolegale_infos","apst_liens","apst_liens_notes","apst_marques","apst_passages","apst_prospects","apst_prospects_files","apst_stats","apst_suivi","apst_tmp_files"],
 *     "civs":[
 *       {"value":"M","text":"Monsieur"},
 *       {"value":"MME","text":"Madame"},
 *     ],
 *     "cotis_dates":[
 *       {"year":2020,"id":"dd208b9e0f3111eaab15005056014c9f","start":"2019-11-22 12:00:00","end":"2020-12-31 23:59:59"}
 *     ],
 *     "has_cotis_valid_perm":true
 *   },
 *   "wp_url":"https:\/\/apst.thomas.lan\/",
 *   "cdn_dirs":"APST-UI\/css",
 *   "logo":"https:\/\/cdn2.thomas.lan\/APST-UI\/img\/logo.png",
 *   "money":{"kilo":false,"currency":"\u20ac","novalue":"-","decimal":",","thousands":" ","precision":0},
 *   "lng":{
 *     "Today":"Aujourd'hui",
 *     "Tomorrow":"Demain",
 *     "Yesterday":"Hier",
 *     "Today at":"Aujourd'hui \u00e0",
 *     "Tomorrow at":"Demain \u00e0",
 *     "Yesterday at":"Hier \u00e0"
 *   },
 *   "script_src":"https:\/\/cdn2.thomas.lan\/?lang=fr&lib=nerd-fonts%2Cbbn-css%7Clatest%7Cdark%2Cbbn-vue%2Cfont-mfizz%2Cdevicon%2Cwebmin-font%2CjsPDF&test=1&dirs=APST-UI%2Fcss&v=492",
 *   "plugins":{
 *     "appui-cdn":"cdn",
 *     "appui-components":"components",
 *     "appui-core":"core",
 *     "appui-cron":"cron",
 *     "appui-dashboard":"dashboard",
 *     "appui-ide":"ide",
 *     "apst-espace-adherents":"ea"
 *   },
 *   "shortcuts":[
 *     {"id":"9e016e7272fa11ea83ae0050560a97cd","id_option":"0b26d137025011e8beb3005056014c9f","url":"options\/tree","text":"Options Tree","icon":"nf nf-fa-tree","num":2},
 *     {"id":"7f563b4972fb11ea83ae0050560a97cd","id_option":"0b48a2a9025011e8beb3005056014c9f","url":"ide\/editor","text":"I.D.E","icon":"nf nf-fa-code","num":3},
 *   ],
 *   "js_data":"
 * (
 *   ()=>{
 *     return{
 *       appuiMixin:{
 *        data(){
 *          return {
 *            header:true,
 *            nav:true,
 *            clipboard:true,
 *            status:true,
 *            list:[
 *              {
 *                 url:data.plugins['appui-dashboard']+'\/home',title:bbn._(\"Dashboard\"),
 *                 load:true,
 *                 static:true,
 *                 icon:'nf nf-fa-tachometer_alt'
 *               }
 *             ],
 *             searchBar:{
 *               delay:500,
 *               sourceText:'nom',
 *               sourceValue:'id',
 *               value:'',
 *               clearButton:false,
 *               suggest:true,
 *               source:'adherents',
 *               placeholder:'?',
 *               placeholderFocused:bbn._(\"Rechercher par ID, nom, marque, adresse, contact, email, etc...\"),
 *               icon:'nf nf-fa-search',
 *               minLength:1,
 *               height:bbn.env.height-100,
 *               component:\"apst-search-item\",
 *               template:(d)=>{
 *                 return`\n            <div class=\"bbn-hpadded bbn-nl ${appui.app.get_adherent_class(d.statut, d.statut_prospect ? d.statut_prospect : '')}\">\n              <div class=\"bbn-block-left\">\n                <h3>${d.nom} <em>${(d.immatriculation ? d.immatriculation : d.statut)} ID: ${d.id}<\/em><\/h3>\n              <\/div>\n              <div class=\"bbn-block-right bbn-h-100 bbn-r\" style=\"display: table\">\n                <span style=\"display: table-cell; vertical-align: middle\">${d.match}<\/span>\n              <\/div>\n            <\/div>`;
 *               },
 *               select(event,it){
 *                 let id=it.id;
 *                 bbn.fn.log(\"SELECT\",id,event);
 *                 if(id){
 *                   setTimeout(()=>{
 *                     document.activeElement.blur();
 *                   },15);
 *                   bbn.fn.link(\"adherent\/fiche\/\"+id+\"\/infos\");
 *                 }
 *               }
 *             },
 *             app:{
 *               methods:{
 *                 fnom:function(inf){
 *                   var r='';if(inf.civilite&&inf.civilite!=='I'){r+=inf.civilite+' ';}\nr+=inf.nom;if(inf.prenom){r+=' '+inf.prenom;}\nreturn r;
 *                 },
 *                 frcs:function(rcs){
 *                   if(!rcs){return'-';}\nrcs=rcs.toString();if(rcs.length===9){return rcs.substr(0,3)+' '+rcs.substr(3,3)+' '+rcs.substr(6);}\nreturn rcs;
 *                 },
 *                 fimmat:function(im){
 *                   if(!im){return bbn._(\"En cours\");}\nim=im.toString();if(im.length===11){return im.substr(0,2)+' '+im.substr(2,3)+' '+im.substr(5,2)+' '+im.substr(7);}\nreturn im;
 *                 },
 *                 fadresse:function(inf){
 *                   var r='';if(inf.adresse){r+=inf.adresse.replace(\"\\n\",\"<br>\")+'<br>';}\nif(inf.cp){r+=inf.cp+' ';}\nif(inf.ville){r+=inf.ville;}\nif(inf.id_country!==appui.app.defaultCountry){r+='<br>'+bbn.fn.getField(bbn.opt.countries,'value',inf.id_country,'text');}\nreturn r;
 *                 },
 *                 ladresse:function(inf){
 *                   var r='';r+=inf.adresse.length>20?inf.adresse.substr(0,20)+'...':inf.adresse;if(inf.cp&&inf.ville){r+=' '+inf.cp+' '+inf.ville;}\nreturn r;
 *                 },
 *                 calcul_cgar:function(d){
 *                   var s=[],r={};bbn.fn.each(this.filtre_cgar(d),function(a,i){if(!r[a.type]){r[a.type]=parseInt(a.montant);}\nelse{r[a.type]+=parseInt(a.montant);}});for(var i in r){s.push({type:i,montant:r[i]});}\nreturn s;
 *                 },
 *                 filtre_cgar:function(d){
 *                   var s=[];bbn.fn.each(d,function(a,i){var dt=new Date();if(!a.fin||dt.parseSQL(a.fin).isAfter()){s.push(a);}});return s;
 *                 },
 *                 utilisateur:function(id){
 *                   return bbn.fn.getField(this.users,\"value\",id,\"text\")||\"Inconnu!\";
 *                 },
 *                 champ_recherche:function($ele){
 *                 },
 *                 is_actif:function(statut,prospect){
 *                   if((statut==='prospect')&&prospect){let idx=bbn.fn.search(appui.options.prospect,{value:prospect});if((idx>-1)&&(['accepte','reserve','en_cours'].indexOf(appui.options.prospect[idx].code)===-1)){return false;}}\nif(statut==='radie'){return false;}\nreturn true;
 *                 },
 *                 get_couleur:function(statut,prospect){
 *                   switch(statut){case\"adherent\":return\"#00BD00\";case\"groupe\":return\"#06A6A8\";case\"radie\":return\"#AC0606\";case\"prospect\":if(prospect&&!this.is_actif(statut,prospect)){return\"#CC6633\";}\nreturn\"#A78C2B\";}
 *                 },
 *                 get_adherent_class:function(statut,prospect){
 *                   switch(statut){case\"adherent\":return\"adherent\";case\"groupe\":return\"groupe\";case\"radie\":return\"radie\";case\"prospect\":if(prospect&&!this.is_actif(statut,prospect)){return\"prospectold\";}\nreturn\"prospect\";}}
 *                 ,
 *                 chartChange:function(e){
 *                   var type=document.getElementById('As9275dK2D45gm2C0JSS033sd').value;this.post(\"home_chart\",{type:type},(d)=>{if(d.data){}});
 *                 },
 *                 userFull:function(id){
 *                   var user=bbn.fn.getRow(this.users,\"value\",id);
 *                   return'<span class=\"appui-avatar\"><img src=\"'+user.avatar+'\" alt=\"'+user.text+'\"> '+user.text+'<\/span>';
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * )();
 *   ",
 *   "script":"
 * (
 *   (data)=>{
 *     bbn.fn.autoExtend(\"lng\",{
 *       \"(Un)Select all\":\"Tout (d\\u00e9)s\\u00e9lectionner\",
 *       \"Search\":\"Recherche\",\"Close\":\"Fermer\",
 *       \"Close all\":\"Tout fermer\",\"Close others\":\"Fermer les autres\",\"Pin\":\"\\u00c9pingler\",\"Unpin\":\"D\\u00e9s\\u00e9pingler\",\"Full screen\":\"Plein \\u00e9cran\",\"Reload with a fresh view\":\"R\\u00e9initialiser l'application\",\"Log out\":\"Se d\\u00e9connecter\",\"Increase version\":\"Ajouter une version\",\"Dashboard\":\"Tableau de bord\",\"Help\":\"Aide\",\"My profile\":\"Mon profil\",\"Unknown\":\"Inconnu\",\"Saved\":\"Sauvegard\\u00e9\",\"Error\":\"Erreur\"})})();(()=>{return(data)=>{bbn.fn.autoExtend('env',{logging:data.is_dev||data.is_test?true:false,isDev:data.is_dev?true:false,mode:data.is_dev?'dev':(data.is_test?'test':'prod'),lang:data.lang,siteTitle:data.site_title,wp_url:data.wp_url,token:data.token,connection_failures:0,connection_max_failures:10,money:data.money,appPrefix:data.app_prefix,plugins:data.plugins,cdn:data.shared_path});bbn.fn.autoExtend('lng',{select_unselect_all:bbn._('(Un)Select all'),search:bbn._('Search'),close:bbn._('Close'),closeAll:bbn._('Close all'),closeOthers:bbn._('Close others'),pin:bbn._('Pin'),unpin:bbn._('Unpin')});bbn.fn.autoExtend('opt',data.options);bbn.fn.extend(bbn.lng,data.lng);Vue.config.devtools=!!data.is_dev||!!data.is_test;Vue.config.errorHandler=function(err,vm,info){bbn.fn.log(\"ERROR handler from VueJS\",err,vm,info);};let js_data={};if(data.js_data){js_data=eval(data.js_data)||{};}\nbbn.fn.log(\"IS THERE JS DATA?\",js_data,data);if(!js_data.appuiMixin){js_data.appuiMixin={header:true,nav:true,clipboard:true,status:true,list:[{url:'core\/home',title:bbn._(\"Home\"),load:true,static:true,icon:'nf nf-fa-home'}],searchBar:false};}\nif(!js_data.componentsMixin){js_data.componentsMixin={};}\nbbn.fn.each(data.plugins,(path,name)=>{bbn.vue.addPrefix(name,(tag,resolve,reject)=>{bbn.vue.queueComponent(tag,path+'\/components\/'+bbn.fn.replaceAll('-','\/',tag).substr(name.length+1),null,resolve,reject);});});bbn.vue.addPrefix(data.app_prefix,(tag,resolve,reject,mixins)=>{bbn.vue.queueComponent(tag,'components\/'+bbn.fn.replaceAll('-','\/',tag).substr((data.app_prefix+'-').length),mixins,resolve,reject);},bbn.fn.extend(true,{},{methods:{getTab(){return bbn.vue.closest(this,'bbns-container');},popup(){return this.getTab().popup.apply(this,arguments);}}},js_data.componentsMixin));let rightShortcuts=[{action(){bbn.fn.toggleFullScreen();},text:bbn._(\"Full screen\"),icon:'nf nf-fa-arrows_alt'},{action(){window.store.remove('router');document.location.reload();},text:bbn._(\"Reload with a fresh view\"),icon:'nf nf-mdi-sync_alert'},{text:bbn._(\"Log out\"),icon:'nf nf-fa-sign_out',action(){bbn.fn.post('core\/logout').then(()=>{document.location.reload();});}}];if(data.app.user.isAdmin||data.app.user.isDev){rightShortcuts.splice(2,0,{text:bbn._(\"Increase version\"),icon:'nf nf-oct-versions',action(){bbn.fn.post('core\/service\/increase').then(()=>{document.location.reload();});}})}\nbbn.fn.log(\"LIST\",data.list);bbn.vue.initDefaults({appui:{root:data.root,list:[{source:data.list||js_data.appuiMixin.list}],nav:true,status:true,header:true,clipboard:true,logo:data.logo,pollable:(data.pollable===undefined)||data.pollable,leftShortcuts:[{url:'dashboard\/home',text:bbn._(\"Dashboard\"),icon:'nf nf-fa-dashboard'},{action(){appui.popup().load({url:'help',width:'90%',height:'90%',scrollable:false});},text:bbn._(\"Help\"),icon:'nf nf-mdi-help_circle_outline'},{url:'usergroup\/main',text:bbn._(\"My profile\"),icon:'nf nf-fa-user'}],rightShortcuts:rightShortcuts,theme:data.theme}});let appuiMixin={data:{options:data.options,menus:data.menus,plugins:data.plugins,currentMenu:data.current_menu,shortcuts:data.shortcuts,app:{data(){return data.app},computed:{userName(){return bbn.fn.getField(this.users,'text',{value:this.user.id})||bbn._('Unknown')}},methods:{link_email:function(em){return em?'<a href=\"mailto:'+em+'\">'+em+'<\/a>':'<em>non d\u00e9fini<\/em>';},getUserName:function(id){return bbn.fn.getField(this.users,\"text\",\"value\",id);},getUserGroup:function(id){return bbn.fn.getField(this.users,\"id_group\",\"value\",id);},getActiveUsers(){if(bbn.fn.isArray(appui.app.users)){return bbn.fn.order(appui.app.users.filter(user=>{return!!user.active;}),'text','ASC');}\nreturn[];},historique_type:function(d){var op;if((typeof(d.operation)!=='undefined')&&(op=bbn.fn.getRow(this.historiques,\"value\",d.operation))){return'<span style=\"color:'+op.color+'\">'+op.text+'<\/span>';}\nreturn\"\";},}}},methods:{setImessage(e){if((e.hidden!==undefined)&&e.id){bbn.fn.post(this.root+'actions\/imessage',e,(r)=>{if(r.success){appui.success(bbn._('Saved'));}\nelse{appui.error(bbn._('Error'));}});}}}};new Vue({el:'div.appui',mixins:[appuiMixin,js_data.appuiMixin],created(){if(this.isMobile){document.body.classList.add('bbn-mobile');}\nif(this.isTablet){document.body.classList.add('bbn-tablet');}}});};
 *   }
 * )();
 *   "
 * };
 *       
 */

/**
 * @var {String} CACHE_NAME The name of the version
 * @example 242
 **/
const CACHE_NAME = 'v' + data.version;

/**
 * @var {String} CDN The URL of the CDN
 * @example "https://cdn.bbn.io/"
 **/
const CDN = data.shared_path;

/**
 * @var {String} libFile A coma separated list of libraries for the CDN
 * @example "nerd-fonts,bbn-css|latest|dark,bbn-vue,font-mfizz,devicon,webmin-font,jsPDF"
 */
const libFile = data.cdn_lib;

/**
 * @var {Array} precacheResources Static js files to load
 * @example
 **/
const precacheResources = [
  data.script_src
];

/** @var {Number} offlineTimeout One hour after which the user should be offline */
let offlineTimeout = 3600000;

/** @var {Boolean} isRunning True if is running */
let isRunning = false;

/** @var {Boolean} isFocused True if is focused */
let isFocused = false;

/** @var {Number} lastFocused A timestamp of the last time the window was focused */
let lastFocused = (new Date()).getTime();

/** @var {Number} lastChat  A timestamp of the last time a chat has been received */
let lastChat = 0;

/** @var {String} poller The poller URL */
const poller = data.plugins['appui-core'] + '/poller';

/** @var {Object} dataObj The content object that will be passed with the page */
let dataObj = {};

/** @var {Object} observers The observers list */
let observers = {};

/** @var {Number} retries The number of attempts done to connect */
let retries = 0;

/** @var {Array} windows The list of client windows with objects with id and token */
let windows = {};

/** @var {Number} aborter An object allowing to abort the current query */
let aborter;

/** @var {Boolean} isConnected True if is connected */
let isConnected = false;

/** @var {Number} interval The interval length for setInterval */
let interval;

/** @var {Object} intervalObj The interval object for launching the poller */
let intervalObj;

/** @var {Boolean} noResp True if the server doesn't answer */
let noResp = false;

/** @var {Object} observers The observers list */
let lastClientMessage = {};

/** @var {Object} observers The observers list */
let lastResponse = {};

/*
//window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
//let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
//let dbVersion = 1;

    Note: The recommended way to do this is assigning it to window.indexedDB,
    to avoid potential issues in the global scope when web browsers start 
    removing prefixes in their implementations.
    You can assign it to a varible, like var indexedDB… but then you have 
    to make sure that the code is contained within a function.

// Create/open database
let dbRequest = indexedDB.open("appui", dbVersion);

dbRequest.onsuccess = function (event) {
  log("Success creating/accessing IndexedDB database");
  let db = dbRequest.result;
  log(dbRequest.result, event);

  db.onerror = function (event) {
    log("Error creating/accessing IndexedDB database");
  };
  
  // Interim solution for Google Chrome to create an objectStore. Will be deprecated
  if (db.setVersion) {
    if (db.version != dbVersion) {
      var setVersion = db.setVersion(dbVersion);
      setVersion.onsuccess = function () {
        log("DB POINT 1");
        //db.createObjectStore(db);
        //getImageFile();
        // Create an objectStore
        log("Creating objectStore");
        db.createObjectStore("clipboard");
      };
    }
    else {
        log("DB POINT 2");
      //getImageFile();
    }
  }
  else {
        db.createObjectStore("clipboard");
        log("DB POINT 3");
    //getImageFile();
  }
};

// For future use. Currently only in latest Firefox versions
dbRequest.onupgradeneeded = function (event) {
        log("DB POINT 4");
    //createObjectStore(event.target.result);
};
*/

/**
 * Logs in the console in a special format evidencing it comes from the service worker.
 */
function log() {
  //console.log("**** START LOG FROM SERVICE WORKER ****");
  let logs = [];
  for (let i = 0; i < arguments.length; i++) {
    //console.log(arguments[i]);
    logs.push(arguments[i] && (typeof arguments[i] === 'object') ? JSON.parse(JSON.stringify(arguments[i])) : arguments[i]);
  }
  debug({logs: logs});
  //console.log("**** END LOG FROM SERVICE WORKER ****");
}

/**
 * Send debug data to the windows.
 *
 * @param {Object} data
 */
function debug(data) {
  self.clients.matchAll({
    includeUncontrolled: true
  }).then(clientList => {
    data.windows = windows;
    clientList.forEach(client => {
      if (windows[client.id]) {
        try {
          client.postMessage({
            client: client.id,
            data: {
              type: 'log',
              data: data
            }
          });
        }
        catch (e) {
          console.log("Can't post message to client id " + client.id);
          console.log(e)
        }
      }
    })
  })
}
 
log("This is the start...");

/**
 * Update the variables windows, isFocused and lastFocused if focused.
 *
 * @param {Array} clientList
 */
function updateWindows(clientList){
  isFocused = false;
  let oks = [];
  let toFill = [];
  clientList.forEach(client => {
    if (!windows[client.id]) {
      windows[client.id] = {
        id: client.id,
        token: null,
        data: null
      };
      toFill.push(windows[client.id]);
    }
    oks.push(client.id);
    if ( client.focused ){
      lastFocused = (new Date()).getTime();
      isFocused = true;
    }
  });
  for (let n in windows) {
    if (!oks.includes(n)) {
      if (windows[n].data) {
        for (let i = 0; i < toFill.length; i++) {
          if (!toFill[i].data) {
            toFill[i].data = windows[n].data;
          }
        }
      }
      if (windows[n] && observers[windows[n].token]) {
        delete observers[windows[n].token];
      }
      delete windows[n];
    }
  }
}

/**
 * Called in the interval and will launch the poller only if not running
 */
function launchPoller() {
  // Poller URL and is not running
  if (poller && !isRunning) {
    log('launching poller at ' + (new Date()).getTime(), poller, isRunning);
    self.clients.matchAll({
      includeUncontrolled: true
    }).then(clientList => {
      updateWindows(clientList);
      if ( !clientList.length ){
        log("There is no client, user certainly disconnected (or not?). Interval is " + interval);
        if (interval !== 60) {
          setPoller(60);
        }
        return;
      }
      else if( !isConnected ){
        log("Disconnected....");
        if (interval !== 60) {
          setPoller(60);
        }
        return;
      }
      else if ( interval === 60 ){
        log("Setting the poller");
        setPoller(1);
      }
      if ( isConnected ){
        let now = (new Date()).getTime();
        if (isFocused || (now - lastFocused < offlineTimeout) ){
          log("POLLING");
          poll();
          log("AFTER POLLING");
        }
      }
      else if (intervalObj) {
        clearInterval(intervalObj);
      }
    });
  }
}

/**
 * Changes the interval for the poller (launcher).
 *
 * @param {Number} duration
 */
function setPoller(duration){
  log('Setting the poller');
  clearInterval(intervalObj);
  interval = duration;
  intervalObj = setInterval(launchPoller, duration*1000);
}

/**
 * Reacts to a message received from the client.
 *
 * @param {Event} event
 */
function receive(event){
  log('Receiving an event with keys ' + Object.keys(event.data).join(', '));
  let promise = self.clients.matchAll().then(clientList => {
    if (event.data.type === 'init') {
      updateWindows(clientList);
      clientList.forEach(client => {
        if (client.id === event.source.id) {
          client.postMessage({
            client: event.source.id,
            type: 'init',
            data: data
          });
          isConnected = true;
        }
      })
    }
    else{
      processClientMessage(event, clientList);
    }
  });
  if (event.waitUntil) {
    event.waitUntil(promise);
  }
}

/**
 * 
 *
 * @param {Event} event
 * @param {Array} clientList
 */
function processClientMessage(event, clientList) {
  updateWindows(clientList);
  console.log('clientlist', clientList)
  // The sender window's ID
  let senderID = event.source.id;
  let d = event.data;
  if (d.poll) {
    poll();
  }
  // If the token has not been yet given to the window we do
  else if (d.token && windows[senderID]) {
    if (!windows[senderID].token) {
      windows[senderID].token = d.token;
    }
    if (windows[senderID].token !== d.token) {
      throw new Error("The token doesn't correspond");
    }
  }
  let obsTodo = [];
  //log("processClientMessage", d, event, windows, clientList.length);
  lastClientMessage = d;
  debug({client: d});
  log("processClientMessage with keys " + Object.keys(d).join(', '));
  windows[senderID].data = d;
  dataObj = d;
/* 
  if ( 'observers' in d ){
    observers[senderID] = d.observers;
  }
  for (let n in windows) {
    if ( observers[windows[n].token] ){
      observers[windows[n].token].forEach((b) => {
        obsTodo.push(b);
      });
    }
  }
  // Updating dataObj
  dataObj.observers = obsTodo;
  if ( 'chat' in d ){
    dataObj.chat = d.chat;
  }
  if ( 'lastChat' in d ){
    dataObj.lastChat = d.lastChat;
  }
  if ( 'usersHash' in d ){
    dataObj.usersHash = d.usersHash;
  }
  if ( 'chatsHash' in d ){
    dataObj.chatsHash = d.chatsHash;
  }
  if ( 'disconnected' in d ){
    dataObj.disconnected = d.disconnected;
  }*/
  // Aborting the current polling will make a new one happen with the new dataObj
  if ( isRunning ){
    aborter.abort();
  }
}

/**
 * Processes a few specific server messages by updating dataObj and forwarding to each window
 *
 * @param {String} json
 * @return {*} 
 */
function processServerMessage(json) {
  debug({response: json});
  log("processServerMessage with keys " + Object.keys(json).join(', '));
  return self.clients.matchAll().then(function(clientList) {
    retries = 0;
    isFocused = false;
    if ( json.disconnected ){
      isConnected = false;
    }
    if( json.plugins && Object.keys(json.plugins).length ){
      for ( let plugin in json.plugins ){
        if ( 'serviceWorkers' in json.plugins[plugin] ){
          Object.assign(dataObj[plugin], json.plugins[plugin].serviceWorkers);
        }
      }
    }
    if ( !clientList.length ){
      log("There is no client, should I claim them?");
    }
    clientList.forEach(client => {
      client.postMessage({
        type: 'message',
        data: json
      });
    });
  });
}

/**
 * Fetch auto-aborting the request accordingly to timeout.
 *
 * @param {String} url
 * @param {Number} timeout
 * @param {Object} options
 */
function fetchWithTimeout(url, timeout, options) {
  return new Promise( (resolve, reject) => {
    // Set timeout timer
    let timer = setTimeout(
      () => reject( new Error('Request timed out') ),
      timeout
    );
    if ( !options ){
      options  = {};
    }
    aborter = new AbortController();
    options.signal = aborter.signal;
    fetch(url, options).then(
        response => resolve( response ),
        err => reject( err )
    ).finally( () => clearTimeout(timer) );
  })
}

/**
 * Polls the server and recalls itself when finished.
 */
function poll(d){
  log('Polling');
  isRunning = true;
  if (isConnected) {
    debug({request: dataObj});
    fetchWithTimeout(poller, 600000, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(Object.keys(dataObj).length ? dataObj : {test: 1})
    })
      .then(function(response) {
        // Clear the timeout as cleanup
        if ( response.status !== 200 ){
          log("Error: " + response.status);
          isRunning = false;
          retries++;
          if ( retries <= 3 ){
            poll();
          }
          else {
            log('Max retries done... Bye!');
          }
        }
        else{
          // What we do with the answer from poller 
          response.text().then((text) => {
            let json;
            try {
              json = JSON.parse(text);
              noResp = false;
            }
            catch(e){
              noResp = true;
              log("The response is no JSON");
              json = {message: "The response is no JSON", error: e.message};
            }
            retries = 0;
            /** @todo WTF?? The number of retries are not well managed */
            if ( Object.keys(json).length ){
              log("JSON RESULT with keys " + Object.keys(json).join(', '));
              processServerMessage(json).then((res) => {
                isRunning = false;
                if ((res === false) || noResp) {
                  retries++;
                  if ( retries <= 3 ){
                    if ( noResp ){
                      log('Poller noResp');
                      setTimeout(poll, 60000);
                    }
                    else {
                      poll();
                    }
                  }
                  else {
                    log('Max retries done...');
                  }
                }
                else{
                  poll();
                }
              });
            }
            else{
              log('Empty answer from poller');
              poll();
            }
          });
        }
      })
      .catch(function(err) {
        isRunning = false;
        if (err.message !== 'The user aborted a request.') {
          log('fetch failed!', err.message);
        }
      });
  }
  //log("SENDING THIS TO SERVER: \n" + JSON.stringify(dataObj, null, 2));
}

// On install it adds to the cache precacheResources and activates
self.addEventListener('install', event => {
  log('Service worker install event for version ' + CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(precacheResources);
      })
      .then(function() {
        // `skipWaiting()` forces the waiting ServiceWorker to become the
        // active ServiceWorker, triggering the `onactivate` event.
        // Together with `Clients.claim()` this allows a worker to take effect
        // immediately in the client(s).
        return self.skipWaiting();
      })
  );
});

// On activate delete all the old cache
self.addEventListener('activate', () => {
  log('Service worker activate event for version ' + CACHE_NAME);
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.filter(function(cacheName) {
        return cacheName !== CACHE_NAME;
        // Return true if you want to remove this cache,
        // but remember that caches are shared across
        // the whole origin
      }).map(function(cacheName) {
        return caches.delete(cacheName);
      })
    // `claim()` sets this worker as the active worker for all clients that
    // match the workers scope and triggers an `oncontrollerchange` event for
    // the clients.
    ).then(() => self.clients.claim());
  })
});

// On fetch the cache is managed.
self.addEventListener('fetch', event => {
  if ( /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ){
    console.log('SAFARI');
    return;
  }
  if (event.request.method !== 'POST') {
    event.respondWith(caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          if ((event.request.url.indexOf(data.shared_path) === 0)
          || (event.request.url.indexOf(data.site_url + 'components/') === 0)
          ){
            return caches.open(CACHE_NAME).then(cache => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            })
          }
          return response;
        });
      })
    );
  }
});

// Launches the function receive for all communication from the window
self.addEventListener('message', event => receive(event));

// Launches the poller after one second
setPoller(1);


          /*
        this.observersCopy = this.observers.slice();
        this.poller = bbn.fn.ajax(this.pollerPath, 'json', $.extend({observers: this.observers}, this.pollerObject), 'poller', (r) => {
          this.pollerObject.message = null;
          //bbn.fn.log("--------------OBS: Returning Data---------------");
          // put the data_from_file into #response
          if ( r.data ){
            bbn.fn.each(r.data, (d, i) => {
              if ( d.observers ){
                for ( let b of d.observers ){
                  let arr = bbn.fn.filter(this.observers, {id: b.id});
                  for ( let a of arr ){
                    if ( a.value !== b.result ){
                      this.$emit('bbnObs' + a.element + a.id, b.result);
                      a.value = b.result;
                    }
                  }
                }
              }
            });
            //appui.success("<div>ANSWER</div><code>" + JSON.stringify(r.data) + '</code>', 5);
          }
          if ( r.chat && this.getRef('chat') ){
            if ( r.chat.hash ){
              this.pollerObject.usersHash = r.chat.hash;
            }
            this.getRef('chat').receive(r.chat);
            if ( r.chat.chats ){
              this.pollerObject.lastChat = r.chat.last;
            }
          }

          // call the function again, this time with the timestamp we just got from server.php
          this.polling = false;
          this.poller = false;
        }, () => {
          this.polling = false;
          this.poller = false;
        });
        */
