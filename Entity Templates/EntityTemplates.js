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
							   }
							   if (entityTypeText === 'Bug') {
								   allowProcess = 1;
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
									  UserStory: "/api/v1/Userstories?format=json&include=[Description,Name,EntityType]&where=(tags eq 'TPTEMPLATE')",
									  Bug: "/api/v1/Bugs?format=json&include=[Description,Name,EntityType]&where=(tags eq 'TPTEMPLATE')"
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
						* Callback function for getJson
						*
						* @param data
						*/
					   function createAndPopulateDropdown(data) {

						   templateData = createDropDownHtml(data);

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

						   var dropdownSelector = '';
						   var dropdownContent = '';

						   // Reset Dropdown content before building dropdown.
						   $('#TpTemplate1387378078').each(function(){
							   $(this).remove();
						   });

						   var dropdownContentActions = '';
						   var templateData = {'templates': {}};
						   $.each(data.Items, function(index, item) {

							   // Set entityType, will be included with injected JS later.
							   if(templateData.entityType != ''){
								   templateData.entityType = item['EntityType'];
							   }

							   // Set ApplicationPath, will be included with injected JS later.
							   if(templateData.applicationPath != ''){
								   templateData.applicationPath = configurator.getApplicationPath();
							   }

							   templateData.templates[item['Id']] = {
								   Description : item['Description']
							   }
							   dropdownContentActions = dropdownContentActions + '<div data-id="TemplateStoryID_' + item['Id'] + '"' +
							   'class="ui-menu__item ui-menu__item-action  i-role-action-attach to request ">' +
								   '<span class="drop-down-option">' + item['Name'] + '</span>' +
							   '</div>'
						   });

						   if(dropdownContentActions.length < 1) {
							   dropdownContentActions = '<div data-id="TemplateStoryID_NOTEMPLATE"' +
							   'class="ui-menu__item ui-menu__item-action  i-role-action-attach to request ">' +
							   '<span class="drop-down-option">No templates available</span>' +
							   '</div>';
						   }

						   dropdownSelector = '<div class="ui-menu-actions ui-menu-action-template">' +
							   '<span class="ui-menu__trigger i-role-trigger tau-bubble-target ui-link">Templates<span class="ui-menu__indicator"></span>' +
							   '</span>' +
						        '</div>';

							dropdownContent = '<div class="tau-bubble i-role-bubble ui-menu-actions__bubble i-orientation_top" ' +
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
						*
						* return void
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
						*
						* return void
						*/
					   function insertJS() {

						   var js = "<script type=\"text/javascript\">" +

									/*
									Function getPostUrl, is used for Ajax.post to update the right entity type.
									 */
									"function getPostUrl (entityType) {" +
										"return {" +
													  "UserStory: \"/api/v1/Userstories?resultInclude=[Id,Name,Project]\"," +
													  "Bug: \"/api/v1/Bugs?resultInclude=[Id,Name,Project]\"" +
												  "}[entityType] || null" +
									"}" +


									// Hide the template dropdown when clicking outside or switching entity.
									"$( document ).mouseup(function (e) {" +
							   			"var container = $('#TpTemplate1387378078');" +
										"if (!container.is(e.target) && container.has(e.target).length === 0) {" +
											"container.removeClass('i-state_visible').hide();" +
										"}" +
						   			"});" +


									"$( document ).ready(function() {" +
										// Show/hide the templates dropdown
										"$('.ui-menu-action-template').unbind('click').click(function(){" +
											"if($('#TpTemplate1387378078').hasClass('i-state_visible')){" +
												"$('#TpTemplate1387378078').removeClass('i-state_visible').hide();" +
											"} else {" +
												"$('#TpTemplate1387378078').addClass('i-state_visible').show();" +
											"}" +
										"});"+

										// Click action for template selection
										"$('#TpTemplate1387378078 .ui-menu__item').unbind('click').click(function(){" +
											// Hide the templates dropdown on click.
											"$('#TpTemplate1387378078').removeClass('i-state_visible').hide();" +

											// Spliting the Id to match tempalteData.tempaltes index.
											"var tempIdArray = $(this).data('id').split('_');" +
											"var tempId = tempIdArray[1];" +
											"containerId = $('.ui-description__inner.i-role-property.editable').attr('id');" +

											"var allowTemplateInsertion = true;" +
											// Check if description is already set.
											"if(!$('#\'+containerId+\'').is(':empty')) {" +
												"allowTemplateInsertion = false;" +
											   "var response = confirm(\"There is already text in the description field, are you sure you want to overwrite?\");" +
											   "if (response==true) {" +
												   "allowTemplateInsertion=true;" +
											   "}" +
											"}; " +

											// If allowTemplateInsertion update template description.
											"if(allowTemplateInsertion) {" +

												// Setting the description-content into both the div-placeholder and the rte-editor placeholder.
												"$('#\'+containerId+\'').html(templateData.templates[tempId]['Description']);" +

												// TODO: Might not be needed as we save on the fly..
												"$('#cke_\'+containerId+\' .cke_wysiwyg_div').html(templateData.templates[tempId]['Description']);" +

												// EntityType
												"var entityType = templateData.entityType.Name;" +

												// Get the entityId
											   "var entityIdHtml = $('.entity-id .ui-link').html();" +
											   "var entityIdArray = entityIdHtml.split('#');" +
											   "var entityId = entityIdArray[1];" +

												// assign description so it's easier to use later.
											   "var description = templateData.templates[tempId]['Description'];" +
												"var data = {\"Id\": entityId, \"Description\": description};" +

												// Todo: Url needs to be path specific by using the: configurator.getApplicationPath()
												"$.ajax({" +
														   "type: 'POST'," +
														   //"url:  '/api/v1/Userstories?resultInclude=[Id,Name,Project]', " +
															"url: templateData.applicationPath + getPostUrl(entityType)," +
														   "dataType: 'json', "+
															"data: JSON.stringify(data)," +
														   "contentType:\"application/json; charset=utf-8\"" +
													   "});" +
											"}" +

										"})" +
									"});"+
									"</script>";

						   $("head").append(js);
					   }

				   });