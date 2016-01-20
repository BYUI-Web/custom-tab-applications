(function(settings){
	// Don't break on Internet Explorer
	if (!window.console.error) {
		window.console.error = function(){}
	}

	var igx_settings = {
		membership_provider: settings.membership_provider || 'IGXADMembershipProvider',
		root_url: settings.root_url || '',
		cross_domain: !!settings.root_url,
		session_id:''
	};

	window.IGX = {
		User:{},
		RESTful:{}
	};

	function IsLoggedIn() {
		return !!igx_settings.session_id;
	}

	IGX.User.LoggedIn = function() {
		return IsLoggedIn();
	}

	var RESTful_Services = {};

	function create_service_action(name, method_name, method) {
		RESTful_Services[name][method_name] = method;
		IGX.RESTful[name][method_name] = function() {
			RESTful_Services[name][method_name].apply(this, arguments);
		}
	}

	function create_service(name, methods) {
		if (RESTful_Services[name]) {
			console.error('RESTful Service with name "' + name + '" already exists.');
			return;
		}

		RESTful_Services[name] = {};
		IGX.RESTful[name] = {};

		var length = methods.length;
		for (var i = 0; i < length; ++i) {
			{
				var method = methods[i];
				var method_name = /function ([^(]*)/.exec( method+"" )[1];
					console.log(method_name);
				if (RESTful_Services[name][method_name]) {
					console.error('RESTful Service "' + name + '" already has a method named"' + method_name + '".')
				}

				create_service_action(name, method_name, method);
			}
		}
	}

	/***
	* Create MembershipProviders service
	*/
	create_service('MembershipProviders', [
		function Login(username, password, callback) {
			if (typeof username != 'string' || typeof password != 'string' || typeof callback != 'function' || arguments.length < 3) {
				throw 'MembershipProviders.Login takes 3 arguments: [string] username, [string] password, [function] callback.';
			}
			if (IsLoggedIn()) {
				callback({
					code:-1,
					error:'You are already logged in'
				});
				return
			}
			jQuery.ajax({
			    url: igx_settings.root_url + "/REST/MembershipProvidersServices.svc/Login",
			    type: "POST",
		    	crossDomain: igx_settings.cross_domain,
			    data: JSON.stringify({
			        "userName": username,
			        "password": password,
			        "membershipProviderName": igx_settings.membership_provider }),
			    dataType: "json",
			    contentType: "application/json",
			    success: function (response) {
			    	igx_settings.session_id = response.message;
			    	delete response.message;
			    	callback(response);

			    },
			    error: function (xhr, status) {
			        alert(status);
			    }
			});
		},
		function Logout(callback) {
			if (typeof callback != 'function') {
				throw 'MembershipProviders.Logout takes 1 argument: [function] callback.';
			}

			if (!IsLoggedIn()) {
				callback({
					code: -1,
					error: 'You are already logged out'
				});
			}
			igx_settings.session_id = '';
			callback({
				code:0,
				message:'Logged out successfully'
			});
		},
		function ChangePassword(username, oldpassword, newpassword, callback) {
			if (typeof username != 'string' || typeof oldpassword != 'string' || typeof newpassword != 'string' || typeof callback != 'function') {
				throw 'MembershipProviders.ChangePassword takes 4 arguments: [string] username, [string] oldpassword, [string]newpassword [function] callback.';
			}
			if (!IsLoggedIn()) {
				callback({
					code: -1,
					error: 'You must be logged in to change passwords'
				});
				return;
			}
			callback({
				code:-2,
				error:' Unimplemented'
			});

		},
		function CreateUser(username, password, email, callback) {
			if (typeof username != 'string' || typeof password != 'string' || typeof email != 'string' || typeof callback != 'function') {
				throw 'MembershipProviders.CreateUser takes 4 arguments: [string] username, [string] password, [string] email, [function] callback.'
			}
			if (!IsLoggedIn()) {
				callback({
					code: -1,
					error: 'You must be logged in to change passwords'
				});
				return;
			}
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function DeleteUsers(users, callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function GetADQueryDefaults(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function GetIntegratedProvider(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function IsAdDefaultProvider(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function QueryAD(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function ResetPassword(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		}
	]);


	/***
	* Create UserManager Service
	*/

	create_service('UserManager', [
		function CreateNewGroup(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function CreateNewUser(id, name, email, password, callback) {
			if (typeof settings != 'object' || typeof callback != 'function') {
				throw 'UserManager.CreateNewUser takes 5 arguments: [string] id, [string] name, [string] email, [string] password, [function] callback.'
			}

			jQuery.ajax({
			    url: igx_settings.root_url + "/REST/UserManagerServices.svc/CreateNewUser",
			    type: "POST",
		    	crossDomain: igx_settings.cross_domain,
	            headers: {
	                "X-IGXAToken": igx_settings.session_id //send security token as header
	            },
			    data: JSON.stringify({
			        data: {
			        	info: {
			        		newEntry:true,
			        		receiveWorkFlowNotificationMail:false,
			        		integratedMembershipProvider:'',
			        		readLocales:[],
			        		writeLocales:[],
			        		id:'byui\/' + id,
			        		name:name,
			        		email:email,
			        		password:password,
			        	},
			        	groups:[]
			        }
			    }),
			    dataType: "json",
			    contentType: "application/json",
			    success: function (response) {
			    	callback(response);

			    },
			    error: function (xhr, status) {
			        alert(status);
			    }
			});
		},
		function DeleteGroups(group_ids, callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function DeleteUsers(user_ids, callback) {
			if (!(user_ids instanceof Array) || typeof callback != 'function') {
				throw 'UserManager.DeleteUsers takes two arguments: [array of strings] user_ids, [function] callback.';
			}

			var request = new XMLHttpRequest();

			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						callback(request.response);
					}
				}
			};

			// FIXME: This does not handle cross domain requests yet
			request.open('POST', igx_settings.root_url + "/REST/UserManagerServices.svc/DeleteUsers", true);
			request.setRequestHeader('Content-Type', 'application/json');
			request.setRequestHeader('X-IGXAToken', igx_settings.session_id);
			request.responseType = 'json';
			request.send(JSON.stringify({
				data: {
					selectedIds: user_ids
				}
			}));

		},
		function GetGroupRoles(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function GetSettings(callback) {
			if (typeof callback != 'function') {
				throw 'UserManager.GetSettings takes 1 argument: [function] callback';
			}

			if (!IsLoggedIn()) {
				callback({
					code:-1,
					error:'You must be logged in to use UserManager.GetSettings'
				});
				return;
			}

			jQuery.ajax({
			    url: igx_settings.root_url + "/REST/UserManagerServices.svc/GetSettings",
			    type: "POST",
		    	crossDomain: igx_settings.cross_domain,
	            headers: {
	                "X-IGXAToken": igx_settings.session_id //send security token as header
	            },
			    dataType: "json",
			    contentType: "application/json",
			    success: function (response) {
			    	callback(response);

			    },
			    error: function (xhr, status) {
			        alert(status);
			    }
			});
		},
		function GetSingleGroup(group_id, callback) {
			if (typeof group_id != 'string' || typeof callback != 'function') {
				throw 'UserManager.GetSingleGroup takes 2 arguments: [string] group_id, [function] callback';
			}

			if (!IsLoggedIn()) {
				callback({
					code:-1,
					error:'You must be logged in to use UserManager.GetSingleGroup'
				});
				return;
			}

			jQuery.ajax({
			    url: igx_settings.root_url + "/REST/UserManagerServices.svc/GetSingleGroup",
			    type: "POST",
		    	crossDomain: igx_settings.cross_domain,
	            headers: {
	                "X-IGXAToken": igx_settings.session_id //send security token as header
	            },
			    data: JSON.stringify({data:{ 'itemId': group_id}}),
			    dataType: "json",
			    contentType: "application/json",
			    success: function (response) {
			    	callback(response);

			    },
			    error: function (xhr, status) {
			        alert(status);
			    }
			});
		},
		function GetSingleUser(user_id, callback) {
			if (typeof user_id != 'string' || typeof callback != 'function') {
				throw 'UserManager.GetSingleUser takes 2 arguments: [string] user_id, [function] callback';
			}

			if (!IsLoggedIn()) {
				callback({
					code:-1,
					error:'You must be logged in to use UserManager.GetSingleUser'
				});
				return;
			}

			console.log(encodeURI('byui\\' + user_id));
			jQuery.ajax({
			    url: igx_settings.root_url + "/REST/UserManagerServices.svc/GetSingleUser",
			    type: "POST",
		    	crossDomain: igx_settings.cross_domain,
	            headers: {
	                "X-IGXAToken": igx_settings.session_id //send security token as header
	            },
			    data: JSON.stringify({data:{'itemId': encodeURI('byui\\' + user_id)}}),
			    dataType: "json",
			    contentType: "application/json",
			    success: function (response) {
			    	callback(response);

			    },
			    error: function (xhr, status) {
			        alert(status);
			    }
			});
		},
		function GetUsersAndGroupsSimple(callback) {
			if (typeof callback != 'function') {
				throw 'UserManager.GetSingleGroup takes 1 argument: [function] callback';
			}

			if (!IsLoggedIn()) {
				callback({
					code:-1,
					error:'You must be logged in to use UserManager.GetUsersAndGroupsSimple'
				});
				return;
			}

			jQuery.ajax({
			    url: igx_settings.root_url + "/REST/UserManagerServices.svc/GetUsersAndGroupsSimple",
			    type: "POST",
		    	crossDomain: igx_settings.cross_domain,
	            headers: {
	                "X-IGXAToken": igx_settings.session_id //send security token as header
	            },
			    contentType: "application/json",
			    success: function (response) {
			    	callback(response);

			    },
			    error: function (xhr, status) {
			        alert(status);
			    }
			});
		},
		function RemoveGroupRole(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function SaveGroupRole(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function SaveSingleGroup(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function SaveSingleUser(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		},
		function SetSettings(callback) {
			callback({
				code:-2,
				error:' Unimplemented'
			});
		}
	]);
})({
	root_url:'http://igxur/dev-wes'
});

function show_result(result) {
	switch (result.code){
		case 0:
			console.log(result.message);
			break;
		default:
			alert(result.error);
	}
}
