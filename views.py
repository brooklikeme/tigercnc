#-*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.views import generic
from django.http import HttpResponse

from .models import *

def ProductList(request):
    return render(request, 'store/store.html')

def ProductDetail(request, pk):
    return render(request, 'store/product_detail.html')

def ProductEdit(request, pk):
    return render(request, 'store/product_edit.html')
