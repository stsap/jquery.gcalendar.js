module.exports = (grunt) ->
    pkg = require './package.json'
    for key of pkg.devDependencies
        grunt.loadNpmTasks key if /^grunt-/.test key
 
    configuration =
        connect:
            livereload:
                options:
                    hostname: '*'
                    port: '8000'
                    base: 'stage/'
                    livereload: 30000
            test:
                options:
                    hostname: "*"
                    port: "9000"
                    base: "test/"
                    livereload: 30001
        watch:
            live:
                files: ["src/**/*", "stage/**/*"]
                options:
                    livereload: 30000
            test:
                files: ["test/**/*"]
                options:
                    livereload: 30001
        jshint:
            options:
                # http://www.jshint.com/docs/options/
                jshintrc: "validation_rules/jshintrules"
                force: true
            target: ["src/jquery.gcalendar.js"]
        qunit:
            all: ["test/**/*.html"]
        uglify:
            files:
                src: "src/jquery.gcalendar.js"
                dest: "release/jquery.gcalendar.min.js"
        clean:
            default: ["release/jquery.gcalendar.min.js"]

    grunt.initConfig(configuration)

#    grunt.registerTask "clean", ["clean"]
    grunt.registerTask "minify", ["uglify"]
    grunt.registerTask "test", ["jshint", "qunit"]
    grunt.registerTask "livetest", ["connect:test", "watch:test"]
    grunt.registerTask "default", ["connect:livereload", "watch:live"]
