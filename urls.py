# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.conf.urls import include, url, patterns
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.static import serve
from . import views

admin.autodiscover()

urlpatterns = [
    # products: /product/
    url(r'^products/$', views.ProductList, name='product_list'),
    url(r'^products/(?P<pk>[0-9]+)/$', views.ProductDetail, name='product_detail'),
    url(r'^product_edit/(?P<pk>[0-9]+)/$', views.ProductEdit, name='product_edit'),

    url(r'^sitemap\.xml$', sitemap,
        {'sitemaps': {'cmspages': CMSSitemap}}),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^avatar/', include('avatar.urls')),
    url(r'^profile/', include('userprofiles.urls')),
    url(r'^gallery/', include('imagestore.urls', namespace='imagestore')),
]

urlpatterns += i18n_patterns(
#urlpatterns += patterns(
    url(r'^admin/', include(admin.site.urls)),  # NOQA
    url(r'^', include('cms.urls')),
)

# This is only needed when using runserver.
if settings.DEBUG:
    urlpatterns = [
        url(r'^media/(?P<path>.*)$', serve,
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        ] + staticfiles_urlpatterns() + urlpatterns
