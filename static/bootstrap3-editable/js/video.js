/**
Vodeo editable input.
Internally value stored as {name: "", is_video: false, video_html: ""}

@class address
@extends abstractinput
@final
@example
<script>
$(function(){
    $('#video').editable({
        url: '/post',
        title: 'Enter city, street and building #',
        value: {
            name: "",
            is_video: false,
            video_html: ""
        }
    });
});
</script>
**/
(function ($) {
    "use strict";

    var Video = function (options) {
        this.init('video', options, Video.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Video, $.fn.editabletypes.abstractinput);

    $.extend(Video.prototype, {
        /**
        Renders input from tpl

        @method render()
        **/
        render: function() {
           this.$input = this.$tpl.find('input');
        },

        /**
        Default method to show value in element. Can be overwritten by display option.

        @method value2html(value, element)
        **/
        value2html: function(value, element) {
            // do nothing
            return;
        },

        /**
        Gets value from element's html

        @method html2value(html)
        **/
        html2value: function(html) {
          return null;
        },

       /**
        Converts value to string.
        It is used in internal comparing (not for sending to server).

        @method value2str(value)
       **/
       value2str: function(value) {
           var str = '';
           if(value) {
               for(var k in value) {
                   str = str + k + ':' + value[k] + ';';
               }
           }
           return str;
       },

       /*
        Converts string to value. Used for reading value from 'data-value' attribute.

        @method str2value(str)
       */
       str2value: function(str) {
           /*
           this is mainly for parsing value defined in data-value attribute.
           If you will always set value by javascript, no need to overwrite it
           */
           return str;
       },

       /**
        Sets value of input.

        @method value2input(value)
        @param {mixed} value
       **/
       value2input: function(value) {
           if(!value) {
             return;
           }
           this.$input.filter('[name="name"]').val(value.name);
           this.$input.filter('[name="is-video"]').val(value.is_video);
           this.$input.filter('[name="video-html"]').val(value.video-html);
       },

       /**
        Returns value of input.

        @method input2value()
       **/
       input2value: function() {
           return {
              name: this.$input.filter('[name="name"]').val(),
              is_video: this.$input.filter('[name="is-video"]').val(),
              video_html: this.$input.filter('[name="video-html"]').val()
           };
       },

        /**
        Activates input: sets focus on the first field.

        @method activate()
       **/
       activate: function() {
            this.$input.filter('[name="name"]').focus();
       },

       /**
        Attaches handler to submit form in case of 'showbuttons=false' mode

        @method autosubmit()
       **/
       autosubmit: function() {
           this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
           });
       }
    });

    Video.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-video"><label><span>City: </span><input type="text" name="city" class="input-small"></label></div>'+
             '<div class="editable-video"><label><span>Street: </span><input type="text" name="street" class="input-small"></label></div>'+
             '<div class="editable-video"><label><span>Building: </span><input type="text" name="building" class="input-mini"></label></div>',

        inputclass: ''
    });

    $.fn.editabletypes.address = Address;

}(window.jQuery));