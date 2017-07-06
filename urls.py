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
from tigersite.views import *
from rest_framework import routers

admin.autodiscover()

router = routers.DefaultRouter()
router.register(r'product_categorys', ProductCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'imagefolders', ImageFolderViewSet)
router.register(r'images', ImageViewSet)

urlpatterns = [
    # products: /product/
    url(r'^items/$', store, name='store'),
    url(r'^items/(?P<pk>[0-9]+)/$', ProductDetail.as_view(), name='product_detail'),
    url(r'^update_item/$', CreateProduct.as_view(), name='create_product'),
    url(r'^update_item/(?P<pk>[0-9]+)/$', UpdateProduct.as_view(), name='update_product'),

    url(r'^sitemap\.xml$', sitemap,
        {'sitemaps': {'cmspages': CMSSitemap}}),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^avatar/', include('avatar.urls')),
    url(r'^profile/', include('userprofiles.urls')),
    url(r'^gallery/', include('imagestore.urls', namespace='imagestore')),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
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
