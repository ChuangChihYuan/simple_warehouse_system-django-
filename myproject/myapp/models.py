from django.db import models
from django import forms
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Items(models.Model):
    item_id = models.AutoField(primary_key=True)
    item_name = models.CharField(max_length=255)
    item_firm = models.CharField(max_length=45)
    item_price = models.IntegerField()
    item_amount = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'items'


class Table1(models.Model):
    name = models.CharField(max_length=100)
    # 其他字段...

class Table2(models.Model):
    description = models.TextField()
    # 其他字段...