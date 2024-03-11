from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
# from .models import User
from .models import Table1, Table2

from django.http import JsonResponse
from django.views import View


from django.http import JsonResponse

# def sample_view(request):
#     data = {"message": "Hello from Django!"}
#     return JsonResponse(data)


from django.shortcuts import render, redirect
# from myapp.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.shortcuts import render, redirect


from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib import messages

from django.contrib.auth.decorators import login_required


def register_page(request):
    if request.user.is_authenticated:
        return redirect('system')
    else:

        form = CreateUserForm()
        created_successfully = False
        if request.method == 'POST':
            print(f"GET POST")
            form = CreateUserForm(request.POST)
            print(f"request.POST: {request.POST}")
            if form.is_valid():
                print(f"form.is_valid() : ok")
                # username = form.cleaned_data.get('username')
                # existing_user = User.objects.filter(username=username).exists()
                # if existing_user:
                #     form.add_error('username', 'This username is already taken.')
                # else:
                form.save()  # 保存用户数据
                created_successfully = True
            else:
                created_successfully = False

    # 提取 username 的值
    username_value = form['username'].value()

    # 創建只包含 username 的 context
    #context = {'form': {'username': {'value':username_value}}}
    # fields = {'username': {'value': ""}}
    # fields['username']['value'] = username_value
    # context = {'form': fields}

    context = {'form': form, 'created_successfully': created_successfully}

    #print(f"form.__dict__: {form.__dict__}")
    return render(request, 'register.html', context)

def login_page(request):
    username = ''
    password = ''
    context = {}
    if request.user.is_authenticated:
        return redirect('system')
    else:

        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('system')
            else:
                login_error = '帳號或密碼錯誤'
                context = {'form': {'login': {'error': login_error}}}

        print(f"messages.get_level : {messages.get_level(request)}")
        print(f"messages.get_messages : {messages.get_messages(request)}")
        print(f"messages.get_messages(request).__dict__ : {messages.get_messages(request).__dict__}")
        # for message in messages.get_messages(request):
        #     if message.level == messages.INFO:
        #         print(f"訊息內容: {message}")
        print(f"login username: {username}")
        print(f"login password: {password}")

    return render(request, 'login.html', context)

def logout_page(request):
    logout(request)
    return redirect('login')

