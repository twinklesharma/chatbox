var dialogs = {};

function onSystemMessageListener(message) {
  if (!message.delay) {
    switch (message.extension.notification_type) {
      case "1":
        // This is a notification about dialog creation
        getAndShowNewDialog(message.extension.dialog_id);
        break;
      case "2":
        // This is a notification about dialog update
        getAndUpdateDialog(message.extension.dialog_id);
        break;
      default:
        break;
    }
  }
}

function retrieveChatDialogs() {
    QB.chat.dialog.list(null, function(err, resDialogs) {
        if (err) {
          console.error(err);
        } else {
            // repackage dialogs data and collect all occupants ids
            var occupantsIds = [];

            // hide login form
            $('#loginForm').modal('hide');

            if(resDialogs.items.length === 0){
                // setup attachments button handler
                $("#load-img").change(function(){
                    var inputFile = $("input[type=file]")[0].files[0];
                    
                    if (inputFile) {
                        $("#progress").show(0);
                    }

                    clickSendAttachments(inputFile);
                });

                return;
            }

            resDialogs.items.forEach(function(item, i, arr) {
                var dialogId = item._id;
                dialogs[dialogId] = item;

                // join room
                if (item.type != 3) {
                    QB.chat.muc.join(item.xmpp_room_jid, function() {
                        console.info('Joined dialog '+ dialogId);
                    });
                }

                item.occupants_ids.map(function(userId) {
                    occupantsIds.push(userId);
                });
            });

            // load dialogs' users
            updateDialogsUsersStorage(jQuery.unique(occupantsIds), function(){
                // show dialogs
                resDialogs.items.forEach(function(item, i, arr) {
                   
                    showOrUpdateDialogInUI(item, false);
                });

                // and trigger the 1st dialog
                triggerDialog(resDialogs.items[0]._id);

                // setup attachments button handler
                $("#load-img").change(function(){
                    var inputFile = $("input[type=file]")[0].files[0];
                    
                    if (inputFile) {
                        $("#progress").show(0);
                        $(".input-group-btn_change_load").addClass("visibility_hidden");
                    }

                    clickSendAttachments(inputFile);
                });
            });
        }
    });
}

function showOrUpdateDialogInUI(itemRes, updateHtml) {

  var dialogId = itemRes._id;
  var dialogName = itemRes.name;
  var dialogType = itemRes.type;
  var dialogLastMessage = itemRes.last_message;
  var dialogUnreadMessagesCount = itemRes.unread_messages_count;
  var dialogSentTime = (itemRes.last_message_date_sent === null)? null:new Date(itemRes.last_message_date_sent*1000);
  var dialogIcon = getDialogIcon(itemRes.type);
  var dialogTag = (typeof itemRes.data == 'undefined')? '':itemRes.data.tags;

  if (dialogType == 3) {
    opponentId    = QB.chat.helpers.getRecipientId(itemRes.occupants_ids, currentUser.id);
    opponentLogin = getUserLoginById(opponentId);
    dialogName    = 'Dialog with ' + opponentLogin;
  }

  if (updateHtml === true) {
  	var updatedDialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage,dialogSentTime,dialogTag);
  	$('#dialogs-list').prepend(updatedDialogHtml);
  	$('.list-group-item.active .badge').text(0).hide(0);
	} else {
        var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage,dialogSentTime,dialogTag);
        $('#dialogs-list').append(dialogHtml);
	}
       
}

// add photo to dialogs
function getDialogIcon (dialogType) {
  var groupPhoto = '<img src="laravelchat/images/ava-group.svg" width="30" height="30" class="round">';
  var privatPhoto  = '<img src="laravelchat/images/ava-single.svg" width="30" height="30" class="round">';
  var defaultPhoto = '<span class="glyphicon glyphicon-eye-close"></span>';

  var dialogIcon;
  switch (dialogType) {
    case 1:
      dialogIcon = groupPhoto;
      break;
    case 2:
      dialogIcon = groupPhoto;
      break;
    case 3:
    	dialogIcon = privatPhoto;
      break;
    default:
      dialogIcon = defaultPhoto;
      break;
  }
  return dialogIcon;
}

// show unread message count and new last message
function updateDialogsList(dialogId, text){

  // update unread message count
  var badgeCount = $('#'+dialogId+' .badge').html();
  $('#'+dialogId+'.list-group-item.inactive .badge').text(parseInt(badgeCount)+1).fadeIn(500);

  // update last message
  $('#'+dialogId+' .list-group-item-text').text(stickerpipe.isSticker(text) ? 'Sticker' : text);
}

