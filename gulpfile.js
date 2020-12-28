let project_folder = require('path').basename(__dirname);
let source_folder = '#src';

let path= {
  //объект путей выходных файлов
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
    libs: project_folder + '/libs/',
  },
  //объект путей исходных файлов
  src: {
    html: [source_folder + '/*.html', '!'+source_folder + '/_*.html'],
    css: source_folder + '/scss/main.scss',
    js: source_folder + '/js/*.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico.webp}',
    fonts: source_folder + '/fonts/**/*.ttf',
    libs: source_folder + '/libs/**/*.*',
  },
  // объект постянный слушатель файлов
  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico.webp}',
  },
  //объект очищающий проект
  clean: './' + project_folder + '/' 
  
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileInclude = require('gulp-file-include'), //вместо PUG(на время)
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webpcss'),
    svgSprite = require('gulp-svg-sprite');

    
function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/'
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      })
    )
    .pipe( 
      group_media ()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 version'],
        cascade: true
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: '.min.css'
      })
      )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    //.pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: '.min.js'
      })
      )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interLaced: true,
        optimizationLavel: 3 // 0 or 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function fonts () {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(src(path.src.fonts))
};

function libs () {
  return src(path.src.libs)
    .pipe(dest(path.build.libs))
    .pipe(src(path.src.libs))
};

gulp.task('svgSprite', function () {
  return gulp.src([source_folder + '/iconssprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../icons/icons.svg', //название файла спрайта
          example: true
        }
      },
    }
    ))
    .pipe(dest(path.build.img))
})

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
} 

function clean () {
  return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts, libs));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.libs = libs;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;