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

