sendButton.addEventListener('click', function() {
    const passwordValue = passwordInput.value;
    // 执行自定义操作，例如使用 fetch 发送数据到服务器
	alert("OK1");
    fetch('your_django_view_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
      },
      body: JSON.stringify({ password: passwordValue })
    })

    .then(response => response.json())
    .then(data => {
      // 处理响应数据
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
alert("OK1");
  });