// Choose dialog
function triggerDialog(dialogId){
    // deselect
    var kids = $('#dialogs-list').children();
    kids.removeClass('active').addClass('inactive');

    // select
    $('#'+dialogId).removeClass('inactive').addClass('active');

    $('.list-group-item.active .badge').text(0).delay(250).fadeOut(500);

    $('#messages-list').html('');

    retrieveChatMessages(dialogs[dialogId], null);

    $('#messages-list').scrollTop($('#messages-list').prop('scrollHeight'));
}

function setupUsersScrollHandler(){
  // uploading users scroll event
  $('.list-group.pre-scrollable.for-scroll').scroll(function() {
    if  ($('.list-group.pre-scrollable.for-scroll').scrollTop() == $('#users_list').height() - $('.list-group.pre-scrollable.for-scroll').height()){

      // get and show users
      retrieveUsersForDialogCreation(function(users) {
        $.each(users, function(index, item){
          showUsers(this.user.login, this.user.id);
        });
      });
    }
  });
}

//
function showUsers(userLogin, userId) {
  userLogin = getUserLoginById(userId);
  var userHtml = buildUserHtml(userLogin, userId, false);
  $('#users_list').append(userHtml);
}

// show modal window with users
function showNewDialogPopup() {
  $("#add_new_dialog").modal("show");
  $('#add_new_dialog .progress').hide();

  // get and show users
  retrieveUsersForDialogCreation(function(users) {
    if(users === null || users.length === 0){
      return;
    }
    $.each(users, function(index, item){
      showUsers(this.user.login, this.user.id);
    });
  });

  setupUsersScrollHandler();
}

// select users from users list
function clickToAdd(forFocus) {
    if($('#'+forFocus).hasClass("active")){
      $('#'+forFocus).removeClass("active");
  } else{
      $('#'+forFocus).addClass("active");
  }

//  if ($('#'+forFocus).hasClass("active")) {
//    $('#'+forFocus).removeClass("active");
//  } else {
//      if($('a').hasClass('users_form active')){
//           $('a').removeClass("active");
//            $('#'+forFocus).addClass("active");
//      } else {
//          $('#'+forFocus).addClass("active");
//      }  
//  }
//  
}

// create new dialog
function createNewDialog() {
  var usersIds = [];
  var usersNames = [];

  $('#users_list .users_form.active').each(function(index) {
    usersIds[index] = $(this).attr('id');
    usersNames[index] = $(this).text();
  });

  $("#add_new_dialog").modal("hide");
  $('#add_new_dialog .progress').show();
  var name = $('#dialog-name-input').val();
  var tag = $('#dialog-tag-input').val();
 var hide = $('#dialog-identity-input').is(':checked');
  var dialogName;
  var dialogOccupants;
  var dialogType;

  if (usersIds.length >= 1) {
    if (usersNames.indexOf(currentUser.login) > -1) {
      dialogName = usersNames.join(', ');
      dialogName = name;
    }else{
      var current_user_name = getUserLoginById(currentUser.id);
      dialogName = name;
    }
    
    dialogOccupants = usersIds;
    dialogType = 2;
  } else {
    dialogOccupants = usersIds;
    dialogType = 3;
  }

  var params = {
    type: dialogType,
    occupants_ids: dialogOccupants,
    name: dialogName,
    data: {
    class_name : "data",
    tags: tag,
    hide:hide,
    uid: currentUser.id
  },
  };

  // create a dialog
  //
  console.log("Creating a dialog with params: " + JSON.stringify(params));

  QB.chat.dialog.create(params, function(err, createdDialog) {
    if (err) {
      console.log(err);
    } else {
      console.log("Dialog " + createdDialog._id + " created with users: " + dialogOccupants);

      // save dialog to local storage
      var dialogId = createdDialog._id;
      dialogs[dialogId] = createdDialog;
      createdDialog["tags"] = tag;
      createdDialog["hide"] = hide;
      currentDialog = createdDialog;

      joinToNewDialogAndShow(createdDialog);

      notifyOccupants(createdDialog.occupants_ids, createdDialog._id, 1);

      triggerDialog(createdDialog._id);

      $('a.users_form').removeClass('active');
    }
  });
}

//
function joinToNewDialogAndShow(itemDialog) {
  
  var dialogId = itemDialog._id;
  var dialogName = itemDialog.name;
  var dialogLastMessage = itemDialog.last_message;
  var dialogUnreadMessagesCount = itemDialog.unread_messages_count;
  var dialogIcon = getDialogIcon(itemDialog.type);
  var dialogSentTime = (itemDialog.last_message_date_sent === null)? null:new Date(itemDialog.last_message_date_sent*1000);
  var dialogTag = (itemDialog.tags === null|| typeof itemDialog.tags == 'undefined')? '':itemDialog.tags;
  // join if it's a group dialog
  if (itemDialog.type != 3) {
    QB.chat.muc.join(itemDialog.xmpp_room_jid, function() {
       console.log("Joined dialog: " + dialogId);
    });
    opponentLogin = null;
  } else {
    opponentId = QB.chat.helpers.getRecipientId(itemDialog.occupants_ids, currentUser.id);
    opponentLogin = getUserLoginById(opponentId);
    dialogName = chatName = 'Dialog with ' + opponentLogin;
  }
  $('#tag-text').val(itemDialog.tags)
  // show it
  var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage,dialogSentTime,dialogTag);
  $('#dialogs-list').prepend(dialogHtml);
}

