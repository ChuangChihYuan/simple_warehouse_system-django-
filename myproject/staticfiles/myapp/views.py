from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from .models import User
from .models import Table1, Table2

from django.http import JsonResponse
from django.views import View


from django.http import JsonResponse

# def sample_view(request):
#     data = {"message": "Hello from Django!"}
#     return JsonResponse(data)

#倉管系統
def login(request):
    return render(request, 'login.html')

def register(request):
    return render(request, 'register.html')


def sample_view(request):
    return render(request, 'your_template_name.html')


def test(request):
    context = {
        'greeting': 'Hello, Yuanq1234'
    }
    return render(request, 'test.html', context)

def hello_yuan(request):
    context = {
        'greeting': 'Hello, Yuanq1234'
    }
    return render(request, 'hello.html', context)

def user_list(request):
    users = User.objects.all()
    return render(request, 'user_list.html', {'users': users})


def add_user(request):
    if request.method == 'POST':
        account = request.POST.get('account')
        password = request.POST.get('password')
        user = User(account=account, password=password)
        user.save()
        return redirect('user_list')

    return render(request, 'user_list.html')


class IndexView(View):
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        table1_data = Table1.objects.all()
        table2_data = Table2.objects.all()
        return render(request, self.template_name, {'table1_data': table1_data, 'table2_data': table2_data})

    def post(self, request, *args, **kwargs):
        table_to_update = request.POST.get('table_to_update')
        new_data = request.POST.get('new_data')
        data = {}

        if table_to_update == 'table1':
            if new_data:
                Table1.objects.create(name=new_data)
            table1_data = ", ".join(str(item.name) for item in Table1.objects.all())
            data['table_data'] = table1_data

        elif table_to_update == 'table2':
            if new_data:
                Table2.objects.create(description=new_data)
            table2_data = ", ".join(str(item.description) for item in Table2.objects.all())
            data['table_data'] = table2_data

        return JsonResponse(data)