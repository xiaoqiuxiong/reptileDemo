let fs = require('fs');
let cheerio = require('cheerio');
let request = require('request');
let path = require('path');
let i = 1;
let j = 0;
//初始url 
let url = "http://www.silver.org.cn/cjyw/list_p_1.html";
let http = url.includes('https') ? require('https') : require('http');

function startRequest(x) {
    // 采用http模块向服务器发起一次get请求      
    http.get(x, function(res) {
        // 用来存储请求网页的整个html内容
        var html = '';
        var titles = [];
        // 防止中文乱码
        res.setEncoding('utf-8');
        // 监听data事件，每次取一块数据
        res.on('data', function(chunk) {
            html += chunk;
        });
        // 监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function() {
            // 采用cheerio模块解析html
            var $ = cheerio.load(html);
            j = 0;
            savedContent($);
            console.log('抓包页码：' + i);
            i++;
            // 限制请求页数
            if (i <= 1) {
                startRequest(`http://www.silver.org.cn/cjyw/list_p_${i}.html`);
            } else {
                console.log('抓包完成');
            };
        });
    }).on('error', function(err) {
        console.log(err);
    });
}
//保存内容
function savedContent($) {
    var item = $('.lt_col li')[j]
    // 标题
    var x = $(item).find('h2').text().trim();
    // 内容
    var y = $(item).find('p').text().trim();
    // 图片地址
    var z = $(item).find('img').attr('src');
    // 图片文件名
    var o = path.basename(z);
    // 创建文件夹
    fs.mkdir(`./data/${x}`, err => {
        if (!err) {
            // 保存文本
            fs.appendFile(`./data/${x}/index.txt`, `标题：${x}\n内容：${y}`, 'utf-8', err => {
                if (err) {
                    console.log(`****创建txt失败****： ${x}`);
                }
            });
            // 保存图片
            request.head(z, (err, res, body) => {
                if (err) {
                    console.log(`****请求图片失败****： ${x}`);
                }
            });
            // 写图片到本地
            request(z).pipe(fs.createWriteStream(`./data/${x}/${o}`));
            j++;
            if (j <= $('.lt_col li').length - 1) {
                savedContent($)
            }

        }
    })
}

startRequest(url); //主程序开始运行