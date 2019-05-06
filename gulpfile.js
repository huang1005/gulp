"use strict";
var gulp = require("gulp"),
    del = require("del"),
    rev = require('gulp-rev'),
    fileinclude = require("gulp-file-include"),
    browserSync = require("browser-sync").create(),
    autoPrefix = require("gulp-autoprefixer"),
    sourcemaps = require("gulp-sourcemaps"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    revCollector = require('gulp-rev-collector'), //- 路径替换
    minifyCss = require('gulp-minify-css'),
    concat = require("gulp-concat"), //合并js代码
    rename = require('gulp-rename'),
    uglify = require("gulp-uglify"), //压缩js代码
    htmlmin = require("gulp-htmlmin"),
    watch = require("gulp-watch"),
    filter = require("gulp-filter"),
    batch = require("gulp-batch"),
    stylus = require("gulp-stylus");
// 获取 gulp-imagemin 模块
var imagemin = require('gulp-imagemin');
var proxy = require('http-proxy-middleware')
var middleware = proxy('/com.dadoudou.wjx', {
    target: 'http://47.97.205.84:9080',
    changeOrigin: true
})
const browserArr = [
    "ie >= 9",
    "ie_mob >= 3",
    "ff >= 8",
    "chrome >= 10",
    "safari >= 4",
    "opera >= 3",
    "ios >= 4",
    "android >= 2.3",
    "bb >= 6"
];
let jsArr = ["./js/cornerstone.min.js",
    "./js/cornerstoneMath.min.js",
    "./js/cornerstoneTools.min.js",
    "./js/hammer.js",
    "./js/dicomParser.min.js",
    "./js/jquery-3.3.1.min.js",
    "./js/amazeui.min.js",
    "./js/main.js"
];
// 清除 dist 文件夹
gulp.task("clean", function() {
    return del.sync([
        "./dist/js.*js",
        "./dist/css/*.css",
        "./dist/html/*.html",
        "./dist/*.html"
    ]);
});
// 清除 dist 文件夹
gulp.task("cleanhtml", function() {
    return del.sync(["./dist/**/*.html"]);
});
// 清除 dist 文件夹
gulp.task("cleancss", function() {
    return del.sync(["./dist/css/*.css"]);
});
// 清除 dist 文件夹
gulp.task("cleanfonts", function() {
    return del.sync(["./dist/font/"]);
});
// 清除 dist 文件夹
gulp.task("cleanjs", function() {
    return del.sync(["./dist/js.*js"]);
});
// 清除 dist iamges文件夹
gulp.task("cleanimages", function(cb) {
    del(["./dist/images/**"]).then(() => {
        console.log("has clear");
        cb();
    });
});

gulp.task('concat', ["cleancss"], function() { //- 创建一个名为 concat 的 task
    gulp.src(['./css/*.css']) //- 需要处理的css文件，放到一个字符串数组里
        //.pipe(concat('wrap.min.css'))                         //- 合并后的文件名
        .pipe(minifyCss()) //- 压缩处理成一行
        .pipe(rev()) //- 文件名加MD5后缀
        .pipe(gulp.dest('./dist/css')) //- 输出文件本地
        .pipe(rev.manifest()) //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev')); //- 将 rev-manifest.json 保存到 rev 目录内
});
// gulp.task('js', ['cleanjs'], function() { //- 创建一个名为 concat 的 task
//     gulp.src(['./js/*.js']) //- 需要处理的js文件，放到一个字符串数组里
//         .pipe(jshint()) //- 压缩处理成一行
//         .pipe(uglify())
//         .pipe(rev()) //- 文件名加MD5后缀
//         .pipe(gulp.dest('.dist/js')) //- 输出文件本地
//         .pipe(rev.manifest()) //- 生成一个rev-manifest.json
//         .pipe(gulp.dest('./rev')); //- 将 rev-manifest.json 保存到 rev 目录内
// });
gulp.task('rev', function() {
    gulp.src(['./rev/*.json', "./html/**/*.html", "!./html/device.html", "!./html/template/*.html"]) //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(fileinclude())
        .pipe(revCollector()) //- 执行文件内css名的替换
        .pipe(gulp.dest("./dist/")) //- 替换后的文件输出的目录
});

// stylus
gulp.task("testStylus", ["cleancss"], function() {
    gulp
        .src("./stylus/main.styl")
        .pipe(watch("stylus/*.syl"))
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(autoPrefix({ browsers: browserArr, cascade: true, remove: true }))
        //.pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./css"));
});


// html 整合
gulp.task("html", ["cleanhtml"], function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    return (
        gulp
        .src(["./html/**/*.html", "!./html/device.html", "!./html/template/*.html"])
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(fileinclude())
        // .pipe(htmlmin(options))
        .pipe(gulp.dest("./dist/"))
    );
});
// gulp.task("copy", function() {
//   return gulp.src("./images/**/*").pipe(gulp.dest("./dist/images"));
// });
gulp.task("copyothercss", ["cleancss"], function() {
    return gulp.src(["./css/*"]).pipe(gulp.dest("./dist/css"));
});
gulp.task("copyotherfont", ["cleanfonts"], function() {
    return gulp.src(["./fonts/*"]).pipe(gulp.dest("./dist/fonts"));
});
gulp.task("copyimages", ["cleanimages"], function() {
    return gulp.src(["./images/**/*"]).pipe(gulp.dest("./dist/images"));
});
gulp.task("purecopyimages", function() {
    return gulp
        .src(["./images/**/*"])
        .pipe(watch("./images/**/*"))
        .pipe(gulp.dest("./dist/images"));
});