from .models import Items
@login_required(login_url='login')
def system_page(request):
    # search_firm = request.GET.get('search_firm')
    #
    # if search_firm:
    #     items = Items.objects.filter(item_firm=search_firm)
    # else:
    #     items = Items.objects.all()

    # items = Items.objects.all()
    # # return render(request, 'system.html',  {'items': items, 'search_firm': search_firm})
    # return render(request, 'system.html', {'items': items})

    # if request.method == 'GET':
    #     search_firm = request.GET.get('search_firm')
    #
    #     # 使用 Django ORM 查询
    #     if search_firm:
    #         items = Items.objects.filter(item_firm=search_firm)
    #     else:
    #         items = Items.objects.all()
    #
    #     return render(request, 'system.html', {'items': items, 'search_firm': search_firm})
    #
    # return render(request, 'system.html')
    if request.method == 'POST':
        # 从 POST 数据中获取新增 item 的信息
        if request.POST.get('action') == 'add-item':
            try:
                item_name = request.POST.get('item_name')
                item_firm = request.POST.get('item_firm')
                item_price = request.POST.get('item_price')
                item_amount = request.POST.get('item_amount')

                print(f"item_name: {item_name}")
                print(f"item_firm: {item_firm}")
                print(f"item_price: {item_price}")
                print(f"item_amount: {item_amount}")

                # 使用 Django ORM 创建新的 item 记录
                new_item = Items(item_name=item_name, item_firm=item_firm, item_price=item_price, item_amount=item_amount)
                new_item.save()

                # 返回成功响应
                print(f"add ok")
                return JsonResponse({'message': 'Item added successfully.'})
            except:
                print(f"add fail")

        elif request.POST.get('action') == 'delete-item':
            try:
                # 处理删除操作
                delete_item_id = request.POST.get('delete_item_id')  # 假设你使用 item_id 进行删除
                delete_item_name = request.POST.get('delete_item_name')  # 假设你使用 item_id 进行删除
                delete_item_firm = request.POST.get('delete_item_firm')  # 假设你使用 item_id 进行删除

                print(f"DELETE method get")
                print(f"delete_item_id: {delete_item_id}")
                print(f"delete_item_name: {delete_item_name}")
                print(f"delete_item_firm: {delete_item_firm}")

                # 使用 Django ORM 查询要删除的 item
                if delete_item_id:
                    item_to_delete = Items.objects.get(item_id=delete_item_id)
                    print(f"delete_item_id item_to_delete: {item_to_delete}")
                    item_to_delete.delete()
                    print(f"delete_item_id OK")
                elif delete_item_name:
                    items_to_delete = Items.objects.filter(item_name=delete_item_name)
                    print(f"delete_item_name items_to_delete: {items_to_delete}")
                    items_to_delete.delete()
                    print(f"delete_item_name OK")
                elif delete_item_firm:
                    items_to_delete = Items.objects.filter(item_firm=delete_item_firm)
                    print(f"delete_item_firm items_to_delete: {items_to_delete}")
                    items_to_delete.delete()
                    print(f"delete_item_firm OK")
                else:
                    raise
                return JsonResponse({'message': 'Item deleted successfully.'})
            except :
                print(f"delete fail")

        elif request.POST.get('action') == 'update-item':
            try:
                update_item_id = request.POST.get('update_item_id')
                update_item_name = request.POST.get('update_item_name')
                update_item_firm = request.POST.get('update_item_firm')
                update_item_price = request.POST.get('update_item_price')
                update_item_amount = request.POST.get('update_item_amount')
                print(f"UPDATE method get")
                print(f"update_item_id: {update_item_id}")
                print(f"update_item_name: {update_item_name}")
                print(f"update_item_firm: {update_item_firm}")
                print(f"update_item_price: {update_item_price}")
                print(f"update_item_amount: {update_item_amount}")

                item_to_update = Items.objects.get(item_id=update_item_id)
                print(f"update_item_id item_to_update: {item_to_update}")
                item_to_update.item_name = update_item_name
                item_to_update.item_firm = update_item_firm
                item_to_update.item_price = update_item_price
                item_to_update.item_amount = update_item_amount
                item_to_update.save()
                return JsonResponse({'message': 'Item updated successfully.'})
            except:
                print(f"update fail")

        # 返回错误响应
        print(f"all error")
        return JsonResponse({'message': 'Invalid request method.'})
        #return JsonResponse({'error': 'Invalid request method.'}, status=400)




    search_firm = request.GET.get('search_firm')

    # 使用 Django ORM 查询
    if search_firm:
        items = Items.objects.filter(item_firm=search_firm)
    else:
        items = Items.objects.all()

    print(f"step 1")
    # 如果是 Ajax 请求，则返回 JSON 数据
    print(f"request: {request.headers.get('x-requested-with')}")
    if 'XMLHttpRequest' in request.headers.get('x-requested-with', ''):
        # 这里是处理 AJAX 请求的代码
        items_data = []
        for item in items:
            items_data.append({
                'item_id': item.item_id,
                'item_name': item.item_name,
                'item_firm': item.item_firm,
                'item_price': item.item_price,
                'item_amount': item.item_amount,
            })
        print(f"items_data:{items_data}")
        return JsonResponse(items_data, safe=False)
    print(f"QQS")
    return render(request, 'system.html', {'items': items, 'search_firm': search_firm})




def systemtest_page(request):
    return render(request, 'systemtest.html')
# def login(request):
#     return render(request, 'login.html')
#
# def system(request):
#     return render(request, 'system.html')
#
# def register(request):
#     return render(request, 'register.html')


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


# def add_user(request):
#     if request.method == 'POST':
#         account = request.POST.get('account')
#         password = request.POST.get('password')
#         user = User(account=account, password=password)
#         user.save()
#         return redirect('user_list')
#
#     return render(request, 'user_list.html')


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