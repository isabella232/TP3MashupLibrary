tau.mashups
		.addDependency('tp3/mashups/context')
		.addDependency('tp/general/view')
		.addDependency('tau/configurator')
		.addMashup(function (context, view, configurator) {
					   view.onRender(function ($pageElement) {

						   var allowProcess = 0;
						   var url = '';

						   var templateData = {};

						   // Storing URL variables
						   var urlVars = getUrlVars();

						   // Setting acid - Context id.
						   var acidArray = urlVars['acid'].split('#');
						   var acid = acidArray[0];

						   // To respect context we need this.
						   context.onChange(function(ctx) {
							   acid = ctx.acid;
						   });

						   $('em.ui-type-icon').each(function () {
							   var entityTypeText = $(this).text();
							   if (entityTypeText === 'User Story') {
								   allowProcess = 1;
								   url = getUrl('UserStory');
								   console.log('Entity: USER STORY');
							   }
							   if (entityTypeText === 'Bug') {
								   allowProcess = 1;
								   console.log('Entity: BUG');
								   url = getUrl('Bug');
							   }
						   });
						   if (allowProcess === 0) {
							   return;
						   }

						   // Get JSON data and parse it to function.
						   $.getJSON( configurator.getApplicationPath() + url + '&acid=' + acid, createAndPopulateDropdown);

					   });

					   /**
						* Gets the url of the given entityType.
						*
						* @param entityType
						* @returns {{UserStory: string, Bug: string, Context: string}|null}
						*/
					   function getUrl (entityType) {
						   return {
									  UserStory: "/api/v1/Userstories?format=json&include=[Description,Name]&where=(tags eq 'TPTEMPLATE')",
									  Bug: "/api/v1/Bugs?format=json&where=(tags eq 'TPTEMPLATE')"
								  }[entityType] || null
					   }

					   /**
						* Get Url variables from Querystring.
						*
						* @returns {Array}
						*/
					   function getUrlVars() {
						   var vars = [], hash;
						   var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
						   for(var i = 0; i < hashes.length; i++)
						   {
							   hash = hashes[i].split('=');
							   vars.push(hash[0]);
							   vars[hash[0]] = hash[1];
						   }
						   return vars;
					   }

					   /**
						*
						*
						* @param data
						* @returns {{templates: {}}}
						*/
					   function createAndPopulateDropdown(data) {

						   templateData = createDropDownHtml(data);

						   console.log(templateData.templates[231]['Description']);
						   // Inject the css and javascript to head
						   insertCSS();
						   insertJS();

					   }

					   /**
						* Create drop down html and returns data for later
						*
						* @param data
						* @returns {array}
						*/

					   function createDropDownHtml(data) {

						   var dropdownContentActions = '';
						   var templateData = {'templates': {}};
						   $.each(data.Items, function(index, item) {
							   templateData.templates[item['Id']] = {
								   Description : item['Description']
							   }
							   dropdownContentActions = dropdownContentActions + '<div data-id="TemplateStoryID_' + item['Id'] + '"' +
							   'class="ui-menu__item ui-menu__item-action  i-role-action-attach to request ">' +
								   '<span class="drop-down-option">' + item['Name'] + '</span>' +
							   '</div>'
						   });


						   var dropdownSelector = '<div class="ui-menu-actions ui-menu-action-template">' +
							   '<span class="ui-menu__trigger i-role-trigger tau-bubble-target ui-link">Templates<span class="ui-menu__indicator"></span>' +
							   '</span>' +
						        '</div>';


							var dropdownContent = '<div class="tau-bubble i-role-bubble ui-menu-actions__bubble i-orientation_top" ' +
						   'id="TpTemplate1387378078" data-orientation="top">' +
							   '<div style="margin:0" role="content" class="tau-bubble__inner">' +
								   '<div class="ui-menu-actions" style="">' +
									   '<div class="ui-drop-down drop-down-list">' + dropdownContentActions + '</div>' +
								   '</div>' +
							   '</div>' +
						   '</div>';

						   $('.tau-container.inner').prepend(dropdownSelector);
						   $('.tau-board-body-wrapper .tau-app').append(dropdownContent);

						   return templateData;
					   }

					   /**
						* Insert css into head.
						*
						* * TODO: Should be beautified, with included from external file,
						* but in testing this is not possible because we have no access to file system.
						*/
					   function insertCSS() {

						   var css = '<style type="text/css">' +
									 '.ui-menu-action-template .ui-menu__trigger { background-position: 85px center; }' +
									 '#TpTemplate1387378078 { display: none; z-index: 10000; display: block; top: 84px; left: 749px; }' +
									 '</style>'

						   $("head").append(css);
					   }

					   /**
						* Insert Javascript into the header
						* TODO: Should be beautified, with included from external file,
						* but in testing this is not possible because we have no access to file system.
						*/
					   function insertJS() {
						   var js = "<script type=\"text/javascript\">" +
									"$( document ).ready(function() {" +
										"$('.ui-menu-action-template').click(function(){" +
											"if($('#TpTemplate1387378078').hasClass('i-state_visible')){" +
												"$('#TpTemplate1387378078').removeClass('i-state_visible').hide();" +
											"} else {" +
												"$('#TpTemplate1387378078').addClass('i-state_visible').show();" +
											"}" +
										"});"+
									"});"+
									"</script>";

						   $("head").append(js);
					   }

				   });