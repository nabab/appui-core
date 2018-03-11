<?php
/** @var \bbn\mvc\model $model */
if ( \defined('BBN_USER_TOKEN') ){
  $br_obj = new \apst\bureau($model->db);
  $lettre = new \bbn\appui\masks($model->db);
  $id_justificatifs = \bbn\appui\masks::get_option_id('LTJUS');
  $justificatifs = $lettre->get_text_value($id_justificatifs);

  if ( $justificatif_defaut = $lettre->get_default($id_justificatifs) ){
    $justificatif_defaut = $justificatif_defaut['id_note'];
  }
  else{
    $justificatifs = [];
    $justificatif_defaut = '';
  }
  $id_courriers = \bbn\appui\masks::get_option_id('LTCOU');
  //$id_courriers = '96dd3dfae07211e781c6000c29703ca2';
  $modeles_courriers = $lettre->get_text_value($id_courriers);
  $champs_dva = $model->inc->outils->champs_dva();
  $champs = [
    29 => $model->inc->outils->form_document(29),
    35 => $model->inc->outils->form_document(35),
    37 => $model->inc->outils->form_document(37)
  ];
  $bureaux = array_map(function($a){
    return [
      'text' => $a['titre'],
      'value' => $a['id']
    ];
  }, $br_obj->get_all());

  $pm = new \bbn\appui\tasks($model->db);

  $d = [
    'civs' => [
      [
        'value' => 'M',
        'text' => 'Monsieur'
      ], [
        'value' => 'MME',
        'text' => 'Madame'
      ], [
        'value' => 'MLLE',
        'text' => 'Mademoiselle'
      ], [
        'value' => 'M/MME',
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
      ]
    ],
    'bureaux' => $bureaux,
    'modeles_courriers' => $modeles_courriers,
    'justificatifs' => $justificatifs,
    'justificatif_defaut' => $justificatif_defaut,
    //'departements' => \bbn\x::to_groups($model->db->get_key_val('SELECT numero, dpt FROM apst_departements ORDER BY
    // numero')),
    //'regions' => \bbn\x::to_groups($model->db->get_key_val('SELECT id, region FROM apst_regions ORDER BY region')),
    'regions' => $model->inc->options->full_tree('regions'),
    'statuts' => [
      ['text' => 'Prospect', 'value' => 'prospect', 'color' => '#A78C2B'],
      ['text' => 'Adhérent', 'value' => 'adherent', 'color' => '#00BD00'],
      ['text' => 'Groupe', 'value' => 'groupe', 'color' => '#06A6A8'],
      ['text' => 'Radié', 'value' => 'radie', 'color' => '#AC0606']
    ],
    'docs' => $model->inc->options->options('documents'),
    'tables' => array_filter($model->db->get_tables(), function($a){
      return strpos($a, 'apst_') === 0;
    }),
    'champs_dva' => $champs_dva,
    'champs' => $champs,
    'lng' => [
      'no_role_permission' => _("You have no right to modify the roles in this task"),
      'opened_tasks' => _("Opened tasks"),
      'new_task' => _("New task"),
      'demo_task' => _("Demo task form"),
      'my_ongoing_tasks' => _("My ongoing tasks"),
      'timeline' => _("Timeline"),
      'search' => _("Search"),
      'soon' => _("Soon"),
      'all_tasks' => _("All tasks"),
      'confirm_delete' => _("Are you sure you want to remove yourself from this task??"),
      'file' => _("File"),
      'link' => _("Link"),
      'problem_file' => _("Problem with the file..."),
      'error_uploading' => _("Problem during the upload"),
      'file_exists' => _("A file with this name already exists"),
      'user' => _("User"),
      'date' => _("Date"),
      'action' => _("Action"),
      'global_view' => _("Global view"),
      'roles' => _("Roles"),
      'journal' => _("Events journal"),
      'no_comment_text' => _("You have to enter a comment, a link, or a file"),
      'sure_to_hold' => _("Are you sure you want to put this task on hold?"),
      'sure_to_resume' => _("Are you sure you want to resume this task?"),
      'sure_to_close' => _("Are you sure you want to close this task?"),
      'sure_to_unfollow' => _("Are you sure you want to unfollow this task?"),
    ],
    'task_roles' => \bbn\appui\tasks::get_options_ids('roles'),
    'task_states' => \bbn\appui\tasks::get_options_ids('states'),
    'task_options' => \bbn\appui\tasks::get_tasks_options(),
    'task_categories' => \bbn\appui\tasks::cat_correspondances(),
    'tasks' => [
      'roles' => \bbn\appui\tasks::get_options_ids('roles'),
      'states' => \bbn\appui\tasks::get_options_ids('states'),
      'options' => [
        'states' => \bbn\appui\tasks::get_options_text_value('states'),
        'roles' => \bbn\appui\tasks::get_options_text_value('roles'),
        'cats' => \bbn\appui\tasks::cat_correspondances()
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
  ];
  //die(\bbn\x::hdump(\bbn\x::convert_uids($d)));




  $d['wp_url'] = BBN_WP_URL;
	$d['logo'] = $model->data['static_path'].'img/logo.png';

  $d['options'] = $model->inc->options->js_categories();
  $d['options']['bbn_tasks'] = \bbn\appui\tasks::get_options();
  $d['options_categories'] = $model->inc->options->full_options();
  $d['activites'] = $model->inc->options->text_value_options(10);
  $d['token'] = BBN_USER_TOKEN;
  return $d;
}