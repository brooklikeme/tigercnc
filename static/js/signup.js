/**
 * Created by josh on 17/6/16.
 */
$(document).ready(function () {

    var signupMethod = "phone";

    $("#email-input").hide();
    $("#signup-by-email").hide();

    function switchSignupMethod(method) {
        if (method == "email") {
            $("#email-input").show();
            $("#phone-input").hide();
            $("#code-input").hide();
            $("#signup-by-email").hide();
            $("#signup-by-phone").show();
            signupMethod = "email";
        } else {
            $("#email-input").hide();
            $("#phone-input").show();
            $("#code-input").show();
            $("#signup-by-email").show();
            $("#signup-by-phone").hide();
            signupMethod = "phone";
        }
    }

    switchSignupMethod("phone");

    $("#signup-by-email").click(function () {
        switchSignupMethod("email");
    });

    $("#signup-by-phone").click(function () {
        switchSignupMethod("phone");
    });

    function validateInputs() {
        var valid = true;
        if (signupMethod == "phone") {
            // verify phone
            var regPhone = /^1[3|4|5|7|8][0-9]{9}$/;
            if (!regPhone.test($("#id-phone").val())) {
                $("#phone-input").addClass("error");
                valid = false;
            } else {
                $("#phone-input").removeClass("error");
            }
        } else {
            // verify email
            var regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if (!regEmail.test($("#id-email").val())) {
                $("#email-input").addClass("error");
                valid = false;
            } else {
                $("#email-input").removeClass("error");
            }
        }
        // verify password
        var password1 = $("#id-password1").val();
        var password2 = $("#id-password2").val();
        if (password1.length < 6 || password1.length > 16) {
            $("#password1-input").addClass("error");
            valid = false;
        } else {
            $("#password1-input").removeClass("error");
        }
        if (password2 != password1) {
            $("#password2-input").addClass("error");
            valid = false;
        } else {
            $("#password2-input").removeClass("error");
        }
        // verify verify code
        return valid;
    }

    $("#submit-btn").click(function() {
        if (!validateInputs()) {
            return false;
        }
        // update phone or email field
        if (signupMethod == "phone") {
            $("#id-email").val("");
        } else {
            $("#id-phone").val($("id-email").val());
        }
    })

    $("#send-code").click(function() {
        var regPhone = /^1[3|4|5|7|8][0-9]{9}$/;
        if (!regPhone.test($("#id-phone").val())) {
            $("#phone-input").addClass("error");
        } else {
            $("#phone-input").removeClass("error");
            invokeAPI("/api/send_auth_code", {phone: $("#id-phone").val()}, "GET", function(data) {
                var countdown = 60;
                function settime(obj) {
                    if (countdown == 0) {
                        $(obj).removeAttr("disabled");
                        $(obj).text("获取验证码");
                        countdown = 60;
                        return;
                    } else {
                        $(obj).attr("disabled", true);
                        $(obj).text(countdown + "秒后重发");
                        countdown--;
                    }
                    setTimeout(function () {
                        settime($("#send-code"));
                    }, 1000)
                }
                settime($("#send-code"));
            })
        }
    })

})
