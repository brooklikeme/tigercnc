from rest_framework import serializers
from tigersite.models import *

####### Config #######
class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name', 'subtitle', 'is_featured', 'low_price', 'thumbnail_url')

class ImageFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageFolder
        fields = ('id', 'name', 'user', 'parent')

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'

