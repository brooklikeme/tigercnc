/*
 * Copyright (c) 2013, Divio AG
 * Licensed under BSD
 * http://github.com/aldryn/aldryn-boilerplate-bootstrap3
 */

// #############################################################################
// NAMESPACES
/**
 * @module Cl
 */
// istanbul ignore next
var Cl = window.Cl || {};
/* global outdatedBrowser */

// #############################################################################
// BASE
// istanbul ignore next
(function ($) {
    'use strict';

    // shorthand for invoking jQuery(document).ready
    $(function () {
        // removes noscript form body and adds print-js
        if (window.Cl && window.Cl.Utils) {
            Cl.Utils._document();
        }

        // DOCS: https://github.com/burocratik/outdated-browser
        if (window.outdatedBrowser) {
            outdatedBrowser({
                'languagePath': '',
                'lowerThan': 'boxShadow'
            });
        }
    });

    $('.play-video').on('click', function(e){
        console.log($(this).attr('modal-id'));
        e.preventDefault();
        $( '#' + $(this).attr('modal-id') ).modal();
        $( '#' + $(this).attr('modal-id') ).find('video').get(0).play();
    });

    $('.modal-video').on('hide.bs.modal', function(e) {
        $(this).find("video").get(0).pause();
    });



})(jQuery);
