from django.db import models

# Create your models here.
class User(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.CharField(max_length=100)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.account

    class Meta:
        db_table = 'users'  # 在這裡指定你想要的資料表名稱

class Table1(models.Model):
    name = models.CharField(max_length=100)
    # 其他字段...

class Table2(models.Model):
    description = models.TextField()
    # 其他字段...