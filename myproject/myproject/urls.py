"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from myapp import views

from django.conf import settings
from django.urls import re_path
from django.views.static import serve
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path, include


from django.urls import path
from django.contrib.auth import views as auth_views




urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.login_page, name='login'),
    path('logout/', views.logout_page, name='logout'),
    path('register/', views.register_page, name='register'),

    path('system/', views.system_page, name='system'),



    path('systemtest/', views.systemtest_page, name='systemtest'),





    path('', views.hello_yuan),
    path('hello/', views.hello_yuan),
    path('users/', views.user_list, name='user_list'),
    # path('add_user/', views.add_user, name='add_user'),
    path('test/', views.IndexView.as_view(), name='index'),
    path('test_1/', views.test),
    path('sample/', views.sample_view, name='sample'),

    # 倉管系統


    # 靜態資料
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# urlpatterns = [
#     path('admin/', admin.site.urls),
# ]