//
function notifyOccupants(dialogOccupants, dialogId, notificationType) {
  dialogOccupants.forEach(function(itemOccupanId, i, arr) {
    if (itemOccupanId != currentUser.id) {
      var msg = {
        type: 'chat',
        extension: {
          notification_type: notificationType,
          dialog_id: dialogId
        }
      };

      QB.chat.sendSystemMessage(itemOccupanId, msg);
    }
  });
}

//
function getAndShowNewDialog(newDialogId) {
  // get the dialog and users
  QB.chat.dialog.list({_id: newDialogId}, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      var newDialog = res.items[0];

      // save dialog to local storage
      var dialogId = newDialog._id;
      dialogs[dialogId] = newDialog;

      // collect the occupants
      var occupantsIds = [];
      newDialog.occupants_ids.map(function(userId) {
        occupantsIds.push(userId);
      });
      updateDialogsUsersStorage(jQuery.unique(occupantsIds), function(){

      });
      console.info('DIALOG LIST newDialog', newDialog);
      joinToNewDialogAndShow(newDialog);
    }
  });
}

function getAndUpdateDialog(updatedDialogId) {
  // get the dialog and users
  //

  var dialogAlreadyExist = dialogs[updatedDialogId] !== null;
  console.log("dialog " + updatedDialogId + " already exist: " + dialogAlreadyExist);

  QB.chat.dialog.list({_id: updatedDialogId}, function(err, res) {
    if (err) {
      console.log(err);
    } else {

      var updatedDialog = res.items[0];

      // update dialog in local storage
      var dialogId = updatedDialog._id;
      dialogs[dialogId] = updatedDialog;

      // collect the occupants
      var occupantsIds = [];
      updatedDialog.occupants_ids.map(function(userId) {
        occupantsIds.push(userId);
      });
      updateDialogsUsersStorage(jQuery.unique(occupantsIds), function(){

      });

      if(!dialogAlreadyExist){
          joinToNewDialogAndShow(updatedDialog);
      }else{
        // just update UI
        $('#'+dialogId+' h4 span').html('');
        $('#'+dialogId+' h4 span').append(updatedDialog.name);
      }
    }
  });
}

// show modal window with dialog's info
function showDialogInfoPopup() {
    if(Object.keys(currentDialog).length !== 0) {
        $('#update_dialog').modal('show');
        $('#update_dialog .progress').hide();

        setupDialogInfoPopup(currentDialog.occupants_ids, currentDialog.name);
    }
}

// show information about the occupants for current dialog
function setupDialogInfoPopup(occupantsIds, name) {

  // show name
  $('#dialog-name-input').val(name);

  // show occupants
  var logins = [];
  occupantsIds.forEach(function(item, index) {
    login = getUserLoginById(item);
    logins[index] = login;
  });
  $('#all_occupants').text('');
  $('#all_occupants').append('<b>Occupants: </b>'+logins.join(', '));

  // show type
  //
  // private
  if (currentDialog.type == 3) {
    $('.dialog-type-info').text('').append('<b>Dialog type: </b>privat chat');
    $('.new-info').hide();
    $('.push').hide();
    $('#push_usersList').hide();
    $('#update_dialog_button').hide();

  // group
  } else {
    $('.dialog-type-info').text('').append('<b>Dialog type: </b>group chat');
    $('.new-info').show();
    $('.push').show();
    $('#push_usersList').show();
    $('#update_dialog_button').show();

    // get users to add to dialog
    retrieveUsersForDialogUpdate(function(users){
      if(users === null || users.length === 0){
        return;
      }

      $.each(users, function(index, item){
          userLogin = getUserLoginById(this.user.id);
        var userHtml = buildUserHtml(userLogin, this.user.id, true);
       
        $('#add_new_occupant').append(userHtml);
      });
    });
    setupScrollHandlerForNewOccupants();
  }
}


function setupScrollHandlerForNewOccupants() {
  // uploading users scroll event
  $('#push_usersList').scroll(function() {
    if  ($('#push_usersList').scrollTop() == $('#add_new_occupant').height() - $('#push_usersList').height()){

      retrieveUsersForDialogUpdate(function(users){
        if(users === null || users.length === 0){
          return;
        }
        $.each(users, function(index, item){
            userLogin = getUserLoginById(this.user.id);
          var userHtml = buildUserHtml(userLogin, this.user.id, false);
          
          $('#add_new_occupant').append(userHtml);
        });
      });

    }
  });
}

