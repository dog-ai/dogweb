/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var config = {
    app: 'src',
    dist: 'var/tmp/dist',
    build: 'var/tmp/build'
  };

  grunt.initConfig({

    // Project settings
    config: config,

    ngconstant: {
      options: {
        dest: '<%= config.build %>/scripts/constants.js',
        name: 'constants'
      },
      server: {
        constants: {
          DOG_AI: {
            environment: 'development'
          },
          ROLLBAR: {}

        }
      },
      dist: {
        constants: {
          DOG_AI: {
            environment: 'production'
          },
          ROLLBAR: {
            access_token: '9301a9f4397246c6b36c87fa224da83a',
            environment: 'production'
          }
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= config.app %>/scripts/**/*.js'],
        //tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/**/*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      sass: {
        files: ['<%= config.app %>/styles/**/*.{scss,sass}'],
        tasks: ['sass:server', 'autoprefixer:server']
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['ngconstant:server']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/**/*.html',
          '<%= config.build %>/styles/main.css',
          '<%= config.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: false,
          middleware: function (connect) {
            return [
              connect.static(config.build),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/src/styles',
                connect.static('./src/styles')
              ),
              connect.static(config.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('<%= config.build %>'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= config.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= config.app %>/scripts/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.build %>',
            '<%= config.dist %>'
          ]
        }]
      },
      server: '<%= config.build %>',
      build: '<%= config.build %>'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true,
        },
        files: [{
          expand: true,
          cwd: '<%= config.build %>/styles/',
          src: '**/*.css',
          dest: '<%= config.build %>/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.build %>/styles/',
          src: '**/*.css',
          dest: '<%= config.build %>/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      options: {
        cwd: ''
      },
      app: {
        src: ['<%= config.app %>/index.html'],
        ignorePath: /\.\.\//
      },
      /*test: {
       devDependencies: true,
       src: '<%= karma.unit.configFile %>',
       ignorePath: /\.\.\//,
       fileTypes: {
       js: {
       block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
       detect: {
       js: /'(.*\.js)'/gi
       },
       replace: {
       js: '\'{{filePath}}\','
       }
       }
       }
       },*/
      //sass: {
      //  src: ['<%= config.app %>/styles/**/*.{scss,sass}'],
      //  ignorePath: /(\.\.\/){1,2}bower_components\//
      //}
    },

    // Compiles Sass to CSS and generates necessary files if requested
    /*compass: {
     options: {
     sassDir: '<%= config.app %>/styles',
     cssDir: '<%= config.build %>/styles',
     generatedImagesDir: '<%= config.build %>/images/generated',
     imagesDir: '<%= config.app %>/images',
     javascriptsDir: '<%= config.app %>/scripts',
     fontsDir: '<%= config.app %>/styles/fonts',
     importPath: './bower_components',
     httpImagesPath: '/images',
     httpGeneratedImagesPath: '/images/generated',
     httpFontsPath: '/styles/fonts',
     relativeAssets: false,
     assetCacheBuster: false,
     raw: 'Sass::Script::Number.precision = 10\n'
     },
     dist: {
     options: {
     generatedImagesDir: '<%= config.dist %>/images/generated'
     }
     },
     server: {
     options: {
     sourcemap: true
     }
     }
     },*/

    sass: {
      options: {
        imagePath: '<%= config.app %>/images'
      },
      dist: {
        files: {
          '<%= config.build %>/styles/main.css': '<%= config.app %>/styles/main.scss'
        }
      },
      server: {
        options: {
          sourceMap: true
        },
        files: {
          '<%= config.build %>/styles/main.css': '<%= config.app %>/styles/main.scss'
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= config.dist %>/scripts/**/*.js',
          '<%= config.dist %>/styles/**/*.css',
          '<%= config.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= config.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= config.app %>/index.html',
      options: {
        staging: '<%= config.build %>',
        dest: '<%= config.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= config.dist %>/**/*.html'],
      css: ['<%= config.dist %>/styles/**/*.css'],
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles'
        ],
        patterns: {
          html: [
            [/<img[^\>]*[^\>\S]+ng-src=['"]([^'"\)#]+)(#.+)?["']/gm, 'Update the HTML with non standard ng-src attribute on img'],
            [/<img[^\>]*[^\>\S]+fallback-src=['"]([^'"\)#]+)(#.+)?["']/gm, 'Update the HTML with non standard fallback-src attribute on img']
          ]
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '**/*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeCommentsFromCDATA: true,

          processScripts: ['text/ng-template']
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: [
            '*.html'
          ],
          dest: '<%= config.dist %>'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.build %>/concat/scripts',
          src: '*.js',
          dest: '<%= config.build %>/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= config.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'images/**/*.{webp}',
            'styles/fonts/**/*.*'
          ]
        }, {
          expand: true,
          cwd: '<%= config.build %>/concat',
          dest: '<%= config.dist %>',
          src: ['**/*.*']
        }, {
          expand: true,
          cwd: '.',
          src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
          dest: '<%= config.dist %>'
        }, {
          expand: true,
          cwd: '<%= config.build %>/styles',
          dest: '<%= config.dist %>/styles',
          src: '**/*.css'
        }
        ]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'sass:server'
      ],
      test: [
        'sass'
      ],
      dist: [
        'sass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    inline_angular_templates: {
      dist: {
        options: {
          base: 'src',
          prefix: '/',
          unescape: {
            '&lt;': '<',
            '&gt;': '>',
            '&apos;': '\'',
            '&amp;': '&'
          }
        },
        files: {
          'var/tmp/dist/index.html': ['src/views/**/*.html']
        }
      }
    },

    exec: {
      deploy: {
        command: 'firebase deploy'
      }
    }
  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['dist', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'ngconstant:server',
      'concurrent:server',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('dist', [
    'clean:dist',
    'wiredep',
    'ngconstant:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer:dist',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'inline_angular_templates',
    'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('deploy', [
    'dist',
    'exec:deploy',
    'clean:build'
  ]);

  grunt.registerTask('default', [
    //'newer:jshint',
    //'test',
    'dist'
  ]);
};
