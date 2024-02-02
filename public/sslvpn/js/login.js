/* SPDX-License-Identifier: LicenseRef-Fortinet */
var my_xmlhttp = null;
var buf_request_in_progress = false;
var token_push_request_in_progress = false;
var famreqid = "";
var pol_id = "";
var grp = "";
var pass_renew="";
var peer="";

var elm_ftm_push_enabled = document.getElementById("ftm_push_enabled");
var ftm_pushed_enabled  = elm_ftm_push_enabled && elm_ftm_push_enabled.value;

//Copy from Util.js ,then we can remove Util.js from login.html and
//check the access permision when user access Util.js.
function get_xmlhttp() {
    var xmlhttp = null;

    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch(e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch(oc) {
            xmlhttp = null;
        }
    }

    if (!xmlhttp && typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
    }

    return xmlhttp;
}

// handle_buffer_ready - function to handle the Ajax response. The first
// character of the response is the status code (0 is failure, 1 is success,
// and 2 is a special case for the 1 minute lockout). If success, the
// remainder of the string contains a JS function to redirect to the main page.
function handle_buffer_ready()
{
    // Check & reset semaphore.
    if (!buf_request_in_progress)
            return;

    buf_request_in_progress = false;
    token_push_request_in_progress = false;

    var retval = my_xmlhttp.responseText;

    my_xmlhttp = null;

    if (retval.length == 0) {
        return;
    }

    var argv = retval.split(',');
    var auth_ret = 0;
    var redir = "";
    var err="";
    var action_url = "";
    var magic_val="";
    var grpid="";
    var pid="";
    var chal_msg="";
    var is_chal_rsp = "";
    var allow_cancel = 0;
    for (var i = 0; i < argv.length; i++) {
        if (argv[i].indexOf("ret=") == 0) {
            auth_ret = parseInt(argv[i].substring(4));
	} else if (argv[i].indexOf("redir=") == 0) {
            redir = argv[i].substring(6);
	} else if (argv[i].indexOf("err=") == 0) {
            err = argv[i].substring(4);
	} else if (argv[i].indexOf("reqid=") == 0){
            famreqid = argv[i].substring(6);
	} else if (argv[i].indexOf("polid=") == 0){
            pol_id = argv[i].substring(6);
	} else if (argv[i].indexOf("grp=") == 0){
            grp = argv[i].substring(4);
	} else if (argv[i].indexOf("tokeninfo=") == 0){
            tokeninfo = argv[i].substring(10);
	} else if (argv[i].indexOf("actionurl=") == 0){
            action_url=argv[i].substring(10);
	} else if (argv[i].indexOf("magic=") == 0){
            magic_val=argv[i].substring(6);
	} else if (argv[i].indexOf("grpid=") == 0){
            grpid=argv[i].substring(6);
	} else if (argv[i].indexOf("pid=") == 0){
            pid=argv[i].substring(4);
	} else if (argv[i].indexOf("is_chal_rsp=") == 0){
            is_chal_rsp=argv[i].substring(12);
	} else if (argv[i].indexOf("pass_renew=") == 0){
            pass_renew=argv[i].substring(11);
	} else if (argv[i].indexOf("allow_cancel=") == 0){
            allow_cancel=parseInt(argv[i].substring(13));
	} else if (argv[i].indexOf("chal_msg=") == 0) {
            index=retval.indexOf("chal_msg=");
            if (index)
                chal_msg=retval.substring(index + 9);
        } else if (argv[i].indexOf("peer=") == 0){
            peer=argv[i].substring(5);
	}
    }

    try {
        document.getElementById("token_msg").style.display = "none";
    } catch (e) { }

    if (auth_ret != 0) { // hide err_str on the top of the dialog
        var elm_err_str = document.getElementById("err_str");
        if (elm_err_str)
            elm_err_str.style.display = "none";
    }
    if (auth_ret != 6) {
	try {
	    document.getElementById("credential2").disabled = true;
            document.getElementById("credential2").style.display = "none";
            document.getElementById("credential3").style.display = "none";
	} catch (e) { } // ignore error if no such elements exist
    }
    switch (auth_ret) {
    case 0: // login failed
    case 1: // login succeeded
        document.location = redir;
        return;
    case 2: // need FortiToken code
        document.getElementById("username").style.display = "";
        document.getElementById("credential").style.display = "";
        document.getElementById("username").disabled = true;
        document.getElementById("credential").disabled = true;
        document.getElementById("code").value = "";
        document.getElementById("code").style.display = "";
        document.getElementById("code").focus();
        if ((tokeninfo == "ftm_push" || tokeninfo == "remote_token_auth") && ftm_pushed_enabled && !token_push_request_in_progress) {
            // reuse polid parameter to transmit fac id
            try_ftm_push(pol_id, (tokeninfo == "ftm_push"));
        }
        break;
    case 3: // need email code
        document.getElementById("username").disabled = true;
        document.getElementById("credential").disabled = true;
        document.getElementById("token_msg").style.display = "";
        document.getElementById("token_label").innerHTML = "An email message containing a Token Code will be sent to &lt;" +
                                                            decodeURIComponent(tokeninfo) + "&gt; in a moment.";
        document.getElementById("code").placeholder = "Email Code";
        document.getElementById("code").value = "";
        document.getElementById("code").style.display = "";
        document.getElementById("code").focus();
        break;
    case 4: // need SMS code
        document.getElementById("username").disabled = true;
        document.getElementById("credential").disabled = true;
        document.getElementById("token_msg").style.display = "";
        document.getElementById("token_label").innerHTML = "An SMS message containing a Token Code will be sent to &lt;" +
                                                            decodeURIComponent(tokeninfo) + "&gt; in a moment.";
        document.getElementById("code").placeholder = "SMS Code";
        document.getElementById("code").value = "";
        document.getElementById("code").style.display = "";
        document.getElementById("code").focus();
        break;
    case 5: // FotiToken drifted, require next code
        document.getElementById("code").disabled = true;
        document.getElementById("driftmsg").style.display = "";
        document.getElementById("code2").value = "";
        document.getElementById("code2").style.display = "";
        document.getElementById("code2").focus();
        break;
    case 6: // challenge
        document.getElementById("username").style.display = "none";
        document.getElementById("credential").style.display = "none";
        document.getElementById("code").style.display = "none";
        document.getElementById("credential2").disabled = false;
        document.getElementById("credential2").value = "";
        document.getElementById("credential3").value = "";
        document.getElementById("token_msg").style.display = "";
        document.getElementById("token_label").innerHTML = chal_msg;
        if (pass_renew == "1") {
            document.getElementById("credential2").placeholder = "New Password";
            document.getElementById("credential3").placeholder = "Confirm New Password";
            document.getElementById("credential3").style.display = "";
            if (allow_cancel == 1)
                document.getElementById("skip_button").style.display = "block";
        } else {
            document.getElementById("credential2").placeholder = "Answer";
            document.getElementById("credential3").style.display = "none";
        }
        document.getElementById("credential2").style.display = "";
        break;
    default:
    }
    if (magic_val) {
        document.getElementById("magic_id").disabled = false;
        document.getElementById("reqid_id").disabled = false;
        document.getElementById("grpid_id").disabled = false;
        document.getElementById("magic_id").value = magic_val;
        document.getElementById("reqid_id").value = famreqid + "," + pol_id;
        document.getElementById("grpid_id").value = grpid + "," + pid + "," + is_chal_rsp;
    }
}