// for dialog update
function onDialogUpdate() {
  var pushOccupants  = [];
  $('#add_new_occupant .users_form.active').each(function(index) {
    pushOccupants[index] = $(this).attr('id').slice(0, -4);
  });

  var dialogName  = $('#dialog-name-input').val().trim();

  var toUpdate = {
      name:     dialogName,
      push_all: {occupants_ids: pushOccupants}
    };

  console.log("Updating the dialog with params: " + JSON.stringify(toUpdate));

  QB.chat.dialog.update(currentDialog._id, toUpdate, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log("Dialog updated");

      var dialogId = res._id;
      dialogs[dialogId] = res;

      currentDialog = res;

      $('#'+res._id).remove();

      showOrUpdateDialogInUI(res, true);

      notifyOccupants(res.occupants_ids, dialogId, 2);

      $('#'+res._id).removeClass('inactive').addClass('active');
    }
  });

  $("#update_dialog").modal("hide");
  $('#dialog-name-input').val('');
  $('.users_form').removeClass("active");
}

// delete currend dialog
function onDialogDelete() {
    if (confirm('Are you sure you want remove the dialog?')) {
        QB.chat.dialog.delete(currentDialog._id, function(err, res) {
            if (err) {
                console.error(err);
            } else {
                console.info('Dialog removed');
            
                $('#'+currentDialog._id).remove();
                delete dialogs[currentDialog._id];

                if(Object.keys(dialogs).length > 0){
                    triggerDialog(dialogs[Object.keys(dialogs)[0]]._id);
                } else {
                    $('#messages-list').empty();
                }
            }
        });

        $("#update_dialog").modal("hide");
        $('#update_dialog .progress').show();
    }
}

// Function for searching chats by name and tags
function search(){
   var filters = null;
   var search = $('#search_text').val();
   if(typeof search != 'undefined'|| search != null || search != ''){
       filters = { data: { class_name: "data",tags: {or: search,ctn:search}}, name: {or: search,ctn:search}};
        //filters = { data: {tags: {or: search,ctn: search}, class_name:"data",name: {or: search,ctn:search}}};
        filters = { data: {tags: {ctn: search}, class_name:"data"},name: {or: search,ctn:search}};
    }
  
    QB.chat.dialog.list(filters, function(err, resDialogs) {
      if (err) {
        console.log(err);
      } else {
          $('#dialogs-list').html('');
       for ( var i=0; i<resDialogs.items.length; i++){

            console.log(JSON.stringify(resDialogs.items[i])+'---------------------');
            var itemRes = resDialogs.items[i];
            var dialogId = itemRes._id;
            var dialogName = itemRes.name;
            var dialogType = itemRes.type;
            var dialogLastMessage = itemRes.last_message;
            var dialogUnreadMessagesCount = itemRes.unread_messages_count;
            var dialogSentTime =(itemRes.last_message_date_sent === null)? null:new Date(itemRes.last_message_date_sent*1000);
            var dialogIcon = getDialogIcon(itemRes.type);
            var dialogTag = (itemRes.data === null|| typeof itemRes.data == 'undefined')? '':itemRes.data.tags;
            var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage,dialogSentTime,dialogTag);
            $('#dialogs-list').append(dialogHtml);
                }
            }


    }); 
}
 // Function of hiding/showing identity of logged in user
function hideIdentity(id,dialog_id)
{
    
   if($("#eye-icon"+dialog_id).hasClass("fa fa-eye")){
       // Put the object into storage

// Retrieve the object from storage

      $("#eye-icon"+dialog_id).removeClass("fa fa-eye");
      $("#eye-icon"+dialog_id).addClass("fa fa-eye-slash");
      users[id].user_tags = 1;
      users[id].id = id;
      users[id].dialog_id = dialog_id;
      
      
  } else{
      localStorage.removeItem('testObject');
      $("#eye-icon"+dialog_id).removeClass("fa fa-eye-slash");
      $("#eye-icon"+dialog_id).addClass("fa fa-eye");
      users[id].hide = 0;
      users[id].id = 0;
      users[id].dialog_id = 0;
     
  } 
 
}

function notify(dialogOccupants, dialogId, notificationType) {
  dialogOccupants.forEach(function(itemOccupanId, i, arr) {
    if (itemOccupanId != currentUser.id) {
      var msg = {
        type: 'chat',
        extension: {
          notification_type: notificationType,
          dialog_id: dialogId
        }
      };

      QB.chat.sendSystemMessage(itemOccupanId, msg);
    }
  });
}