// 合并
// gulp.task("buildjs", ["cleanjs"], function () {
//   return (
//     gulp
//       .src(jsArr)
//       .pipe(concat("./dist/js/main.js"))
//       .pipe(gulp.dest("./"))
//       // .pipe(rename({suffix: '.min'}))
//       // .pipe(uglify()) //压缩
//       .pipe(gulp.dest("./"))
//   ); //输出
// });

// 转移js
gulp.task('src-move', function() {
    gulp.src('js/*.js')
        .pipe(gulp.dest('dist/js'));
});

//  //压缩js文件
//  gulp.task('js-min',function(){
//   gulp.src('src/js/*.js')
//       .pipe(uglify())       
//       .pipe(rename({suffix:'.min'}))
//       .pipe(gulp.dest('dist/js'));
// });
let filterEvent = function(type) {
    return type === "change";
};
// 配置服务器
gulp.task("serve", function() {
    browserSync.init({
        // proxy: {
        //     target: "http://192.168.1.201:9080"
        // },
        server: {
            // proxy: "http://192.168.1.201:9080",
            baseDir: "./dist",
            index: 'index.html'
        },
        port: 8088,
        open: false,
        middleware: [middleware]
    });
    watch(["./stylus/"], function(e) {
        console.log(e.event);
        let type = e.event;
        gulp.start(["testStylus", "copyothercss", "rev"], function() {
            if (filterEvent(type)) {
                browserSync.reload();
            }
        });
    });
    // watch(["./js/"], function (e) {
    //   console.log(e.event);
    //   let type = e.event;
    //   gulp.start(["buildjs"], function () {
    //     if (filterEvent(type)) {
    //       browserSync.reload();
    //     }
    //   });
    // });
    watch(["./html/"], function(e) {
        console.log(e.event);
        let type = e.event;
        gulp.start(["html", "rev"], function() {
            if (filterEvent(type)) {
                browserSync.reload();
            }
        });
    });
    watch(["./images/"], function(e) {
        console.log(e.event);
        let type = e.event;
        console.log(e);
        if (type === "add") {
            gulp.start(["purecopyimages"], function() {
                // browserSync.reload(["*.png", "*.jpg", "*.jpeg"]);
            });
        } else if (type === 'unlink') {
            gulp.start(["copyimages"], function() {
                // browserSync.reload(["*.png", "*.jpg", "*.jpeg"]);
            });
        }
    });
});



// 压缩图片
gulp.task('miniimage', ['cleanimages'], function() {
    // 1. 找到图片
    gulp.src('images/**/*.*')
        // 2. 压缩图片
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 4,
            verbose: true
        }))
        // 3. 另存图片
        .pipe(gulp.dest('dist/images'))
});
gulp.task("default", [
    "clean",
    "testStylus",
    "copyimages",
    // "copyothercss",
    // "buildjs",
    // "js-min",
    "concat",
    "rev",
    "html",
    "src-move",
    "serve",
    "copyotherfont"
]);