function queryStringToObject(queryString) {
    var obj = {};
    var pairs = queryString.split('&');
    for (var i in pairs) {
        if (pairs[i] === "") continue;
        var pair = pairs[i].split('=');
        obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return obj;
}

// login_send_request - send the login request as an Ajax message.
function login_send_request(str_url, str_body)
{
    my_xmlhttp = get_xmlhttp();
    my_xmlhttp.onreadystatechange = handle_buffer_statechange;

    my_xmlhttp.open("POST", str_url, true);
    my_xmlhttp.setRequestHeader("Pragma", "no-cache");
    my_xmlhttp.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    my_xmlhttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
    my_xmlhttp.setRequestHeader("Content-Type", "application/json");

    const dataObject = queryStringToObject(str_body);
    const data = JSON.stringify(dataObject);

    my_xmlhttp.send(data);

    document.getElementById("magic_id").value = "";
}

// handle_buffer_statechange - onreadystatechange callback for the Ajax request.
function handle_buffer_statechange(ev)
{
    if (my_xmlhttp.readyState == 4) // 4 == complete
        handle_buffer_ready();
}

function try_login()
{
    if (buf_request_in_progress && !token_push_request_in_progress) {
        throw("Avoid sending conflicting request\n");
        return;
    }

    if (token_push_request_in_progress) {
        abort_current_request();
    }

    buf_request_in_progress = true;

    var elm_username = document.getElementById("username");
    var elm_realm = document.getElementById("realm_id");
    var xstr = "ajax=1&username=" + encodeURIComponent(elm_username.value);
    var elm_credential = document.getElementById("credential");
    var elm_credential2 = null;
    xstr += "&realm=" + encodeURIComponent(elm_realm.value);

    var chal = document.getElementById("magic_id");
    if (document.getElementById("code").style.display == "none") {
        if (chal && chal.value != "") {
            if (pass_renew == "1") {
                elm_credential = document.getElementById("credential2");
                var elm_credential_confirm = document.getElementById("credential3");
                if (elm_credential.value != elm_credential_confirm.value) {
                    buf_request_in_progress = false;
                    alert("The passwords do not match!");
                    return;
                }
            } else {
                elm_credential2 = document.getElementById("credential2");
            }
        }
    } else {
        xstr += "&code=" + document.getElementById("code").value +
                "&code2=" + document.getElementById("code2").value +
                "&polid=" + pol_id + "&grp=" + grp;
    }

    if (chal && chal.value != "") {
	xstr += "&magic=" + chal.value+
		"&reqid="+document.getElementById("reqid_id").value+
		"&grpid="+document.getElementById("grpid_id").value;
    }

    if (peer) {
        xstr += "&peer=" + peer;
    }

    xstr += "&credential=" + encodeURIComponent(elm_credential.value);
    if (elm_credential2) {
        xstr += "&credential2=" + encodeURIComponent(elm_credential2.value);
    }
    try {
        login_send_request("/remote/logincheck", xstr);
    } catch (e) {
        buf_request_in_progress = false;
        token_push_request_in_progress = false;
        abort_current_request();
    }
}

function try_skip()
{
    if (buf_request_in_progress && !token_push_request_in_progress) {
        throw("Avoid sending conflicting request\n");
        return;
    }

    if (token_push_request_in_progress) {
        abort_current_request();
    }

    buf_request_in_progress = true;
    var elm_username = document.getElementById("username");
    var elm_realm = document.getElementById("realm_id");
    var xstr = "ajax=1&username=" + encodeURIComponent(elm_username.value);
    var elm_credential = document.getElementById("credential");
    var chal = document.getElementById("magic_id");
    xstr += "&magic=" + chal.value;
    xstr += "&realm=" + encodeURIComponent(elm_realm.value);
    xstr += "&credential=" + encodeURIComponent(elm_credential.value);
    xstr += "&reqid=" + famreqid;
    xstr += "&grpid=" + document.getElementById("grpid_id").value;
    xstr += "&skip=1";
    if (peer) {
        xstr += "&peer=" + peer;
    }

    try {
        login_send_request("/remote/logincheck", xstr);
    } catch (e) {
        token_push_request_in_progress = false;
        abort_current_request();
    }
}

function try_ftm_push(fac_id, is_fmt)
{
    if (buf_request_in_progress) {
        throw("Avoid sending conflicting request\n");
        return;
    }

    buf_request_in_progress = true;
    token_push_request_in_progress = true;

    var elm_username = document.getElementById("username");
    var elm_realm = document.getElementById("realm_id");
    var xstr = "ajax=1&username=" + encodeURIComponent(elm_username.value);
    var elm_credential = document.getElementById("credential");
    var elm_magic = document.getElementById("magic_id");
    xstr += "&realm=" + encodeURIComponent(elm_realm.value);
    xstr += "&credential=" + encodeURIComponent(elm_credential.value);
    xstr += "&magic=" +  elm_magic.value;
    xstr += "&ftmpush=" + (+is_fmt);
    if (typeof fac_id != "undefined") {
        xstr += "&polid=" + fac_id;
    }
    xstr += "&reqid=" + famreqid;
    xstr += "&grp=" + grp;
    if (peer) {
        xstr += "&peer=" + peer;
    }

    try {
        login_send_request("/remote/logincheck", xstr);
    } catch (e) {
        token_push_request_in_progress = false;
        abort_current_request();
    }
}

// login_get_cmd_kbd_event and login_crack_kbd_event are the copies of
// get_cmd_kbd_event and crack_kbd_event from jsconsole.js
// login_get_cmd_kbd_event - same as get_cons_kbd_event, but uses different document object
function login_get_cmd_kbd_event(evt_p)
{
    if (evt_p)
        return evt_p;
    evt = window.event;
    if (evt)
        return evt;
    return null;
}

// login_crack_kbd_event - Returns the keypress code associated with the event.
function login_crack_kbd_event(evt)
{
    if (evt.which)
        return evt.which;
    else if (evt.keyCode)
        return evt.keyCode;
    else if (evt.charCode)
        return evt.charCode;
    return 0;
}

function key_pressdown(evt_p)
{
    try
    {
        var evt = login_get_cmd_kbd_event(evt_p);
        if(evt == null) return;
        var key_code = login_crack_kbd_event(evt);
        if(key_code == 0) return;
        // CR: Click login button
        if (key_code == 13) {
            var elm_button = document.getElementById("login_button");
            elm_button.click();
            return false;
        }
    }
    catch (e)
    {
    }

    return true;
}

function abort_current_request() {
    my_xmlhttp.abort();
    delete my_xmlhttp;
    my_xmlhttp = null;
}

function launchFortiClient() {
    var fortiClientIFrame = document.querySelector('#launch-forticlient-iframe');
    fortiClientIFrame.src = (
        'forticlient://' + '?' +
        'hostname=' +  encodeURIComponent(window.location.hostname) + '&' +
        (window.location.port ? 'port=' + encodeURIComponent(window.location.port) : '')
    );
}

function launchSamlLogin() {
    var elm_realm = document.getElementById("realm_id");
    url = "/remote/saml/start" + "?realm=" + encodeURIComponent(elm_realm.value);
    window.location = elm_realm ? url : "/remote/saml/start";
}
document.addEventListener('DOMContentLoaded', function() {
    if (navigator.platform.indexOf('Linux') !== -1) {
        var fortiClientButton = document.querySelector('#launch-forticlient-button');
        fortiClientButton.style.display = 'none';
    }
    if (document.title.trim() == 'Please Login') {
        document.title = fgt_lang.sslvpn_login_login;
    }
    var fortiClient_but = document.getElementById("launch-forticlient-button");
    if (fortiClient_but && fortiClient_but.lastElementChild.innerHTML.trim() == "Launch FortiClient") {
        fortiClient_but.innerHTML = fgt_lang["sslvpn_portal::Launch FortiClient"];
    }
    var elm_saml_login = document.getElementById("saml_login_id");
    if (elm_saml_login && elm_saml_login.value != "0") {
	var e_saml_bn = document.getElementById("saml-login-bn");
	if (e_saml_bn) {
	    e_saml_bn.innerHTML = fgt_lang["sslvpn-saml_login"];
	    e_saml_bn.style.display = "";
	}
    }
    var elm_login_bn = document.getElementById("login_button");
    if (elm_login_bn && elm_login_bn.innerHTML.trim() == "Login") {
        elm_login_bn.innerHTML = fgt_lang["sslvpn_login_login_b"];
    }
    var elm_usrname_f = document.getElementById("username");
    elm_usrname_f.placeholder = fgt_lang["Username"];
    var elm_passwd_f = document.getElementById("credential");
    elm_passwd_f.placeholder = fgt_lang["Password"];
    var elm_login_title = document.getElementById("login-login");
    if (elm_login_title && elm_login_title.innerHTML.trim() == "Please Login")
	elm_login_title.innerHTML = fgt_lang["sslvpn_login_login"];
});
