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
from django.utils.timezone import utc
from tigersite.serializers import *
from random import randint
from aliyunsdkdysmsapi.request.v20170525 import SendSmsRequest
from aliyunsdkdysmsapi.request.v20170525 import QuerySendDetailsRequest
from aliyunsdkcore.client import AcsClient
import json
import uuid


from .models import *

REGION = "cn-hangzhou"
ACCESS_KEY_ID = "oPwvebCGRZPCiwJ6"
ACCESS_KEY_SECRET = "NeULxDy1TW8LJ73FB4P6rQb2MzPlPZ"

acs_client = AcsClient(ACCESS_KEY_ID, ACCESS_KEY_SECRET, REGION)


def send_sms(business_id, phone_numbers, sign_name, template_code, template_param=None):
    smsRequest = SendSmsRequest.SendSmsRequest()
    # 申请的短信模板编码,必填
    smsRequest.set_TemplateCode(template_code)

    # 短信模板变量参数
    if template_param is not None:
        smsRequest.set_TemplateParam(template_param)

    # 设置业务请求流水号，必填。
    smsRequest.set_OutId(business_id)

    # 短信签名
    smsRequest.set_SignName(sign_name);

    # 短信发送的号码列表，必填。
    smsRequest.set_PhoneNumbers(phone_numbers)

    # 调用短信发送接口，返回json
    smsResponse = acs_client.do_action_with_exception(smsRequest)

    # TODO 业务处理

    return smsResponse


def query_send_detail(biz_id, phone_number, page_size, current_page, send_date):
    queryRequest = QuerySendDetailsRequest.QuerySendDetailsRequest()
    # 查询的手机号码
    queryRequest.set_PhoneNumber(phone_number)
    # 可选 - 流水号
    queryRequest.set_BizId(biz_id)
    # 必填 - 发送日期 支持30天内记录查询，格式yyyyMMdd
    queryRequest.set_SendDate(send_date)
    # 必填-当前页码从1开始计数
    queryRequest.set_CurrentPage(current_page)
    # 必填-页大小
    queryRequest.set_PageSize(page_size)

    # 调用短信记录查询接口，返回json
    queryResponse = acs_client.do_action_with_exception(queryRequest)

    # TODO 业务处理

    return queryResponse


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


class SendAuthCodeViewSet(viewsets.ViewSet):
    """
    send auto code
    """
    def list(self, request):
        json_result = {'result', 'ok'}
        if not request.query_params.has_key('phone'):
            return Response({'result', 'error: no phone num'})
        phone = request.query_params.get('phone')
        # can not send auth code in 60 s
        auth_codes = AuthCode.objects.filter(phone_num=phone).order_by('-create_time')
        if len(auth_codes) > 0:
            now = timezone.now()
            timediff = now - auth_codes[0].create_time
            if (timediff.total_seconds() < 60):
                return Response({'result', 'error: repeat'})

        #send auth code
        auth_code = randint(100000, 999999)

        __business_id = uuid.uuid1()

        params = "{\"code\":\"" + str(auth_code) + "\",\"product\":\"云通信\"}"

        send_result = json.loads(send_sms(__business_id, phone, "TigerCNC官网", "SMS_82900016", params))
        print '######'
        print send_result
        print '######'

        sms_log = SmsLog(phone_num = phone, \
                         request_id = send_result['RequestId'], \
                         business_id = send_result['BizId'],
                         code = send_result['Code'], \
                         message = send_result['Message'])
        sms_log.save();

        if send_result['Code'] == 'OK':
            # save auth code
            auth_code = AuthCode(sms_log = sms_log, \
                                 auth_code = auth_code, \
                                 phone_num = phone)
            auth_code.save()

        else:
            return Response({'result', 'error: send sms error'})

        return Response(json_result)
