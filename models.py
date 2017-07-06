# -*- coding: utf-8 -*-

import json
from django.db import models
from django.contrib.auth.models import User
from sortedm2m.fields import SortedManyToManyField
import django.utils.timezone as timezone

# ImageFolder
class ImageFolder(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=45)
    parent = models.ForeignKey('self', null=True, blank=True)

    def __unicode__(self):
        return u'%s' % (self.name)

# Image
class Image(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=255, null=True, blank=True)
    alt_text = models.CharField(max_length=255, null=True, blank=True)
    size = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    image_url = models.URLField()
    thumbnail_url = models.URLField()
    is_video = models.BooleanField(default=False)
    video_html = models.CharField(max_length=255, null=True, blank=True)
    imagefolder = models.ForeignKey(ImageFolder, null=True, db_index=True)
    create_time = models.DateTimeField(default = timezone.now)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField()
    def __unicode__(self):
        return u'%s' % (self.name)

# Product Category
class ProductCategory(models.Model):
    name = models.CharField(max_length=45)
    order = models.IntegerField()

    def __unicode__(self):
        return u'%s' % (self.name)


# Product
class Product(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, null=True, blank=True)
    thumbnail_url = models.URLField()
    purchase_url = models.URLField(null=True, blank=True)
    spec1_name = models.CharField(max_length=45)
    spec2_name = models.CharField(max_length=45, null=True, blank=True)
    spec1_options = models.CharField(max_length=255)
    spec2_options = models.CharField(max_length=255, null=True, blank=True)
    use_spec2 = models.BooleanField(default=False)
    spec_price = models.TextField(null=True, blank=True)
    body = models.TextField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    low_price = models.PositiveIntegerField(default=100, db_index=True)
    high_price = models.PositiveIntegerField(default=100)
    create_time = models.DateTimeField(default = timezone.now)
    update_time = models.DateTimeField(db_index=True, auto_now=True)
    delete_time = models.DateTimeField(null=True)
    publish_time = models.DateTimeField(null=True)
    create_user = models.ForeignKey(User, related_name='create_user')
    update_user = models.ForeignKey(User, related_name='update_user')
    delete_user = models.ForeignKey(User, related_name='delete_user', null=True)
    publish_user = models.ForeignKey(User, related_name='publish_user', null=True)
    product_category = models.ForeignKey(ProductCategory)
    related = SortedManyToManyField('self', blank=True, symmetrical=False)
    images = SortedManyToManyField(Image, blank=True, symmetrical=False)

    def split_spec1_options(self):
        return self.spec1_options.split(',')

    def split_spec2_options(self):
        return self.spec2_options.split(',')

    def parse_spec_price(self):
        return json.loads(self.spec_price)

    def __unicode__(self):
        return u'%s' % (self.name)
