#-*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.views import generic
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.response import Response
from tigersite.serializers import *

from .models import *

def store(request):
    return render(request, 'store/store.html')

class ProductDetail(generic.DetailView):
    model = Product
    template_name = 'store/product_detail.html'

class CreateProduct(generic.CreateView):
    model = Product
    template_name = 'store/product_update.html'

class UpdateProduct(generic.UpdateView):
    model = Product
    success_url = "#"
    fields = ['name', 'subtitle', 'product_category', 'purchase_url', 'spec1_name',
              'spec1_options', 'use_spec2', 'spec2_name', 'spec2_options', 'spec_price', 'body', 'images', 'related']
    template_name = 'store/product_update.html'

def ProductEdit(request, pk):
    return render(request, 'store/product_edit.html')


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    Get or set Report Category result
    """
    queryset = ProductCategory.objects.all().order_by('order')
    serializer_class = ProductCategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    Get or set Report result
    """
    queryset = Product.objects.all().order_by('-is_featured', '-update_time')
    serializer_class = ProductSerializer

    def list(self, request):
        sort_field = "-update_time"
        if request.query_params.has_key('sort_field'):
            sort_field = request.query_params.get('sort_field')
        if request.query_params.has_key('product_category_id'):
            queryset = Product.objects.filter(
                product_category_id=request.query_params.get('product_category_id')).order_by('-is_featured', sort_field)
        else:
            queryset = Product.objects.all().order_by('-is_featured', sort_field)
        serializer = ProductListSerializer(queryset, many=True)
        return Response(serializer.data)


class ImageFolderViewSet(viewsets.ModelViewSet):
    """
    Get or set image folder result
    """
    queryset = ImageFolder.objects.all()
    serializer_class = ImageFolderSerializer
    def list(self, request):
        json_result = []
        # add reserved image folders
        all_count = Image.objects.all().count()
        image_count = Image.objects.exclude(is_video=True).count()
        video_count = Image.objects.filter(is_video=True).count()
        nofolder_count = Image.objects.filter(imagefolder_id__isnull=True).count()
        json_result.append({'id': -1, 'name': u'全部', 'images': all_count, 'reserved': True})
        json_result.append({'id': -2, 'name': u'全部图片', 'images': image_count, 'reserved': True})
        json_result.append({'id': -3, 'name': u'全部视频', 'images': video_count, 'reserved': True})
        json_result.append({'id': -4, 'name': u'未分目录', 'images': nofolder_count, 'reserved': True})

        # add real image folders
        db_result = ImageFolder.objects.all()
        for imagefolder in db_result:
            json_result.append({'id': imagefolder.id, 'name': imagefolder.name, 'images': imagefolder.image_set.count(), 'reserved': False})

        return Response(json_result)

class ImageViewSet(viewsets.ModelViewSet):
    """
    Get or set Report plot result
    """
    queryset = Image.objects.all().order_by('-update_time')
    serializer_class = ImageSerializer

    def list(self, request):
        rows = 12
        if request.query_params.has_key('rows'):
            rows = request.query_params.get('rows').strip()

        paginator = PageNumberPagination()
        paginator.page_size = rows
        sort_field = "-update_time"
        if request.query_params.has_key('sort'):
            sort_field = request.query_params.get('sort')
        queryset = Image.objects.all().order_by(sort_field)

        if request.query_params.has_key('imagefolder_id'):
            if request.query_params.get('imagefolder_id') == '-1':
                queryset = queryset
            elif request.query_params.get('imagefolder_id') == '-2':
                queryset = queryset.exclude(is_video=True)
            elif request.query_params.get('imagefolder_id') == '-3':
                queryset = queryset.filter(is_video=True)
            elif request.query_params.get('imagefolder_id') == '-4':
                queryset = queryset.filter(imagefolder_id__isnull=True)
            else:
                queryset = queryset.filter(imagefolder_id=request.query_params.get('imagefolder_id').strip())

        result_page = paginator.paginate_queryset(queryset, request)
        serializer = ImageSerializer(result_page, many=True)

        return_result = paginator.get_paginated_response(serializer.data)
        if request.query_params.has_key('page'):
            return_result.data['page'] = request.query_params.get('page')
        else:
            return_result.data['page'] = 1

        return return_result

